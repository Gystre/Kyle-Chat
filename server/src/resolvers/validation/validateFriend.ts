import { User } from "../../entities/User";

//check to make sure the we aren't trying to do stuff on ourselves and make sure the user exists
export const validateFriend = async (userId: number, requesteeId: number) => {
    //make sure user can't friend themselves
    if (requesteeId == userId) {
        return [
            {
                field: "requesteeId",
                message: "bruh u can't friend urself wot are u doing",
            },
        ];
    }

    //find the user by that id
    const friend = await User.findOne(requesteeId);
    if (!friend) {
        return [
            {
                field: "requesteeId",
                message: "user doesn't exist :/",
            },
        ];
    }

    return null;
};
