import { ApolloCache } from "@apollo/client";
import { Button, IconButton } from "@chakra-ui/button";
import { useColorMode } from "@chakra-ui/color-mode";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { Box, Flex, Stack } from "@chakra-ui/layout";
import {
    Popover,
    PopoverArrow,
    PopoverContent,
    PopoverTrigger,
} from "@chakra-ui/popover";
import { Portal } from "@chakra-ui/portal";
import { Tooltip } from "@chakra-ui/tooltip";
import { FriendRequestState } from "@kyle-chat/common";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { ContextMenuIcon } from "../components/ContextMenuIcon";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { PersonIcon } from "../components/PersonIcon";
import {
    useGetFriendsQuery,
    useGetIncomingFriendRequestsQuery,
    useGetOutgoingFriendRequestsQuery,
    useSendFriendRequestMutation,
    useSetFriendRequestStateMutation,
} from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

type FriendFetchType = "all" | "pending";

function invalidatePendingRequests(cache: ApolloCache<any>) {
    //clear all incoming and outgoing friend request queries
    cache.evict({
        fieldName: "getIncomingFriendRequests:{}",
    });
    cache.evict({
        fieldName: "getOutgoingFriendRequests:{}",
    });
    cache.evict({
        fieldName: "getFriends:{}",
    });
    cache.gc();
}

const Index = () => {
    useIsAuth();

    const { colorMode } = useColorMode();
    const nav_bgColor = { light: "gray.100", dark: "gray.700" };
    const contextMenu_bgColor = { light: "gray.200", dark: "gray.800" };
    const color = { light: "black", dark: "white" };

    const friendsQuery = useGetFriendsQuery();
    const incomingQuery = useGetIncomingFriendRequestsQuery();
    const outgoingQuery = useGetOutgoingFriendRequestsQuery();

    const [sendFriendRequest] = useSendFriendRequestMutation();
    const [setFriendRequestState] = useSetFriendRequestStateMutation();

    const [fetchType, setFetchType] = useState<FriendFetchType>("all");

    return (
        <Layout>
            {/* the little navbar at the top of the friends thing */}
            <Flex
                top={0}
                bg="gray.100"
                p={1}
                ml="auto"
                align="center"
                boxShadow="md"
                color={color[colorMode]}
                bgColor={nav_bgColor[colorMode]}
            >
                <Flex flex={1} m="2" align="center" maxW={800}>
                    <PersonIcon />
                    <b>Friends</b>
                    {/* these will be hooked up to queries that will grab the user's friends */}
                    <Button
                        ml="8"
                        mr="2"
                        bgColor={nav_bgColor[colorMode]}
                        onClick={() => setFetchType("all")}
                    >
                        All
                    </Button>
                    <Button
                        bgColor={nav_bgColor[colorMode]}
                        mr="2"
                        onClick={() => setFetchType("pending")}
                    >
                        Pending
                    </Button>
                    <Formik
                        initialValues={{ requesteeId: "" }}
                        onSubmit={async (values, { setErrors }) => {
                            const convertedFriendId = parseInt(
                                values.requesteeId
                            );

                            if (isNaN(convertedFriendId)) {
                                setErrors({
                                    requesteeId: "id needs to be a number",
                                });
                                return;
                            }

                            const response = await sendFriendRequest({
                                variables: {
                                    requesteeId: parseInt(values.requesteeId),
                                },
                                update: (cache, { data }) => {
                                    invalidatePendingRequests(cache);
                                },
                            });
                            if (response.data?.sendFriendRequest.errors) {
                                //there was error
                                //transform the returned message error array into a map that formik understands
                                setErrors(
                                    toErrorMap(
                                        response.data.sendFriendRequest.errors
                                    )
                                );
                            }
                        }}
                    >
                        {({ isSubmitting, values }) => (
                            <Form>
                                <InputField
                                    name="requesteeId"
                                    placeholder="da friend code"
                                    label=""
                                />
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    disabled={values.requesteeId.length == 0}
                                    variantColor="teal"
                                    bgColor="green.200"
                                    h="5"
                                >
                                    Add Friend
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Flex>
            </Flex>
            {(!friendsQuery.data && friendsQuery.loading) ||
            (!incomingQuery.data && incomingQuery.loading) ||
            (!outgoingQuery.data && outgoingQuery.loading) ? (
                <div>loading...</div>
            ) : (
                <Stack spacing={8}>
                    {fetchType == "all" ? (
                        <Box>
                            <b style={{ letterSpacing: "1px" }}>FRIENDS</b>
                            {friendsQuery.data.getFriends.map((f) => (
                                <Flex key={f.id} shadow="md" p={2}>
                                    {f.friendUser.username}
                                    <Box ml="auto">
                                        <Tooltip
                                            label="More"
                                            aria-label="More actions"
                                        >
                                            {/* the little context menu that allows people to make dms and remove them and stuff */}
                                            <Popover>
                                                <PopoverTrigger>
                                                    <IconButton
                                                        m={1}
                                                        float="right"
                                                        aria-label="reject"
                                                        _hover={{
                                                            backgroundColor:
                                                                contextMenu_bgColor[
                                                                    colorMode
                                                                ],
                                                        }}
                                                        icon={
                                                            <ContextMenuIcon />
                                                        }
                                                    />
                                                </PopoverTrigger>
                                                <Portal>
                                                    <PopoverArrow />
                                                    <PopoverContent>
                                                        <Button
                                                            borderSize="0"
                                                            color={
                                                                color[colorMode]
                                                            }
                                                        >
                                                            Message{" "}
                                                            {
                                                                f.friendUser
                                                                    .username
                                                            }{" "}
                                                            (does nothing right
                                                            now)
                                                        </Button>
                                                        <Button
                                                            borderSize="0"
                                                            color="red"
                                                            onClick={() => {
                                                                //probs should ask them if they mean to delete but too lazy heuheuhue
                                                                setFriendRequestState(
                                                                    {
                                                                        variables: {
                                                                            id:
                                                                                f.id,
                                                                            newState:
                                                                                FriendRequestState.Declined,
                                                                        },
                                                                        update: (
                                                                            cache,
                                                                            {
                                                                                data,
                                                                            }
                                                                        ) => {
                                                                            //INVALIDATE getFriends QUERIES
                                                                        },
                                                                    }
                                                                );
                                                            }}
                                                        >
                                                            Remove Friend
                                                        </Button>
                                                    </PopoverContent>
                                                </Portal>
                                            </Popover>
                                        </Tooltip>
                                    </Box>
                                </Flex>
                            ))}
                        </Box>
                    ) : (
                        <Box>
                            <div>
                                <b style={{ letterSpacing: "1px" }}>INCOMING</b>
                            </div>
                            {incomingQuery.data.getIncomingFriendRequests.map(
                                (f) => (
                                    <Flex key={f.id} shadow="md" p={2}>
                                        <Box m={1}>
                                            <b>{f.friendUser.username}</b>
                                        </Box>
                                        <Box ml="auto">
                                            <Tooltip
                                                label="Reject"
                                                aria-label="Reject the friend request"
                                            >
                                                <IconButton
                                                    m={1}
                                                    float="right"
                                                    aria-label="reject"
                                                    _hover={{ color: "red" }}
                                                    icon={<CloseIcon />}
                                                    onClick={() =>
                                                        setFriendRequestState({
                                                            variables: {
                                                                id: f.id,
                                                                newState:
                                                                    FriendRequestState.Declined,
                                                            },
                                                            update: (
                                                                cache,
                                                                { data }
                                                            ) => {
                                                                //invalidate pending fq query to force client to refetch
                                                                console.log(
                                                                    cache
                                                                );
                                                                invalidatePendingRequests(
                                                                    cache
                                                                );
                                                            },
                                                        })
                                                    }
                                                />
                                            </Tooltip>
                                            <Tooltip
                                                label="Accept"
                                                aria-label="Accept friend request"
                                            >
                                                <IconButton
                                                    m={1}
                                                    float="right"
                                                    aria-label="accept"
                                                    _hover={{ color: "green" }}
                                                    icon={<CheckIcon />}
                                                    onClick={() => {
                                                        setFriendRequestState({
                                                            variables: {
                                                                id: f.id,
                                                                newState:
                                                                    FriendRequestState.Accepted,
                                                            },
                                                            update: (
                                                                cache,
                                                                { data }
                                                            ) => {
                                                                //invalidate pending fq query to force client to refetch
                                                                console.log(
                                                                    cache
                                                                );
                                                                invalidatePendingRequests(
                                                                    cache
                                                                );
                                                            },
                                                        });
                                                    }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </Flex>
                                )
                            )}
                            <div>
                                <b style={{ letterSpacing: "1px" }}>OUTGOING</b>
                            </div>
                            {outgoingQuery.data.getOutgoingFriendRequests.map(
                                (f) => (
                                    <Flex key={f.id} shadow="md" p={2}>
                                        {f.friendUser.username}
                                        <Box ml="auto">
                                            <Tooltip
                                                label="Cancel"
                                                aria-label="Cancel the friend request"
                                            >
                                                <IconButton
                                                    m={1}
                                                    float="right"
                                                    aria-label="reject"
                                                    _hover={{ color: "red" }}
                                                    icon={<CloseIcon />}
                                                    onClick={() =>
                                                        setFriendRequestState({
                                                            variables: {
                                                                id: f.id,
                                                                newState:
                                                                    FriendRequestState.Canceled,
                                                            },
                                                            update: (
                                                                cache,
                                                                { data }
                                                            ) => {
                                                                //invalidate pending fq query to force client to refetch
                                                                console.log(
                                                                    cache
                                                                );
                                                                invalidatePendingRequests(
                                                                    cache
                                                                );
                                                            },
                                                        })
                                                    }
                                                />
                                            </Tooltip>
                                        </Box>
                                    </Flex>
                                )
                            )}
                        </Box>
                    )}
                </Stack>
            )}
        </Layout>
    );
};

export default withApollo({ ssr: true })(Index);
