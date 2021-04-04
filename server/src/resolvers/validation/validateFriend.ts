import { User } from "../../entities/User";

//check to make sure the we aren't trying to do stuff on ourselves and make sure the user exists
export const validateFriend = async (userId: number, otherId: number) => {
    //make sure user can't friend themselves
    if (otherId == userId) {
        return [
            {
                field: "otherId",
                message: "bruh u can't friend urself wot are u doing",
            },
        ];
    }

    //find the user by that id
    const friend = await User.findOne(otherId);
    if (!friend) {
        return [
            {
                field: "otherId",
                message: "user doesn't exist :/",
            },
        ];
    }

    return null;
};
