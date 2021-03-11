import { User } from "../../entities/User";
import { ObjectType, Field } from "type-graphql";
import { Response } from "./Response";

//object types are returned from the mutations
//the return response from the mutation, will be optional (?) so that it's one or the other
@ObjectType()
export class UserResponse extends Response {
    @Field(() => User, { nullable: true })
    user?: User;
}
