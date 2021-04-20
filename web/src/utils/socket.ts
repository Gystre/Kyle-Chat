import io from "socket.io-client";

const URL = "http://localhost:4000";
const socket = io(URL, { autoConnect: false });

//the global socket.io socket that can be accessed anywhere
export default socket;
