import { Button } from "@chakra-ui/button";
import { useColorMode } from "@chakra-ui/color-mode";
import { Input } from "@chakra-ui/input";
import { Box, Flex } from "@chakra-ui/layout";
import { Field, Form, Formik } from "formik";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { PersonIcon } from "../components/PersonIcon";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

const Index = () => {
    useIsAuth();
    const { colorMode } = useColorMode();
    const color = { light: "black", dark: "white" };
    const bgColor = { light: "gray.100", dark: "gray.700" };

    return (
        <Layout>
            {/* the little navbar at the top of the friends thing */}
            <Flex
                top={0}
                bg="gray.100"
                p={1}
                ml={"auto"}
                align="center"
                boxShadow="md"
                color={color[colorMode]}
                bgColor={bgColor[colorMode]}
            >
                <Flex flex={1} m="2" align="center" maxW={800}>
                    <PersonIcon />
                    <b>Friends</b>
                    {/* these will be hooked up to queries that will grab the user's friends */}
                    <Button ml="8" mr="2" bgColor={bgColor[colorMode]}>
                        All
                    </Button>
                    <Button bgColor={bgColor[colorMode]} mr="2">
                        Pending
                    </Button>
                    <Formik
                        initialValues={{ friendId: "" }}
                        onSubmit={async (values, { setErrors }) => {
                            console.log("submitted");
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <Input
                                    style={{ display: "inline-block" }}
                                    name="friendId"
                                    placeholder="da friend code"
                                    label=""
                                    type="number"
                                    min="1"
                                />
                                <Button
                                    style={{ display: "inline-block" }}
                                    type="submit"
                                    isLoading={isSubmitting}
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
            <Box bgColor="blue"></Box>
        </Layout>
    );
};

export default withApollo({ ssr: true })(Index);
