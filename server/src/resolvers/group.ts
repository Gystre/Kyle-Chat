import { GroupType } from "@kyle-chat/common";
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
import { Group } from "../entities/Group";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { FriendResolver } from "./friend";
import { GroupResponse } from "./responses/GroupResponse";

@Resolver(Group)
export class GroupResolver {
    //field resolver to grab creator user
    @FieldResolver(() => User)
    creator(@Root() group: Group, @Ctx() { userLoader }: MyContext) {
        return userLoader.load(group.creatorId);
    }

    //allows client to fetch the users of a group
    @FieldResolver(() => [User])
    users(@Root() group: Group, @Ctx() { userLoader }: MyContext) {
        var userIds: number[] = [];
        for (var i = 0; i < group.users.length; i++) {
            userIds.push(group.users[i].id);
        }

        //need a sort here to ensure that the ids come in order
        //would be able to avoid this if i structured the data better so i can get the other person for dms:/
        userIds.sort();

        return userLoader.loadMany(userIds);
    }

    //get the groups that the user is apart of (dms, group dms, and the chat rooms they're apart of)
    @Query(() => [Group])
    @UseMiddleware(isAuth)
    async getGroups(@Ctx() { req }: MyContext): Promise<Group[]> {
        // const res = await getConnection().query(
        //     `
        //     SELECT * FROM public."group"
        //     join group_users_user as jt on jt."userId" = "userId"
        //     where jt."userId" = $1 and id = jt."groupId"
        // `,
        //     [req.session.userId]
        // );

        //have to query the group ids that the user is apart of and then query that again to get the users in the group
        //this doesn't scale up to chat rooms that are hundreds of thousands of users large as ur gonna fetch ALL of them
        //get around this with only fetching the other users for groups that are dms but would require a third sql statement :P
        const ids = await getConnection()
            .getRepository(Group)
            .createQueryBuilder("group")
            .leftJoinAndSelect("group.users", "user")
            .select(["group.id"])
            .where("user.id = :userId", {
                userId: req.session.userId,
            })
            .getMany();

        const groupIds: number[] = [];
        for (var i = 0; i < ids.length; i++) groupIds.push(ids[i].id);

        return await getConnection()
            .getRepository(Group)
            .createQueryBuilder("group")
            .leftJoinAndSelect("group.users", "user")
            .where("group.id IN (:...groupIds)", { groupIds })
            .orderBy("group.updatedAt", "DESC")
            .getMany();
    }

    //use this function to check if a user is in a group
    //function will give you access to the the error response, found group, and whether or not it found the user in there
    static async isUserInGroup(
        userId: number,
        groupId: number
    ): Promise<{
        group?: Group;
        resp_groupDNE?: GroupResponse;
        found?: boolean;
    }> {
        const res = await getConnection()
            .getRepository(Group)
            .createQueryBuilder("group")
            .leftJoinAndSelect("group.users", "user")
            .where("group.id = :groupId", {
                groupId,
            })
            .getMany();

        //the group of the id doesn't exist
        if (res.length == 0) {
            return {
                resp_groupDNE: {
                    errors: [
                        {
                            field: "other",
                            message:
                                "there is no group by that id that exists you dumbass",
                        },
                    ],
                },
            };
        }

        //just use the first entry in the array b/c there can only be one group with the id
        const users = res[0].users;

        var found = false;
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == userId) {
                found = true;
                break;
            }
        }

        return { found, group: res[0] };
    }

    //get details about a group, checking if the logged in user is apart of the group is currently O(n) but I feel like it could be O(1), just not sure how...
    @Query(() => GroupResponse)
    @UseMiddleware(isAuth)
    async getGroup(
        @Arg("groupId", () => Int) groupId: number,
        @Ctx() { req }: MyContext
    ): Promise<GroupResponse> {
        const result = await GroupResolver.isUserInGroup(
            req.session.userId,
            groupId
        );

        //see if group even exists
        if (result.resp_groupDNE) {
            return result.resp_groupDNE;
        }

        //see if user is apart of the group
        if (!result.found) {
            return {
                errors: [
                    {
                        field: "other",
                        message:
                            "u don't even belong to this group, how did you even get here???",
                    },
                ],
            };
        }

        return { group: result.group };
    }

    //generic createGroup that will be used to create group dms, large chat rooms, and dm group
    //DO NOT USE THIS DIRECTLY, THERE IS NO VALIDATION FOR otherids LENGTH, THAT COMES WITH IT'S DERIVATIVE FUNCTIONS
    @Mutation(() => GroupResponse)
    @UseMiddleware(isAuth)
    async createGroup(
        //won't include the logged in users' id
        @Arg("otherIds", () => [Int]) otherIds: number[],

        @Arg("name", () => String) name: string,

        @Arg("type", () => Int) type: GroupType,

        //req.session.userId = the creator of the group
        @Ctx() { req }: MyContext
    ): Promise<GroupResponse> {
        if (name.length === 0)
            return {
                errors: [
                    {
                        field: "name",
                        message: "group name can't be empty",
                    },
                ],
            };

        if (name.length > 100)
            return {
                errors: [
                    {
                        field: "name",
                        message:
                            "name of group can't be longer than 100 characters",
                    },
                ],
            };

        //query the creator's friends to make sure that all the ids match, no more and no less
        //TODO: find some way to reuse the logic from the friend resolver?
        const creatorFriends = await FriendResolver.getFriendsAsObject(
            req.session.userId
        );

        //need to get the users that aren't the logged in guy from the creatorFriends array
        var friendUsers: number[] = [];

        creatorFriends.map((value) => {
            if (req.session.userId != value.smallerUserId) {
                friendUsers.push(value.smallerUserId);
            } else {
                friendUsers.push(value.biggerUserId);
            }
        });

        //find the common elements between the arrays
        //this iterates over each array in parallel and finds the elements that are equal to each other
        const common: number[] = [];
        friendUsers.sort();
        otherIds.sort();

        var friendUsersIndex = 0,
            otherIdsIndex = 0;
        while (
            friendUsersIndex < friendUsers.length &&
            otherIdsIndex < otherIds.length
        ) {
            if (friendUsers[friendUsersIndex] == otherIds[otherIdsIndex]) {
                common.push(friendUsers[friendUsersIndex]);
                friendUsersIndex++;
                otherIdsIndex++;
            } else if (
                friendUsers[friendUsersIndex] < otherIds[otherIdsIndex]
            ) {
                friendUsersIndex++;
            } else {
                otherIdsIndex++;
            }
        }

        //kind of hacky, remove all common ids from otherIds to get the ones that aren't the friends
        //there is 100% a way more elegant solution than what I came up with (find common and delete all common :P) but it works for now
        const difference: number[] = [...otherIds];
        for (var i = 0; i < common.length; i++) {
            difference.splice(difference.indexOf(common[i]), 1);
        }

        //TODO: print out the names of the people who aren't ur friends instead of printing out the ids
        if (difference.length > 0) {
            return {
                errors: [
                    {
                        field: "usersToAdd",
                        message: "users " + difference + " aren't ur friends",
                    },
                ],
            };
        }

        //make sure we are also putting the creator of the group into the list of users
        const users = await User.findByIds([...otherIds, req.session.userId]);

        //choose between 2 different colored stolen discord images
        let imageUrl = "";
        if (type == GroupType.GroupDM) {
            imageUrl =
                Math.random() < 0.5
                    ? "https://discord.com/assets/773616c3c8a7e21f8a774eb0d5625436.png"
                    : "https://discord.com/assets/b8912961ea6ab32f0655d583bbc26b4f.png";
        }

        return {
            group: await Group.create({
                name,
                type,
                creatorId: req.session.userId,
                users,
                imageUrl,
            }).save(),
        };
    }

    //create a direct message chat between 2 people, a "DM"
    @Mutation(() => GroupResponse)
    @UseMiddleware(isAuth)
    async createDirectMessage(
        @Arg("otherId", () => Int) otherId: number,
        @Ctx() context: MyContext
    ): Promise<GroupResponse> {
        let name = "";
        if (context.req.session.userId < otherId) {
            name = "dm_" + context.req.session.userId + "_" + otherId;
        } else {
            name = "dm_" + otherId + "_" + context.req.session.userId;
        }

        //check to make sure that the dm doesn't already exist and if it does, just return it
        const exists = await getConnection()
            .getRepository(Group)
            .createQueryBuilder("group")
            .leftJoinAndSelect("group.users", "user")
            .where("name = :name and type = :type", {
                name,
                type: GroupType.DM,
            })
            .getMany();

        if (exists.length > 0) {
            return { group: exists[0] }; //just return the first one cuz there isn't going to be more than one
        }

        return this.createGroup([otherId], name, GroupType.DM, context);
    }

    //create a direct message group chat between 3-10 people, a "group DM"
    @Mutation(() => GroupResponse)
    @UseMiddleware(isAuth)
    async createDirectMessageGroup(
        @Arg("otherIds", () => [Int]) otherIds: number[],
        @Arg("name", () => String) name: string,
        @Ctx() context: MyContext
    ): Promise<GroupResponse> {
        if (otherIds.length < 3) {
            return {
                errors: [
                    {
                        field: "usersToAdd",
                        message:
                            "you must have more than 3 people to create a group",
                    },
                ],
            };
        }

        if (otherIds.length > 10) {
            return {
                errors: [
                    {
                        field: "usersToAdd",
                        message:
                            "you can't add more than 10 people to a group chat",
                    },
                ],
            };
        }

        return this.createGroup(otherIds, name, GroupType.GroupDM, context);
    }
}
