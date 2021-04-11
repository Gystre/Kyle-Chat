import { FriendRequestState } from "@kyle-chat/common";
import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

/*
This table will contain all the user's friends and their state can be determined through the enum.
*/

@ObjectType()
@Entity()
@Unique(["smallerUserId", "biggerUserId"])
export class Friend extends BaseEntity {
    @Field() //a "field" exposes this column of information to the api
    @PrimaryGeneratedColumn()
    id!: number;

    //these ids represent the friendship link
    //smallerUserId < biggerUserId
    //these form a unique pair to prevent duplicate exchanges from happening
    @Field()
    @Column({ type: "int" })
    smallerUserId!: number;

    @Field()
    @Column({ type: "int" })
    biggerUserId!: number;

    //a very important column
    //stores the id of the person of the most recent user who made an update to the row i.e send request, accept, or decline
    //with this we can query pending and accepted friends
    //basically an updatedAt but with user id
    @Field()
    @Column({ type: "int" })
    recentActionUserId!: number;

    //the state in enum (pending, accepted, declined)
    @Field()
    @Column({ type: "int", default: FriendRequestState.Pending })
    state: FriendRequestState;

    //these are one directional relationships cuz don't need to query friends on the User side
    //nullable cuz only one or the other will exist when fetching friends (all of them, outgoing, and incoming)
    @ManyToOne(() => User)
    smallerIdUser: User;

    @ManyToOne(() => User)
    biggerIdUser: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
