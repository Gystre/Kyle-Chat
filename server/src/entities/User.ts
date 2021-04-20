import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Group } from "./Group";
import { Message } from "./Message";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field()
    @Column()
    password!: string;

    @Field()
    @Column()
    imageUrl!: string;

    //the groups that the user is apart of
    @ManyToMany(() => Group, (group) => group.users, { onDelete: "CASCADE" }) //delete the group entry if a group is deleted
    groups: Group[];

    //the messages the user has sent
    @OneToMany(() => Message, (message) => message.author)
    messages: Message[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
