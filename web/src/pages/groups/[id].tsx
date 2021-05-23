import { Button } from "@chakra-ui/button";
import { useColorMode } from "@chakra-ui/color-mode";
import { Box, Grid, Stack } from "@chakra-ui/layout";
import { slateObjectCharacterLength } from "@kyle-chat/common";
import { Form, Formik } from "formik";
import { useContext, useState } from "react";
import { Descendant } from "slate";
import { AvatarDisplay } from "../../components/AvatarDisplay";
import { Layout } from "../../components/Layout";
import { RichTextEditor } from "../../components/RichTextEditor";
import { socket } from "../../utils/socket";
import { useGetGroupFromUrl } from "../../utils/useGetGroupFromUrl";
import { useIsAuth } from "../../utils/useIsAuth";
import { withApollo } from "../../utils/withApollo";

const Group = () => {
    useIsAuth();

    const { colorMode } = useColorMode();
    const friendColumn_bgColor = { light: "gray.200", dark: "gray.800" };

    const { data, error, loading } = useGetGroupFromUrl();

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

    //user landed on group page that they either don't belong to or DNE
    if (!data?.getGroup.group && data?.getGroup.errors) {
        return <Layout>{data.getGroup.errors[0].message}</Layout>;
    }

    return (
        <Layout>
            <Grid height="100vh" gridTemplateColumns="80% 20%">
                {/* messages and area to type */}
                <Grid templateRows="80% 20%">
                    <Box>yeah</Box>
                    <Box>
                        <Formik
                            initialValues={{}}
                            onSubmit={async (values) => {
                                // console.log(JSON.stringify(messageBody));

                                socket.emit("test", "seomthing");
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
                </Grid>

                {/* member list */}
                <Box bgColor={friendColumn_bgColor[colorMode]}>
                    <Box ml={6} mt={2}>
                        <b style={{ letterSpacing: "1px" }}>MEMBERS</b>
                        <Stack mt={2} spacing={2}>
                            {data?.getGroup.group.users.map((user) => (
                                <AvatarDisplay
                                    imageUrl={user.imageUrl}
                                    name={user.username}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Grid>
        </Layout>
    );
};

export default withApollo({ ssr: false })(Group);
