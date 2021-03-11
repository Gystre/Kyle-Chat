import { UsernamePasswordInput } from "../classes/UsernamePasswordInput";

//this doesn't return error: {} objects but an array of objects so we can change the shape of response later
export const validateRegister = (options: UsernamePasswordInput) => {
    //ensure email includes @ sign
    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "invalid email",
            },
        ];
    }
    //make sure both fields are of adequate length
    if (options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "length must be greater than 2",
            },
        ];
    }

    //ensure the username isn't an email
    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "cannot include an @",
            },
        ];
    }

    if (options.password.length < 3) {
        return [
            {
                field: "password",
                message: "length must be greater than 3",
            },
        ];
    }

    return null;
};
