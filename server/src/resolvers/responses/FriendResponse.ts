import { Friend } from "../../entities/Friend";
import { ObjectType, Field } from "type-graphql";
import { Response } from "./Response";

@ObjectType()
export class FriendResponse extends Response {
    @Field(() => Friend, { nullable: true })
    friend?: Friend;
}
