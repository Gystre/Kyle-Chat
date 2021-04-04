import { Group } from "../entities/Group";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {
    Arg,
    Ctx,
    Field,
    Int,
    Mutation,
    ObjectType,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { Friend } from "../entities/Friend";
import { FriendRequestState } from "@kyle-chat/common";
import { getConnection } from "typeorm";
import { User } from "../entities/User";

//different from the other responses as it just returns a string as an error
//should probably find a better name for this...
@ObjectType()
class GroupResponse {
    @Field(() => Group, { nullable: true })
    group?: Group;

    @Field(() => String, { nullable: true })
    error?: string;
}

@Resolver(Group)
export class GroupResolver {
    @Mutation(() => GroupResponse)
    @UseMiddleware(isAuth)
    async createGroup(
        //won't include the logged in users' id
        @Arg("ids", () => [Int]) otherIds: number[],

        @Arg("name", () => String) name: string,

        //req.session.userId = the creator of the group
        @Ctx() { req }: MyContext
    ): Promise<GroupResponse> {
        //fetch all user ids, this will help filter out the ones that don't exist
        const users = await User.findByIds(otherIds);

        //query the creator's friends to make sure that all the ids match, no more and no less
        //TODO: find some way to reuse the logic from the friend resolver?
        const creatorFriends = await getConnection()
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

        // would like to fetch these in parallel and continue when they've been fetched but will have to figure that out later
        // await Promise.all([users, creatorFriends]);

        if (creatorFriends.length !== users.length) {
            return {
                error:
                    "You can only create a group with people who are your friends",
            };
        }

        //FUTURE KYLE: SOMETHING GOING WRONG HERE, LOG OUTPUT

        console.log(creatorFriends);

        //check to make sure the two arrays match
        //O(n^2) complexity but idgaf, total for either array shouldn't be larger than 10 or smthn
        for (var i = 0; i < creatorFriends.length; i++) {
            for (var c = 0; c < users.length; c++) {
                if (creatorFriends[i].requestee.id != users[c].id) {
                    return {
                        error:
                            "You can only create a group with people who are your friends",
                    };
                }
            }
        }

        let creator: User | null = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == req.session.userId) {
                creator = users[i];
            }
        }

        if (!creator) {
            return {
                error:
                    "Couldn't find the creator entity inside of the passed in otherIds array",
            };
        }

        //return Group.create
        return {
            group: Group.create({
                name,
                creatorId: req.session.userId,
                creator,
                users,
            }),
        };
    }
}
