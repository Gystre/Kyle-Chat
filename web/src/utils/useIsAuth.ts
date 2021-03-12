import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

//use this hook on every page that the user needs to be logged in
//it will redirect them to the login page
export const useIsAuth = () => {
    const { data, loading } = useMeQuery();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !data?.me) {
            //pass the page they were on to the query object
            router.replace("/login?next=" + router.pathname);
        }
    }, [loading, data, router]);
};
