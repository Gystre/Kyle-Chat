import jp from "jsonpath";
import { Descendant } from "slate";

/*
All the possible states that a request can be in
*/
export enum FriendRequestState {
    Pending = 0,
    Accepted,
    Declined,
    Canceled,
}

/*
All possible types of group chat things
*/
export enum GroupType {
    DM = 0, //between two people
    GroupDM, //lots of people, must be friends of creator
    ChatRoom, //lots of people, don't need to be friends of creator
}

//counts the amount of characters that are in a slate json-ified object
export const slateObjectCharacterLength = (textBody: Descendant[]) => {
    var textCount = 0;
    const texts = jp.query(textBody, "$..text");

    texts.forEach((item) => {
        textCount += item.length;
    });

    return textCount;
};
