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
import { Group } from "./Group";
import { User } from "./User";

@ObjectType()
@Entity()
export class Message extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    //the group this message belongs to
    @Field()
    @Column({ type: "int" })
    groupId!: number;

    @ManyToOne(() => Group, (group) => group.messages)
    group!: Group;

    //the author that sent the message
    @Field()
    @Column({ type: "int" })
    authorId!: number;

    @ManyToOne(() => User, (user) => user.messages)
    author!: User;

    //the text that makes up the message
    //NOTE: this will be a json-ified slate object NOT PLAIN TEXT
    //the text itself will not exceed 2000 characters (not including the extra braces and stuff) and will be verified by the server before inserting
    @Field()
    @Column()
    text!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
