import { Field, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

/*
This object serves as a high level abstraction to represent a group of users.
Each entry in this table will be unique in id and signify a "group"

dm name: dm_userId1_userId2 (userId1 and userId2 in no particular order)
group name: custom set

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
    @Column({ length: 100 })
    name!: string;

    //should also keep track of the creator of the group to show who made it
    @Field(() => Int)
    @Column()
    creatorId!: number;

    //foreign key to query back
    @OneToOne(() => User)
    @JoinColumn()
    creator!: User;

    //store all the users associated with the group
    //jointable is here b/c this is the side that I will be querying
    //need a way to add to this to add/remove a user from a group
    @ManyToMany(() => User, (user) => user.groups)
    @JoinTable()
    users: User[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
