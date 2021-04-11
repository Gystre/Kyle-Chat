import { useRouter } from "next/router";

//cast the url id parameter into an int
//TODO: could make better by making generic and work with any kind of query parameter
export const useGetIntId = () => {
    const router = useRouter();
    const intId =
        typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

    return intId;
};
