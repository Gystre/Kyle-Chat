import { GroupType } from "@kyle-chat/common";
import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Message } from "./Message";
import { User } from "./User";

/*
This object serves as a high level abstraction to represent a group of users.
Each entry in this table will be unique in id and signify a "group"

dm name: dm_smallerId_biggerId
group name: something random the client will choose

TODO:
if i ever add the feature to delete a group, need the ability to cascade delete entries from the membership table
that include the group's id
*/

@ObjectType()
@Entity()
export class Group extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ type: "int" })
    type!: GroupType;

    @Field()
    @Column({ length: 100 })
    name!: string;

    //32x32 image that will be used as the group's profile picture
    //these should be null to save on db size if it's a dm, eh figure out for next iteration of this stack
    @Field()
    @Column()
    imageUrl!: string;

    //should also keep track of the creator of the group to show who made it
    @Field()
    @Column({ type: "int" })
    creatorId!: number;

    //store all the users associated with the group (includes creator of group)
    //jointable is here b/c this is the side that I will be querying
    //need a way to add to this to add/remove a user from a group
    @ManyToMany(() => User, (user) => user.groups)
    @JoinTable()
    users: User[];

    @OneToMany(() => Message, (message) => message.group)
    messages: Message[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
