import { BaseEditor, Descendant } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";

/*
Custom typings for slate stuff
*/

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type BlockQuoteElement = {
    type: "block-quote";
    children: Descendant[];
};

export type BulletedListElement = {
    type: "bulleted-list";
    children: Descendant[];
};

export type NumberedListElement = {
    type: "numbered-list";
    children: Descendant[];
};

export type ListItemElement = {
    type: "list-item";
    children: Descendant[];
};

export type MentionElement = {
    type: "mention";
    character: string;
    children: CustomText[];
};

export type ParagraphElement = {
    type: "paragraph";
    children: Descendant[];
};

type CustomElement =
    | BlockQuoteElement
    | BulletedListElement
    | NumberedListElement
    | ListItemElement
    | MentionElement
    | ParagraphElement;

export type ElementFormat = CustomElement["type"];

export type CustomText = {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    text: string;
};

declare module "slate" {
    interface CustomTypes {
        Editor: CustomEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}
