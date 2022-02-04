import jp from "jsonpath";
import { Descendant } from "slate";

/*
Id of main chat
*/
export const MAIN_CHAT_ID = 1;

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

/*
User: All possible states for a user's online status
*/
export enum StatusType {
    Offline = 0, //websocket is currently disconnected
    Online, //websocket is connected
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

// socket io types (figure out how to do this later)
// https://socket.io/docs/v4/typescript/#types-for-the-server
// interface ServerToClientEvents {
//     newMessage: (slateText: string) => void;
// }

// interface ClientToServerEvents {
//     sendMessage: (slateText: string) => void;
// }
