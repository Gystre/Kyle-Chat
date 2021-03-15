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

enum RequestState {
    Pending = 0,
    Accepted,
    Declined,
}

/*
This table will contain all the user's friends and their state can be determined through the enum
*/

@ObjectType()
@Entity()
export class Friend extends BaseEntity {
    @Field() //a "field" exposes this column of information to the api
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ type: "int" })
    requesterId!: number;

    //needs to keep track of who sent the request
    @ManyToOne(() => User, (user) => user.friends)
    requester: User;

    //the state in enum (pending, accepted, declined)
    @Field()
    @Column({ type: "int", default: RequestState.Pending })
    state!: RequestState;

    //the id of the user we're trying to add
    //need to look more into how to have a whole type so can have nested queries instead of having to do a whois kind of query on the id
    @Field()
    @Column({ type: "int" })
    requesteeId: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
