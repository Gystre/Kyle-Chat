import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";
import io from "socket.io-client";
import { useEffect } from "react";

const Index = () => {
    useIsAuth();

    useEffect(() => {
        const socket = io("http://localhost:4000");
    });

    return <Layout>select something on the left u idiot</Layout>;
};

export default withApollo({ ssr: true })(Index);
