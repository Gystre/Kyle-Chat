import { ObjectType, Field } from "type-graphql";
import { FieldError } from "../classes/FieldErrorObject";

@ObjectType()
export abstract class Response {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}
