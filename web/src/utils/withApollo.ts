import { ApolloClient, InMemoryCache } from "@apollo/client";
import { NextPageContext } from "next";
import { createWithApollo } from "./createWithApollo";

const createClient = (ctx: NextPageContext) =>
    new ApolloClient({
        uri: process.env.NEXT_PUBLIC_API_URL as string,
        credentials: "include", //this will send the cookie on login (needs to be constant)
        headers: {
            cookie:
                (typeof window === "undefined" && ctx
                    ? ctx.req?.headers.cookie
                    : undefined) || "", //only pass cookie if not on server
        },
        cache: new InMemoryCache(),
        connectToDevTools: process.env.NODE_ENV === "development",
    });
export const withApollo = createWithApollo(createClient);
