import { Resolver, Query } from "type-graphql";

@Resolver()
export class HelloResolver {
    @Query(() => String) //return type
    hello() {
        return "hello world";
    }
}
