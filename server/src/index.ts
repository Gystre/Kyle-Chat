import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv-safe/config"; //takes vars in .env and makes them environment variables
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { Socket } from "socket.io";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Friend } from "./entities/Friend";
import { Group } from "./entities/Group";
import { User } from "./entities/User";
import { FriendResolver } from "./resolvers/friend";
import { GroupResolver } from "./resolvers/group";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
    //create db connection
    const connection = await createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: true,
        // synchronize: true, //create the tables automatically without running a migration (good for development)
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [User, Friend, Group], //MAKE SURE TO ADD ANY NEW ENTITIES HERE
    });

    //run the migrations inside the migrations folder
    // await connection.runMigrations();

    //if you need to delete stuff in table
    // await Comment.delete({});

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

    app.use(
        session({
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
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                HelloResolver,
                UserResolver,
                FriendResolver,
                GroupResolver,
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
        }),
    });

    //creates graphql endpoint for us on express
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    //and finally start the server
    const httpServer = app.listen(parseInt(process.env.PORT), () => {
        console.log("server started on localhost:4000");
    });

    //now do socket io stuff
    const io = require("socket.io")(httpServer, {
        cors: true,
        origins: [process.env.CORS_ORIGIN],
    });

    io.on("connection", function (socket: Socket) {
        console.log("user connected");

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });

    console.log("worldddddddd");
};

main().catch((err) => {
    console.error(err);
});
