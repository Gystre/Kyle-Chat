import DataLoader from "dataloader";
import { Group } from "../entities/Group";

//does the same thing as createUserLoader except with groups
//should be some way to abstract this so it works all classes that extend BaseEntity but not sure how :/
//might be some way with generic functions from ts but kinda noob with those rn
export const createGroupLoader = () =>
    new DataLoader<number, Group>(async (groupIds) => {
        //find the groups by their ids
        const groups = await Group.findByIds(groupIds as number[]);
        const groupIdToGroup: Record<number, Group> = {};

        //fill the array with the groups at the id index
        groups.forEach((u) => {
            groupIdToGroup[u.id] = u;
        });

        //map the returned objects to their respective ids
        return groupIds.map((groupId) => groupIdToGroup[groupId]);
    });
