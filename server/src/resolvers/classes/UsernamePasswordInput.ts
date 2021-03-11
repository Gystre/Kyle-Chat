import { InputType, Field } from "type-graphql";

//can create an object as an arg
//input types are used as arguments

@InputType()
export class UsernamePasswordInput {
    @Field()
    email: string;

    @Field()
    username: string;

    @Field()
    password: string;
}
