import { Request, Response } from "express";
import session from "express-session";
import { Redis } from "ioredis";
import { createGroupLoader } from "./utils/createGroupLoader";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
    req: Request & { session: session.Session & { userId: number } };
    res: Response;
    redis: Redis;
    userLoader: ReturnType<typeof createUserLoader>;
    groupLoader: ReturnType<typeof createGroupLoader>;
};
