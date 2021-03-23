import { Friend } from "../entities/Friend";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
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
import { FriendResponse } from "./responses/FriendResponse";
import { validateFriend } from "./validation/validateFriend";
import { FriendRequestState } from "@kyle-chat/common";

/*
Note:
Removed friends are considered FriendRequestState.Declined
*/

@Resolver(Friend)
export class FriendResolver {
    //will always fetch the creator
    @FieldResolver(() => User)
    friendUser(@Root() friend: Friend, @Ctx() { req, userLoader }: MyContext) {
        //figure out which one is the friend
        if (req.session.userId == friend.requesteeId) {
            //you were the subject of the friend request, so get the other guy's name
            //batch all sql requests into a single one using dataloader
            return userLoader.load(friend.requesterId);
        } else if (req.session.userId == friend.requesterId) {
            //you sent the friend request, so get the other guy's name
            return userLoader.load(friend.requesteeId);
        }

        return null;
    }

    //might be able to get other people's friends?
    //so will probs need some way to only see friends that you're friends with
    //get the requests that YOU sent that HAVEN'T been accepted
    @UseMiddleware(isAuth)
    @Query(() => [Friend])
    async getOutgoingFriendRequests(
        @Ctx() { req }: MyContext
    ): Promise<Friend[]> {
        const users = await getConnection()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .leftJoinAndSelect("friend.requestee", "user")
            .where("friend.requesterId = :userId and friend.state = :state", {
                userId: req.session.userId,
                state: FriendRequestState.Pending,
            })
            .orderBy('friend."createdAt"', "DESC")
            .getMany();

        return users;
    }

    //get requests OTHER people have sent to YOU
    @UseMiddleware(isAuth)
    @Query(() => [Friend])
    async getIncomingFriendRequests(
        @Ctx() { req }: MyContext
    ): Promise<Friend[]> {
        const users = await getConnection()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .leftJoinAndSelect("friend.requestee", "user")
            .where("friend.requesteeId = :userId and friend.state = :state", {
                userId: req.session.userId,
                state: FriendRequestState.Pending,
            })
            .orderBy('friend."createdAt"', "DESC")
            .getMany();

        return users;
    }

    //get friends that have ACCEPTED your request
    @UseMiddleware(isAuth)
    @Query(() => [Friend])
    async getFriends(@Ctx() { req }: MyContext): Promise<Friend[]> {
        const users = await getConnection()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .leftJoinAndSelect("friend.requestee", "user")
            .where(
                "(friend.requesterId = :userId or friend.requesteeId = :userId) and friend.state = :state",
                {
                    userId: req.session.userId,
                    state: FriendRequestState.Accepted,
                }
            )
            .orderBy('friend."createdAt"', "DESC")
            .getMany();

        return users;
    }

    @Mutation(() => FriendResponse)
    @UseMiddleware(isAuth)
    async sendFriendRequest(
        @Arg("requesteeId", () => Int) otherId: number,
        @Ctx() { req }: MyContext
    ): Promise<FriendResponse> {
        const errors = await validateFriend(req.session.userId, otherId);
        if (errors) {
            return { errors };
        }

        //make sure the user doesn't have a pending request and they aren't already accepted
        //TODO: cut this down to a single sql statement
        //it fetches the whole user when it could just return a bool if it found it
        const found = await Friend.findOne({
            where: { requesteeId: otherId, requesterId: req.session.userId },
        });

        if (found?.state == FriendRequestState.Pending) {
            return {
                errors: [
                    {
                        field: "requesteeId",
                        message:
                            "you already have a pending request to this person",
                    },
                ],
            };
        } else if (found?.state == FriendRequestState.Accepted) {
            return {
                errors: [
                    {
                        field: "requesteeId",
                        message: "this person is already ur friend",
                    },
                ],
            };
        }

        //if the user tries to send a request to someone who has already sent them a request, give them an error
        const otherFound = await Friend.findOne({
            where: {
                requesteeId: req.session.userId,
                requesterId: otherId,
            },
        });
        if (otherFound?.state == FriendRequestState.Pending) {
            return {
                errors: [
                    {
                        field: "requesteeId",
                        message:
                            "this person already sent u a request go accept it bruh",
                    },
                ],
            };
        }

        //check if a relationship between these two users have already been established
        //this can happen if a user removes a friend, then they add each other back, modify that row and avoid creating a new one
        const existingRelationship = await Friend.findOne({
            where: [
                //we need to check both b/c an existing relationship can be either way
                { requesteeId: otherId, requesterId: req.session.userId },
                { requesteeId: req.session.userId, requesterId: otherId },
            ],
        });

        if (existingRelationship) {
            //an existing relationship exists so update that row and return the found relationship
            await getConnection().query(
                `
                update friend
                set state = $1
                where id=$2
            `,
                [FriendRequestState.Pending, existingRelationship.id]
            );

            return { friend: existingRelationship };
        }

        //TODO: fix double fetching here, should be using the user fetched from the validateFriend
        const requestee = await User.findOne(otherId);

        //create a new entry in the table
        const result = await Friend.create({
            requesterId: req.session.userId,
            requestee,
        }).save();

        return {
            friend: result,
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
                where id = $2 and "requesteeId" = $3 or "requesterId" = $3
                `,
            [newState, id, req.session.userId]
        );

        return true;
    }
}
