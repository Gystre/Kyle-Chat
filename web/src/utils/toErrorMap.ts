import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]) => {
    const errorMap: Record<string, string> = {};
    //turn the array into a map
    //map each field header to it's corresponding message value
    errors.forEach(({ field, message }) => {
        errorMap[field] = message;
    });

    return errorMap;
};
