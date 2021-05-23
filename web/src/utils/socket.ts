import io from "socket.io-client";

const URL = "http://localhost:4000";

//da socket thing
//read somewhere that it's better to keep this in a createContext and give a provider globally but can only use that in FC so kinda sux
//ALSO TYPES FOR socket.io-client DOESN'T HAVE withCredentials, LIKE WHAT'S UP WITH THAT
export const socket = io(URL, { autoConnect: false, withCredentials: true });
