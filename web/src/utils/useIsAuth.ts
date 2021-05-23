import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";
import { socket } from "./socket";

//use this hook on every page that the user needs to be logged in
//it will redirect them to the login page
export const useIsAuth = () => {
    const { data, loading } = useMeQuery();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !data?.me) {
            //just redirecting them back to the homepage and not the page they were last on cuz this is a chat messaging application
            //not social media so need to go back to the page they were on cuz 99% of the time the user doesn't have access to it
            router.replace("/login?next=/");
        } else if (socket.disconnected) {
            //recconect the client between pages
            socket.connect();
        }
    }, [loading, data, router, socket]);
};
