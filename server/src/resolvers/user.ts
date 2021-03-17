import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "../types";
import {
    FieldResolver,
    Root,
    Ctx,
    Resolver,
    Query,
    Arg,
    Mutation,
    Int,
} from "type-graphql";
import { getConnection } from "typeorm";
import { UsernamePasswordInput } from "./classes/UsernamePasswordInput";
import { UserResponse } from "./responses/UserResponse";
import { validateRegister } from "./validation/validateRegister";

@Resolver(User)
export class UserResolver {
    //a field level resolver will run whenever a graphql query is made
    //make sure other users can't see other people's emails
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        //this is current user and its ok to show their own email
        if (req.session.userId === user.id) {
            return user.email;
        }
        //current user wants to see someone elses email
        return "";
    }

    //NEED CHANGE PASSWORD
    //NEED FORGOT PASSWORD

    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        //not logged in
        if (!req.session.userId) {
            return null;
        }
        return User.findOne(req.session.userId);
    }

    @Query(() => User, { nullable: true })
    findById(@Arg("id", () => Int) id: number) {
        return User.findOne(id);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options")
        options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors };
        }

        //add the user
        //hash password and create the object in the User table
        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            // alternative:
            //User.create({ stuff goes here}).save()

            //insert user using the query builder
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                })
                .returning("*") //the * means return everything
                .execute();

            user = result.raw[0];
        } catch (err) {
            //duplicate username error
            if (err.code === "23505" || err.detail.includes("already exists")) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username has already been taken",
                        },
                    ],
                };
            }
            console.log("message: ", err.message);
        }

        //store uid session
        //set a cookie on the user and keep them logged in
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        //find the user in the database
        const user = await User.findOne(
            usernameOrEmail.includes("@")
                ? { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail } }
        );
        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "that username doesn't exist",
                    },
                ],
            };
        }

        //check password
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }

        //req.session kind of like a global object that can be accessed from all resolvers
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        //remove session from redis
        //wait for destroy to finsh with a promise
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                //destroy the cookie even if we couldn't destroy the session
                res.clearCookie(COOKIE_NAME);

                if (err) {
                    console.log(err);

                    //respond false
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }
}
