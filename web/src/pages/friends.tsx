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
import { useRouter } from "next/router";
import React, { useState } from "react";
import { ContextMenuIcon } from "../components/ContextMenuIcon";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { PersonIcon } from "../components/PersonIcon";
import {
    useCreateDirectMessageMutation,
    useGetFriendsQuery,
    useGetIncomingFriendRequestsQuery,
    useGetOutgoingFriendRequestsQuery,
    useMeQuery,
    useSendFriendRequestMutation,
    useSetFriendRequestStateMutation,
} from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { toErrorMap } from "../utils/toErrorMap";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

type FriendFetchType = "all" | "pending";

const Index = () => {
    useIsAuth();

    const router = useRouter();

    const meQuery = useMeQuery({ skip: isServer() });

    //user specific queries are errored out thanks to typeorm middleware isAuth() and redirected to login page thanks to useIsAuth()
    const friendsQuery = useGetFriendsQuery();
    const incomingQuery = useGetIncomingFriendRequestsQuery();
    const outgoingQuery = useGetOutgoingFriendRequestsQuery();

    const [sendFriendRequest] = useSendFriendRequestMutation();
    const [setFriendRequestState] = useSetFriendRequestStateMutation();
    const [createDirectMessage] = useCreateDirectMessageMutation();

    const { colorMode } = useColorMode();
    const nav_bgColor = { light: "gray.100", dark: "gray.700" };
    const contextMenu_bgColor = { light: "gray.200", dark: "gray.800" };
    const color = { light: "black", dark: "white" };

    const [fetchType, setFetchType] = useState<FriendFetchType>("all");

    let body;

    if (meQuery.loading) {
        //loading
    } else if (!meQuery.data?.me) {
        //ain't logged in
        body = <div>not logged in</div>;
    } else {
        const myId = meQuery.data.me.id;

        body = (
            <>
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
                            initialValues={{ otherId: "" }}
                            onSubmit={async (values, { setErrors }) => {
                                const convertedFriendId = parseInt(
                                    values.otherId
                                );

                                if (isNaN(convertedFriendId)) {
                                    setErrors({
                                        otherId: "id needs to be a number",
                                    });
                                    return;
                                }

                                const response = await sendFriendRequest({
                                    variables: {
                                        otherId: parseInt(values.otherId),
                                    },
                                    update: (cache) => {
                                        //invalidate outgoing requests to reflect change
                                        cache.evict({
                                            id: "ROOT_QUERY",
                                            fieldName:
                                                "getOutgoingFriendRequests",
                                        });

                                        cache.gc();
                                    },
                                });
                                if (response.data?.sendFriendRequest.errors) {
                                    //there was error
                                    //transform the returned message error array into a map that formik understands
                                    setErrors(
                                        toErrorMap(
                                            response.data.sendFriendRequest
                                                .errors
                                        )
                                    );
                                }
                            }}
                        >
                            {({ isSubmitting, values }) => (
                                <Form>
                                    <InputField
                                        name="otherId"
                                        placeholder="da friend code"
                                        label=""
                                    />
                                    <Button
                                        type="submit"
                                        isLoading={isSubmitting}
                                        disabled={values.otherId.length == 0}
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
                                {friendsQuery.data.getFriends.map((f) => {
                                    const user =
                                        f.biggerUserId != myId
                                            ? f.biggerIdUser
                                            : f.smallerIdUser;

                                    return (
                                        <Flex key={f.id} shadow="md" p={2}>
                                            <b>{user.username}</b> (id:{" "}
                                            {user.id})
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
                                                            <PopoverContent>
                                                                <PopoverArrow />
                                                                <Button
                                                                    borderSize="0"
                                                                    color={
                                                                        color[
                                                                            colorMode
                                                                        ]
                                                                    }
                                                                    onClick={async () => {
                                                                        const response = await createDirectMessage(
                                                                            {
                                                                                variables: {
                                                                                    otherId:
                                                                                        user.id,
                                                                                },
                                                                                update: (
                                                                                    cache
                                                                                ) => {
                                                                                    //invalidate all the getGroups queries
                                                                                    cache.evict(
                                                                                        {
                                                                                            id:
                                                                                                "ROOT_QUERY",
                                                                                            fieldName:
                                                                                                "getGroups",
                                                                                        }
                                                                                    );

                                                                                    cache.gc();
                                                                                },
                                                                            }
                                                                        );

                                                                        //push them to
                                                                        router.push(
                                                                            "/groups/" +
                                                                                response
                                                                                    .data
                                                                                    .createDirectMessage
                                                                                    .group
                                                                                    .id
                                                                        );
                                                                    }}
                                                                >
                                                                    Message{" "}
                                                                    {
                                                                        user.username
                                                                    }
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
                                                                                    //removed friend, invalidate getFriends query
                                                                                    cache.evict(
                                                                                        {
                                                                                            id:
                                                                                                "ROOT_QUERY",
                                                                                            fieldName:
                                                                                                "getFriends",
                                                                                        }
                                                                                    );
                                                                                    cache.gc();
                                                                                },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    Remove
                                                                    Friend
                                                                </Button>
                                                            </PopoverContent>
                                                        </Portal>
                                                    </Popover>
                                                </Tooltip>
                                            </Box>
                                        </Flex>
                                    );
                                })}
                            </Box>
                        ) : (
                            <Box>
                                <div>
                                    <b style={{ letterSpacing: "1px" }}>
                                        INCOMING
                                    </b>
                                </div>
                                {incomingQuery.data.getIncomingFriendRequests.map(
                                    (f) => {
                                        const user =
                                            f.biggerUserId != myId
                                                ? f.biggerIdUser
                                                : f.smallerIdUser;
                                        return (
                                            <Flex key={f.id} shadow="md" p={2}>
                                                <Box m={1}>
                                                    <b>{user.username}</b>
                                                    (id: {user.id})
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
                                                            _hover={{
                                                                color: "red",
                                                            }}
                                                            icon={<CloseIcon />}
                                                            onClick={() =>
                                                                setFriendRequestState(
                                                                    {
                                                                        variables: {
                                                                            id:
                                                                                f.id,
                                                                            newState:
                                                                                FriendRequestState.Declined,
                                                                        },
                                                                        update: (
                                                                            cache
                                                                        ) => {
                                                                            //reject the incoming friend request, invalidate incoming to show change
                                                                            cache.evict(
                                                                                {
                                                                                    id:
                                                                                        "ROOT_QUERY",
                                                                                    fieldName:
                                                                                        "getIncomingFriendRequests",
                                                                                }
                                                                            );

                                                                            cache.gc();
                                                                        },
                                                                    }
                                                                )
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
                                                            _hover={{
                                                                color: "green",
                                                            }}
                                                            icon={<CheckIcon />}
                                                            onClick={() => {
                                                                setFriendRequestState(
                                                                    {
                                                                        variables: {
                                                                            id:
                                                                                f.id,
                                                                            newState:
                                                                                FriendRequestState.Accepted,
                                                                        },
                                                                        update: (
                                                                            cache
                                                                        ) => {
                                                                            //accept friend request, invalidate incoming requests and getFriends queries
                                                                            cache.evict(
                                                                                {
                                                                                    id:
                                                                                        "ROOT_QUERY",
                                                                                    fieldName:
                                                                                        "getIncomingFriendRequests",
                                                                                }
                                                                            );
                                                                            cache.evict(
                                                                                {
                                                                                    id:
                                                                                        "ROOT_QUERY",
                                                                                    fieldName:
                                                                                        "getFriends",
                                                                                }
                                                                            );
                                                                            cache.gc();
                                                                        },
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Box>
                                            </Flex>
                                        );
                                    }
                                )}
                                <div>
                                    <b style={{ letterSpacing: "1px" }}>
                                        OUTGOING
                                    </b>
                                </div>
                                {outgoingQuery.data.getOutgoingFriendRequests.map(
                                    (f) => {
                                        const user =
                                            f.biggerUserId != myId
                                                ? f.biggerIdUser
                                                : f.smallerIdUser;

                                        return (
                                            <Flex key={f.id} shadow="md" p={2}>
                                                <b>{user.username}</b> (id:
                                                {user.id})
                                                <Box ml="auto">
                                                    <Tooltip
                                                        label="Cancel"
                                                        aria-label="Cancel the friend request"
                                                    >
                                                        <IconButton
                                                            m={1}
                                                            float="right"
                                                            aria-label="reject"
                                                            _hover={{
                                                                color: "red",
                                                            }}
                                                            icon={<CloseIcon />}
                                                            onClick={() =>
                                                                setFriendRequestState(
                                                                    {
                                                                        variables: {
                                                                            id:
                                                                                f.id,
                                                                            newState:
                                                                                FriendRequestState.Canceled,
                                                                        },
                                                                        update: (
                                                                            cache
                                                                        ) => {
                                                                            //after canceling request, invalidate outgoing requests
                                                                            cache.evict(
                                                                                {
                                                                                    id:
                                                                                        "ROOT_QUERY",
                                                                                    fieldName:
                                                                                        "getOutgoingFriendRequests",
                                                                                }
                                                                            );
                                                                            cache.gc();
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    </Tooltip>
                                                </Box>
                                            </Flex>
                                        );
                                    }
                                )}
                            </Box>
                        )}
                    </Stack>
                )}
            </>
        );
    }

    return <Layout>{body}</Layout>;
};

export default withApollo({ ssr: false })(Index);
