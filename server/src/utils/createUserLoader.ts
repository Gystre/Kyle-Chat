import DataLoader from "dataloader";
import { User } from "../entities/User";

/*
This batches and caches loading of users into a single request, preventing ~15 of the same sql statements

Caches so if we already have a user in memory, just use that
*/

//going to create one of these loaders on every single request
//passing in ids: [1, 2, 5, 9]
//returning array of objects: [{id: 1, username: "bob"}, {}, {}, {}]
export const createUserLoader = () =>
    new DataLoader<number, User>(async (userIds) => {
        //find the users by their ids
        const users = await User.findByIds(userIds as number[]);
        const userIdToUser: Record<number, User> = {};

        //fill the array with the users at the id index
        users.forEach((u) => {
            userIdToUser[u.id] = u;
        });

        //map the returned objects to their respective ids
        return userIds.map((userId) => userIdToUser[userId]);
    });
