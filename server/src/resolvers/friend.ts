import { FriendRequestState } from "@kyle-chat/common";
import { MyContext } from "src/types";
import {
    Arg,
    Ctx,
    FieldResolver,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Friend } from "../entities/Friend";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { FriendResponse } from "./responses/FriendResponse";
import { validateFriend } from "./validation/validateFriend";

/*
Note:
Removed friends (u delete them from ur friend list) are considered FriendRequestState.Declined
*/

@Resolver(Friend)
export class FriendResolver {
    //resolve the user entity as smallerIdUser so that is accessible as a js object
    @FieldResolver(() => User)
    @UseMiddleware(isAuth)
    smallerIdUser(@Root() friend: Friend, @Ctx() { userLoader }: MyContext) {
        //don't fetch the logged in user
        //TODO: getting cannot return null for non nullable field even though labeled the column as nullable
        // if (req.session.userId == friend.smallerUserId) return null;

        //this thing batches all sql requests into a single one using the dataloader
        return userLoader.load(friend.smallerUserId);
    }

    @FieldResolver(() => User)
    @UseMiddleware(isAuth)
    biggerIdUser(@Root() friend: Friend, @Ctx() { userLoader }: MyContext) {
        // if (req.session.userId == friend.biggerUserId) return null;

        return userLoader.load(friend.biggerUserId);
    }

    //get the requests that YOU sent that HAVEN'T been accepted
    @UseMiddleware(isAuth)
    @Query(() => [Friend])
    async getOutgoingFriendRequests(
        @Ctx() { req }: MyContext
    ): Promise<Friend[]> {
        return await getConnection()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .where(
                "(friend.smallerUserId = :userId or friend.biggerUserId = :userId) and friend.state = :state and friend.recentActionUserId = :userId",
                {
                    userId: req.session.userId,
                    state: FriendRequestState.Pending,
                }
            )
            .orderBy('friend."createdAt"', "DESC")
            .getMany();
    }

    //get requests OTHER people have sent to YOU
    @UseMiddleware(isAuth)
    @Query(() => [Friend])
    async getIncomingFriendRequests(
        @Ctx() { req }: MyContext
    ): Promise<Friend[]> {
        return await getConnection()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .where(
                "(friend.smallerUserId = :userId or friend.biggerUserId = :userId) and friend.state = :state and friend.recentActionUserId != :userId",
                {
                    userId: req.session.userId,
                    state: FriendRequestState.Pending,
                }
            )
            .orderBy('friend."createdAt"', "DESC")
            .getMany();
    }

    //used to get the friends of a user
    //abstracted cuz need to resuse this logic in the group resolver
    static async getFriendsAsObject(userId: number): Promise<Friend[]> {
        return await getConnection()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .where(
                "(friend.smallerUserId = :userId or friend.biggerUserId = :userId) and friend.state = :state",
                {
                    userId,
                    state: FriendRequestState.Accepted,
                }
            )
            .orderBy('friend."createdAt"', "DESC")
            .getMany();
    }

    //get friends that have ACCEPTED your request
    @UseMiddleware(isAuth)
    @Query(() => [Friend])
    async getFriends(@Ctx() { req }: MyContext): Promise<Friend[]> {
        //fetches both relationships somehow, probably cuz of the resolvers
        return await FriendResolver.getFriendsAsObject(req.session.userId);
    }

    @Mutation(() => FriendResponse)
    @UseMiddleware(isAuth)
    async sendFriendRequest(
        @Arg("otherId", () => Int) otherId: number,
        @Ctx() { req }: MyContext
    ): Promise<FriendResponse> {
        const errors = await validateFriend(req.session.userId, otherId);
        if (errors) {
            return { errors };
        }

        //see if there is already a link between the two
        //we can use this field, if found, to determine whether or not the person has a pending request, they already sent a request, or if they're already a friend
        //CRAZYY I KNOW RIGHT????
        const found = await Friend.findOne({
            where: [
                { biggerUserId: otherId, smallerUserId: req.session.userId },
                { biggerUserId: req.session.userId, smallerUserId: otherId },
            ],
        });

        if (found?.state == FriendRequestState.Pending) {
            return {
                errors: [
                    {
                        field: "otherId",
                        message:
                            found.recentActionUserId == req.session.userId
                                ? "you already have a pending request to this person"
                                : "this person has already sent you a request, go accept it",
                    },
                ],
            };
        } else if (found?.state == FriendRequestState.Accepted) {
            return {
                errors: [
                    {
                        field: "otherId",
                        message: "this person is already ur friend",
                    },
                ],
            };
        }

        //make sure the bigger id gets placed into the bigger id row
        const biggerUserId =
            req.session.userId > otherId ? req.session.userId : otherId;
        const smallerUserId =
            req.session.userId < otherId ? req.session.userId : otherId;

        const [smallerUser, biggerUser] = await User.findByIds(
            [smallerUserId, biggerUserId],
            { order: { id: "ASC" } } //make sure they come in least -> greatest
        );

        //create a new entry in the table
        return {
            friend: await Friend.create({
                biggerUserId,
                biggerIdUser: biggerUser,

                smallerUserId,
                smallerIdUser: smallerUser,

                //the most recent user to update this row will be the person who sends the request
                recentActionUserId: req.session.userId,
            }).save(),
        };
    }

    //set the state and make sure the person is actually a part of the exchange
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async setFriendRequestState(
        @Arg("id", () => Int) id: number,
        @Arg("newState", () => Int) newState: FriendRequestState,
        @Ctx() { req }: MyContext
    ) {
        await getConnection().query(
            `
                update friend 
                set state = $1
                where id = $2 and ("smallerUserId" = $3 or "biggerUserId" = $3)
                `,
            [newState, id, req.session.userId]
        );

        return true;
    }
}
