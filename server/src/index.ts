import {
    GroupType,
    MAIN_CHAT_ID,
    slateObjectCharacterLength,
} from "@kyle-chat/common";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv-safe/config"; //takes vars in .env and makes them environment variables
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { Descendant } from "slate";
import { Server, Socket } from "socket.io";
import { buildSchema } from "type-graphql";
import { createConnection, getConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Friend } from "./entities/Friend";
import { Group } from "./entities/Group";
import { Message } from "./entities/Message";
import { User } from "./entities/User";
import { FriendResolver } from "./resolvers/friend";
import { GroupResolver } from "./resolvers/group";
import { HelloResolver } from "./resolvers/hello";
import { MessageResolver } from "./resolvers/message";
import { UserResolver } from "./resolvers/user";
import { createGroupLoader } from "./utils/createGroupLoader";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
    //create db connection
    const connection = await createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: true,
        // synchronize: true, //create the tables automatically without running a migration (good for development)
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [User, Friend, Group, Message], //MAKE SURE TO ADD ANY NEW ENTITIES HERE
    });

    //run the migrations inside the migrations folder
    // await connection.runMigrations();

    //if you need to delete stuff in table
    // await Friend.delete({});
    // await User.delete({});
    // await Group.delete({});

    //create an instance of express
    const app = express();

    //initialize the redis session (for saving browser cookies and stuff so user can stay logged in after refreshing the page)
    //this needs to come before apollo middle ware b/c we're going to be using this inside of apollo
    const RedisStore = connectRedis(session);
    const redis = new Redis(process.env.REDIS_URL);

    //tell express we have a proxy sitting in front so cookies and sessions work
    app.set("trust proxy", 1);

    //apply cors middleware to all routes (pages)
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        })
    );

    //create the express session
    const sessionMiddleware = session({
        name: COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTTL: true,
            disableTouch: true, //disables lifecylce of cookies so they last forever
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
            httpOnly: true, //make sure cookie only available on serverside
            sameSite: "lax", //protect csrf
            secure: __prod__, //cookie only works in https
            domain: __prod__ ? ".kylegodly.com" : undefined, //need to add domain b/c sometimes server doesn't always forward cookie correctly
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false, //makes sure not continuing to ping redis
    });

    app.use(sessionMiddleware);

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                HelloResolver,
                UserResolver,
                FriendResolver,
                GroupResolver,
                MessageResolver,
            ],
            validate: false,
        }),

        //make the orm object available to all resolvers
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            // these are batch processors that take multiple small sql statements and process them into one big one
            userLoader: createUserLoader(), //a new userLoader will be created on every request
            groupLoader: createGroupLoader(),
        }),
    });

    //creates graphql endpoint for us on express
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    //start the server
    const httpServer = app.listen(parseInt(process.env.PORT), () => {
        console.log("server started on localhost:" + process.env.PORT);
    });

    //and also add on the socket io stuff
    const io = new Server(httpServer, {
        cookie: true,
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        //adding the same middleware here allows us to use the same sessionID as the authentication and gives us access to the user id
        sessionMiddleware(socket.request, {}, next);
    });

    io.on("connection", async (socket: Socket) => {
        const sessionId = "sess:" + socket.request.sessionID;

        //check redis for the userId
        if (!(await redis.exists(sessionId))) {
            //not authenticated
            return;
        }

        const userId = JSON.parse(
            (await redis.get(sessionId)) as string
        ).userId;

        console.log("id:", userId, ", sess:", sessionId, "connected");
        console.log("users connected", io.engine.clientsCount);

        socket.on(
            "sendMessage",
            async (groupId: number, slateText: Descendant[]) => {
                if (slateObjectCharacterLength(slateText) <= 0) {
                    console.log("msg can't be empty");
                    return;
                }

                var msg = await MessageResolver.sendMessage(
                    slateText,
                    groupId,
                    userId
                );

                io.emit("newMessage", msg.message);
            }
        );

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });

    // create the main chat room
    const mainChat = await getConnection()
        .getRepository("group")
        .find({ where: { id: MAIN_CHAT_ID } });

    if (mainChat.length == 0) {
        await Group.create({
            name: "main",
            type: GroupType.ChatRoom,
            creatorId: 1, //change this later
            users: [],
            imageUrl: "",
        }).save();
        console.log("Created main chat");
    }

    console.log("Kyle Chat server!!!!!");
};

main().catch((err) => {
    console.error(err);
});
