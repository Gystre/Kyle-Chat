import { Box, Flex, Link, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { withApollo } from "../utils/withApollo";
import NextLink from "next/link";
import socket from "../utils/socket";

const Login = () => {
    //used to redirect user
    const router = useRouter();
    const [login] = useLoginMutation();
    return (
        <Wrapper>
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login({
                        variables: values,
                        update: (cache, { data }) => {
                            cache.writeQuery<MeQuery>({
                                query: MeDocument, //MeDocument = query in a gql string
                                data: {
                                    __typename: "Query",
                                    me: data?.login.user,
                                },
                            });
                            cache.gc();
                        },
                    });

                    if (response.data?.login.errors) {
                        //there was error
                        //transform the returned message error array into a map that formik understands
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user) {
                        socket.connect();

                        if (typeof router.query.next === "string") {
                            //worked, redirec them to the page they were on
                            router.push(router.query.next);
                        } else {
                            //worked, redirect them to homepage
                            router.push("/");
                        }
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="usernameOrEmail"
                            placeholder="username or email"
                            label="Username or Email"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Flex mt={3}>
                            <NextLink href="/forgot-password">
                                <Link ml="auto" textDecoration="underline">
                                    Forgot password?
                                </Link>
                            </NextLink>
                        </Flex>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

//don't need ssr here b/c no js is being evaluated to make HTML look different
export default withApollo({ ssr: false })(Login);
