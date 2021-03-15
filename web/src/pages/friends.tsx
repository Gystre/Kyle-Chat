import { Button } from "@chakra-ui/button";
import { Flex } from "@chakra-ui/layout";
import React from "react";
import { Layout } from "../components/Layout";
import { PersonIcon } from "../components/PersonIcon";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

const Index = () => {
    useIsAuth();

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
            >
                <Flex flex={1} m="2" align="center" maxW={800}>
                    <PersonIcon />
                    <b>Friends</b>
                    {/* these will be hooked up to queries that will grab the user's friends */}
                    <Button ml="8" mr="2">
                        All
                    </Button>
                    <Button>Pending</Button>
                </Flex>
            </Flex>
        </Layout>
    );
};

export default withApollo({ ssr: true })(Index);
