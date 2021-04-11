import { useGetGroupQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

//convert id in the url to an int
export const useGetGroupFromUrl = () => {
    const intId = useGetIntId();

    return useGetGroupQuery({
        skip: intId === -1,
        variables: {
            groupId: intId,
        },
    });
};
