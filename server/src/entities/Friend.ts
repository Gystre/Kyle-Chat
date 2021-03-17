import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { FriendRequestState } from "@kyle-chat/common";

/*
This table will contain all the user's friends and their state can be determined through the enum.
*/

@ObjectType()
@Entity()
export class Friend extends BaseEntity {
    @Field() //a "field" exposes this column of information to the api
    @PrimaryGeneratedColumn()
    id!: number;

    //keep track of who sent the request via id
    @Field()
    @Column({ type: "int" })
    requesterId!: number;

    //need the id of the requestee so we can query it to check stuff
    @Field()
    @Column({ type: "int" })
    requesteeId!: number;

    //the user we sent the request to
    @ManyToOne(() => User, (user) => user.friends)
    requestee!: User;

    //the state in enum (pending, accepted, declined)
    @Field()
    @Column({ type: "int", default: FriendRequestState.Pending })
    state: FriendRequestState;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
