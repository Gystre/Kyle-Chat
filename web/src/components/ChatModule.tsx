import { useColorMode, Box, Button } from "@chakra-ui/react";
import { MAIN_CHAT_ID } from "@kyle-chat/common";
import { Formik, Form } from "formik";
import React, { useState } from "react";
import { Descendant } from "slate";
import { useGetGroupQuery } from "../generated/graphql";
import { socket } from "../utils/socket";
import { useIsAuth } from "../utils/useIsAuth";
import { Layout } from "./Layout";
import { RichTextEditor } from "./RichTextEditor";

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

    if (error) {
        return <div>{error.message}</div>;
    }

    return (
        <Box>
            <Formik
                initialValues={{}}
                onSubmit={async (values) => {
                    console.log(JSON.stringify(messageBody));

                    socket.emit("sendMessage", JSON.stringify(messageBody));
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
