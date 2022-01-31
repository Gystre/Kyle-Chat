import { slateObjectCharacterLength } from "@kyle-chat/common";
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Group } from "../entities/Group";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { GroupResolver } from "./group";
import { MessageResponse } from "./responses/MessageResponse";

const MIN_TEXT_LENGTH = 0;
const MAX_TEXT_LENGTH = 2000;

const MAX_MESSAGE_FETCH_LIMIT = 50;

@ObjectType()
class PaginatedMessages {
    @Field(() => [Message])
    messages: Message[];

    @Field()
    hasMore: boolean;
}

@Resolver(Message)
export class MessageResolver {
    @FieldResolver(() => User)
    author(@Root() message: Message, @Ctx() { userLoader }: MyContext) {
        return userLoader.load(message.authorId);
    }

    @FieldResolver(() => Group)
    group(@Root() message: Message, @Ctx() { groupLoader }: MyContext) {
        return groupLoader.load(message.groupId);
    }

    @Query(() => PaginatedMessages)
    async getMessages(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        @Arg("groupId", () => Int) groupId: number,
        @Ctx() { req }: MyContext
    ): Promise<PaginatedMessages> {
        //make sure the user is apart of the group
        const { found } = await GroupResolver.isUserInGroup(
            req.session.userId,
            groupId
        );
        if (!found) {
            return {
                hasMore: false,
                messages: [],
            };
        }
        const realLimit = Math.min(MAX_MESSAGE_FETCH_LIMIT, limit);

        //add one to the amount of messages we're getting, if that 1 extra message exists then there is more data
        const realLimitPlusOne = realLimit + 1;

        const replacements: any[] = [realLimitPlusOne];

        //passed in a cursor? then take all posts after the timestamp
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        //performing a join between 2 queries, one post and one for the post itself
        //first line = reference the post table and select all the fields on it
        //inner join = using public.user b/c we have table conflicts when just using the user table
        const messages = await getConnection().query(
            `
            select p.*
            from message p
            ${
                cursor
                    ? `where p."createdAt" < $2 and p."groupId" = $3`
                    : `where p."groupId" = $2`
            }
            order by p."createdAt" DESC
            limit $1
          `,
            [...replacements, groupId]
        );

        return {
            messages: messages.slice(0, realLimit), //cut off that extra post we fetched before sending it to the user
            hasMore: messages.length === realLimitPlusOne,
        };
    }

    @Mutation(() => MessageResponse)
    @UseMiddleware()
    async sendMessage(
        //string will be a json-ified form of a slate object NOT THE TEXT ITSELF
        @Arg("text", () => String) text: string,

        //the group that the user is sending the message to
        @Arg("groupId", () => Int) groupId: number,

        @Arg("userId", () => Int) userId: number
    ): Promise<MessageResponse> {
        var characterCount = slateObjectCharacterLength(JSON.parse(text));

        if (characterCount == MIN_TEXT_LENGTH) {
            return {
                errors: [
                    {
                        field: "text",
                        message: `Your comment needs to be longer than ${MIN_TEXT_LENGTH} characters!`,
                    },
                ],
            };
        }

        if (characterCount > MAX_TEXT_LENGTH) {
            return {
                errors: [
                    {
                        field: "text",
                        message: `Your comment can't be longer than ${MAX_TEXT_LENGTH} characters!`,
                    },
                ],
            };
        }

        //make sure the user is in the group
        const result = await GroupResolver.isUserInGroup(userId, groupId);

        if (!result.found) {
            return {
                errors: [
                    { field: "", message: "you are not in the this group" },
                ],
            };
        }

        const userPromise = User.findOne(userId);
        const groupPromise = Group.findOne(groupId);

        const [user, group] = await Promise.all([userPromise, groupPromise]);

        return {
            message: await Message.create({
                authorId: userId,
                author: user,

                groupId,
                group,

                text,
            }).save(),
        };
    }
}
