import { useColorMode, Box, Button, Stack } from "@chakra-ui/react";
import { MAIN_CHAT_ID, slateObjectCharacterLength } from "@kyle-chat/common";
import { Formik, Form } from "formik";
import React, { Component, useEffect, useRef, useState } from "react";
import { Descendant } from "slate";
import {
    GetMessagesQuery,
    GetMessagesQueryResult,
    MessageFragmentFragment,
    useGetGroupQuery,
    useGetMessagesQuery,
} from "../../generated/graphql";
import { socket } from "../../utils/socket";
import { useIsAuth } from "../../utils/useIsAuth";
import AutoScroll from "../AutoScroll";
import { Layout } from "../Layout";
import { Message } from "./Message";
import { RichTextEditor } from "../RichTextEditor";
import NewMessages from "./NewMessages";

interface Props {}
export const ChatModule: React.FC<Props> = () => {
    useIsAuth();

    const { colorMode } = useColorMode();

    const { data, error, loading } = useGetGroupQuery({
        skip: false,
        variables: {
            groupId: MAIN_CHAT_ID, // main chat
        },
    });

    const getMessages = useGetMessagesQuery({
        variables: {
            groupId: MAIN_CHAT_ID,
            limit: 100,
            cursor: null,
        },
        notifyOnNetworkStatusChange: true, //loading will become true if click loadMore (enable the little spinning thing on load more button)
    });

    let [messageBody, setMessageBody] = useState<Descendant[]>([
        {
            type: "paragraph",
            children: [{ text: "" }],
        },
    ]);

    if (loading) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        );
    }

    if (error || getMessages.error) {
        return (
            <div>
                {error.message}
                {getMessages.error}
            </div>
        );
    }

    return (
        <Box>
            <AutoScroll>
                <Stack spacing={2}>
                    {/* display past and current messages */}
                    {getMessages.loading ? (
                        <Button isLoading colorScheme="green"></Button>
                    ) : (
                        []
                            .concat(getMessages.data.getMessages.messages)
                            .reverse()
                            .map((msg) =>
                                !msg ? null : (
                                    <Message
                                        key={msg.id}
                                        username={msg.author.username}
                                        text={msg.text}
                                        imageUrl={msg.author.imageUrl}
                                        createdAt={msg.createdAt}
                                    />
                                )
                            )
                    )}

                    {/* for all the new messages that the user types/receives */}
                    <NewMessages />
                </Stack>
            </AutoScroll>
            <Formik
                initialValues={{}}
                onSubmit={async (values) => {
                    // probs move this verfication logic to common
                    if (slateObjectCharacterLength(messageBody) <= 0) {
                        console.log("msg can't be empty");
                        return;
                    }

                    socket.emit("sendMessage", MAIN_CHAT_ID, messageBody);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box
                            p={1}
                            m={1}
                            border="1px solid #ccc"
                            borderRadius="16px"
                        >
                            <RichTextEditor
                                textBody={messageBody}
                                setTextBodyValue={setMessageBody}
                                placeholder="type something... :DDDD"
                            />
                        </Box>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="green"
                        >
                            submit
                        </Button>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};
