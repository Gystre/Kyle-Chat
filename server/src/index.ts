import "reflect-metadata";
import "dotenv-safe/config"; //takes vars in .env and makes them environment variables
import { createConnection } from "typeorm";
import path from "path";
import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import { COOKIE_NAME, __prod__ } from "./constants";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { User } from "./entities/User";
import { UserResolver } from "./resolvers/user";
import { Friend } from "./entities/Friend";
import { FriendResolver } from "./resolvers/friend";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
    //create db connection
    const connection = await createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: true,
        // synchronize: true, //create the tables automatically without running a migration (good for development)
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [User, Friend], //MAKE SURE TO ADD ANY NEW ENTITIES HERE
    });
    //run the migrations inside the migrations folder
    // await connection.runMigrations();

    //if you need to delete all the posts
    // await Comment.delete({});
    // console.log("deleted comments");

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
            secret: process.env.SESSION_SECRET, //should make this an environment variable
            resave: false, //makes sure not continuing to ping redis
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver, FriendResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            // these are batch processors that take multiple small sql statements and process them into one big one
            userLoader: createUserLoader(), //a new userLoader will be created on every request
        }), //make the orm object available to all resolvers
    });

    //craete graphql endpoint for us on express
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.listen(parseInt(process.env.PORT), () => {
        console.log("server started on localhost:4000");
    });

    console.log("worldddddddd");
};

main().catch((err) => {
    console.error(err);
});
