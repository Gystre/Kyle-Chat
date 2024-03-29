# Kyle-Chat

This full stack application will allow users to sign in, add friends, and chat in real time with them. It uses the same stack as Kyle Reddit and I hope to build out it's features in a way that I can reuse in future applications.

## Todo

-   use await Promise.all for error checking on backend (https://github.com/benawad/slack-clone-server/blob/f86d853d1aab82a82ec6a2eb2a81455bebd56039/resolvers/team.js#L31)
-   scalable send message flow with rate limit of 5 messages per second or something like that
-   upload images and files and display them in the chat
-   make login & register page a little nicer and not just two input fields and a button
-   port ability to forget password from kyle reddit

## Done

-   user is able to add and remove other users to their list of friends using a unique id
-   able to see who your friends are through the ui
-   dms, group chats, and servers (organizing data, no messaging yet)
-   gravatar for profiles
-   text editing that supports rich text
-   ability to create a group
-   authenticate socket
-   only allow client to have 1 socket per tab
-   sendMessage socket
-   broadcast message out to connected clients
-   real time messaging

## Where to improve

-   emoji selector
-   use storybook and figma to work out the components so that the ui is nice
-   use skeleton component from chakra as filler groups while waiting for queries to load
-   mention other messages
