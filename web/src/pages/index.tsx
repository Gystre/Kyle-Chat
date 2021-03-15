import { Button } from "@chakra-ui/button";
import { Box, Flex, Grid } from "@chakra-ui/layout";
import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

const Index = () => {
    useIsAuth();

    return <Layout>select something on the left u idiot</Layout>;
};

export default withApollo({ ssr: true })(Index);
