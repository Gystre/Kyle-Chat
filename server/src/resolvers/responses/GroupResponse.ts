import { Field, ObjectType } from "type-graphql";
import { Group } from "../../entities/Group";
import { Response } from "./Response";

@ObjectType()
export class GroupResponse extends Response {
    @Field(() => Group, { nullable: true })
    group?: Group;
}
