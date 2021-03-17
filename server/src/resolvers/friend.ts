import { Friend } from "../entities/Friend";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import {
    Arg,
    Ctx,
    Int,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { FriendResponse } from "./responses/FriendResponse";
import { Response } from "./responses/Response";
import { validateFriend } from "./validation/validateFriend";
import { FriendRequestState } from "@kyle-chat/common";

@Resolver(Friend)
export class FriendResolver {
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
                "friend.requesterId = :userId or friend.requesteeId = :userId and friend.state = :state",
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
        @Arg("requesteeId", () => Int) requesteeId: number,
        @Ctx() { req }: MyContext
    ): Promise<FriendResponse> {
        const errors = await validateFriend(req.session.userId, requesteeId);
        if (errors) {
            return { errors };
        }

        //make sure the user doesn't have a pending request and they aren't already accepted
        //TODO: cut this down to a single sql statement
        //it fetches the whole user when it could just return a bool if it found it
        const found = await Friend.findOne({
            where: { requesteeId, requesterId: req.session.userId },
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

        //TODO: fix double fetching here, should be using the user fetched from the validateFriend
        const requestee = await User.findOne(requesteeId);

        //create a new entry in the table
        const result = await Friend.create({
            requesterId: req.session.userId,
            requestee,
        }).save();

        return {
            friend: result,
        };
    }

    //for the requester to cancel an outgoing friend request
    @Mutation(() => Response)
    @UseMiddleware(isAuth)
    async setFriendRequestState(
        @Arg("requesteeId", () => Int) requesteeId: number,
        @Ctx() { req }: MyContext,
        @Arg("newState", () => Int) newState: FriendRequestState
    ): Promise<Response> {
        const errors = await validateFriend(req.session.userId, requesteeId);
        if (errors) {
            return { errors };
        }

        await getConnection().transaction(async (tm) => {
            await tm.query(
                `
                update friend 
                set state = $1
                where "requesteeId" = $2 and "requesterId" = $3
                `,
                [newState, requesteeId, req.session.userId]
            );
        });

        //an empty error array means that it happened successfully
        return { errors: [] };
    }
}
