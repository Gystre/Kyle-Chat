import { useColorMode } from "@chakra-ui/color-mode";
import { Box, Flex, Link, Stack, Text } from "@chakra-ui/layout";
import { Grid, Avatar, CloseButton } from "@chakra-ui/react";
import React from "react";
import { Navbar } from "./Navbar";
import NextLink from "next/link";
import { PersonIcon } from "./PersonIcon";
import { ChatIcon } from "@chakra-ui/icons";
import { useGetGroupsQuery, useMeQuery, User } from "../generated/graphql";
import { GroupType } from "@kyle-chat/common";
import { AvatarDisplay } from "./AvatarDisplay";

/*
Any children we pass into this component will be placed into the right side of the 
two column layout we have
*/

interface Props {}
export const Layout: React.FC<Props> = ({ children }) => {
    const { colorMode } = useColorMode();
    const leftColumn_bgColor = { light: "gray.200", dark: "gray.800" };
    const rightColumn_bgColor = { light: "gray.50", dark: "gray.600" };
    const color = { light: "black", dark: "white" };

    const { data, loading } = useGetGroupsQuery();
    const meQuery = useMeQuery();

    let groups = null;

    if (!meQuery.loading && meQuery?.data.me) {
        groups = data?.getGroups.map((group) => {
            //for dms, grab the other user
            let otherUser: Partial<User> | null = null;

            if (group.type == GroupType.DM) {
                //this is a horrible band aid but i don't feel like writing more back end code...
                //we have no way of knowing which user is the other guy from the request so we have to do a little if statement magic :D
                //dm_1_2 <---- substringing that
                const smallerId = group.name.substring(3, 4);
                otherUser =
                    meQuery.data.me.id != parseInt(smallerId)
                        ? group.users[0]
                        : group.users[1];
            }

            return (
                <NextLink key={group.id} href={"/groups/" + group.id}>
                    <Link>
                        <AvatarDisplay
                            imageUrl={
                                group.type == GroupType.DM
                                    ? otherUser.imageUrl
                                    : group.imageUrl
                            }
                            name={
                                group.type == GroupType.DM
                                    ? otherUser.username
                                    : group.name
                            }
                            closeButton
                        />
                    </Link>
                </NextLink>
            );
        });
    }

    return (
        <>
            <Navbar />
            <Grid templateColumns="200px 1fr">
                <Box
                    h="100vh"
                    bg={leftColumn_bgColor[colorMode]}
                    color={color[colorMode]}
                >
                    <NextLink href="/friends">
                        <Link cursor="pointer">
                            <Box
                                p="3"
                                m="3"
                                textAlign="left"
                                borderRadius="3px"
                                _hover={{ bgColor: "green.200" }}
                            >
                                <PersonIcon />
                                Friends
                            </Box>
                        </Link>
                    </NextLink>
                    <NextLink href="/chat">
                        <Link cursor="pointer">
                            <Box
                                p="3"
                                m="3"
                                textAlign="left"
                                borderRadius="3px"
                                _hover={{ bgColor: "green.200" }}
                            >
                                <ChatIcon w="8" h="8" mr="3" />
                                Main Chat!
                            </Box>
                        </Link>
                    </NextLink>
                    <Box fontSize="small" mt={5} ml={6} mb={2}>
                        <b style={{ letterSpacing: "1px" }}>DIRECT MESSAGES</b>

                        {/* below here will be a list of users that are fetched when the page is loaded */}
                        {!data && loading ? (
                            <div>loading groups...</div>
                        ) : (
                            <Stack spacing={2}>{groups}</Stack>
                        )}
                    </Box>
                </Box>
                <Box
                    bgColor={rightColumn_bgColor[colorMode]}
                    color={color[colorMode]}
                >
                    {children}
                </Box>
            </Grid>
        </>
    );
};
