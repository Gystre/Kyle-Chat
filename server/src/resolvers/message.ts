import { slateObjectCharacterLength } from "@kyle-chat/common";
import {
    Arg,
    Ctx,
    FieldResolver,
    Int,
    Mutation,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { Group } from "../entities/Group";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { GroupResolver } from "./group";
import { MessageResponse } from "./responses/MessageResponse";

const MIN_TEXT_LENGTH = 0;
const MAX_TEXT_LENGTH = 2000;

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

    @Mutation(() => MessageResponse)
    @UseMiddleware()
    async sendMessage(
        //string will be a json-ified form of a slate object NOT THE TEXT ITSELF
        @Arg("text", () => String) text: string,

        //the group that the user is sending the message to
        @Arg("groupId", () => Int) groupId: number,

        @Ctx() { req }: MyContext
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
        const result = await GroupResolver.isUserInGroup(
            req.session.userId,
            groupId
        );

        if (!result.found) {
            return {
                errors: [
                    { field: "", message: "you are not in the this group" },
                ],
            };
        }

        const userPromise = User.findOne(req.session.userId);
        const groupPromise = Group.findOne(groupId);

        const [user, group] = await Promise.all([userPromise, groupPromise]);

        return {
            message: await Message.create({
                authorId: req.session.userId,
                author: user,

                groupId,
                group,

                text,
            }).save(),
        };
    }
}
