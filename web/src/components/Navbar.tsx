import { Box, Button, Flex, Heading, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useApolloClient } from "@apollo/client";
import { DarkModeSwitch } from "./DarkModeSwitch";

interface Props {}
export const Navbar: React.FC<Props> = () => {
    const [logout, { loading: logoutFetching }] = useLogoutMutation();
    const apolloClient = useApolloClient();
    const { data, loading } = useMeQuery({ skip: isServer() });
    let body = null;

    if (loading) {
        //data is loading
    } else if (!data?.me) {
        //user not logged in
        body = (
            <>
                <NextLink href="/login">
                    {/* using <Link> instead of <a> b/c it lets us do client side routing */}
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>Register</Link>
                </NextLink>
            </>
        );
    } else {
        //user is logged in
        body = (
            <Flex align="center">
                <DarkModeSwitch />

                <Box mr={2}>{data.me.username}</Box>
                <Button
                    onClick={async () => {
                        await logout();

                        //reset cache
                        await apolloClient.resetStore();
                    }}
                    variant={"link"}
                    isLoading={logoutFetching}
                >
                    Logout
                </Button>
            </Flex>
        );
    }
    return (
        <Flex
            zIndex={1}
            // position="sticky"
            top={0}
            bg="green.200"
            p={1}
            ml={"auto"}
            align="center"
        >
            <Flex flex={1} m="auto" align="center" maxW={800}>
                <NextLink href="/">
                    <Link>
                        <Heading>Kyle Chat</Heading>
                    </Link>
                </NextLink>
                <Box ml="auto">{body}</Box>
            </Flex>
        </Flex>
    );
};
