import { Code } from "@chakra-ui/layout";
import { isHotkey } from "is-hotkey";
import Head from "next/head";
import React, { useCallback, useMemo } from "react";
import {
    createEditor,
    Descendant,
    Editor,
    Element as SlateElement,
    Point,
    Range,
    Transforms,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, useSlate, withReact } from "slate-react";
import { BulletedListElement, ElementFormat } from "../custom-slate-types";
import {
    HoveringToolbar,
    Icon,
    toggleFormat,
    Toolbar,
    ToolBarButton,
} from "./Toolbar";

const HOTKEYS: any = {
    "mod+b": "bold",
    "mod+i": "italic",
    "mod+u": "underline",
    "mod+`": "code",
};

const SHORTCUTS: any = {
    "*": "list-item",
    ">": "block-quote",
    "#": "heading-one",
    "##": "heading-two",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

interface RichTextEditorProps {
    textBody: Descendant[];
    setTextBodyValue: React.Dispatch<React.SetStateAction<Descendant[]>>;
    placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    textBody,
    setTextBodyValue,
    placeholder,
}) => {
    const editor = useMemo(
        () => withReact(withShortcuts(withHistory(createEditor()))),
        []
    );

    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

    return (
        <>
            <Head>
                {/* need font family so that the icons actually show up */}
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                />
            </Head>
            <Slate
                editor={editor}
                value={textBody}
                onChange={(value) => setTextBodyValue(value)}
            >
                <Toolbar>
                    <MarkButton format="bold" icon="format_bold" />
                    <MarkButton format="italic" icon="format_italic" />
                    <MarkButton format="underline" icon="format_underlined" />
                    <MarkButton format="code" icon="code" />
                    <BlockButton format="heading-one" icon="looks_one" />
                    <BlockButton format="heading-two" icon="looks_two" />
                    <BlockButton format="block-quote" icon="format_quote" />
                    <BlockButton
                        format="numbered-list"
                        icon="format_list_numbered"
                    />
                    <BlockButton
                        format="bulleted-list"
                        icon="format_list_bulleted"
                    />
                </Toolbar>
                <HoveringToolbar />
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={placeholder || ""}
                    spellCheck
                    autoFocus
                    onDOMBeforeInput={(e: Event) => {
                        const event = e as InputEvent;

                        switch (event.inputType) {
                            case "formatBold":
                                return toggleFormat(editor, "bold");
                            case "formatItalic":
                                return toggleFormat(editor, "italic");
                            case "formatUnderline":
                                return toggleFormat(editor, "underlined");
                        }
                    }}
                    onKeyDown={(event) => {
                        for (const hotkey in HOTKEYS) {
                            if (isHotkey(hotkey, event as any)) {
                                event.preventDefault();
                                const mark = HOTKEYS[hotkey];
                                toggleMark(editor, mark);
                            }
                        }
                    }}
                />
            </Slate>
        </>
    );
};

const withShortcuts = (editor: Editor) => {
    const { deleteBackward, insertText } = editor;

    editor.insertText = (text) => {
        const { selection } = editor;

        if (text === " " && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection;
            const block = Editor.above(editor, {
                match: (n) => Editor.isBlock(editor, n),
            });
            const path = block ? block[1] : [];
            const start = Editor.start(editor, path);
            const range = { anchor, focus: start };
            const beforeText = Editor.string(editor, range);
            const type = SHORTCUTS[beforeText];

            if (type) {
                Transforms.select(editor, range);
                Transforms.delete(editor);
                const newProperties: Partial<SlateElement> = {
                    type,
                };
                Transforms.setNodes(editor, newProperties, {
                    match: (n) => Editor.isBlock(editor, n),
                });

                if (type === "list-item") {
                    const list: BulletedListElement = {
                        type: "bulleted-list",
                        children: [],
                    };
                    Transforms.wrapNodes(editor, list, {
                        match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === "list-item",
                    });
                }

                return;
            }
        }

        insertText(text);
    };

    editor.deleteBackward = (...args) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, {
                match: (n) => Editor.isBlock(editor, n),
            });

            if (match) {
                const [block, path] = match;
                const start = Editor.start(editor, path);

                if (
                    !Editor.isEditor(block) &&
                    SlateElement.isElement(block) &&
                    block.type !== "paragraph" &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties: Partial<SlateElement> = {
                        type: "paragraph",
                    };
                    Transforms.setNodes(editor, newProperties);

                    //delete backward for bulleted lists so that the cursor goes back
                    if (block.type === "list-item") {
                        Transforms.unwrapNodes(editor, {
                            match: (n) =>
                                !Editor.isEditor(n) &&
                                SlateElement.isElement(n) &&
                                n.type === "bulleted-list",
                            split: true,
                        });

                        //same for numbered lists
                        Transforms.unwrapNodes(editor, {
                            match: (n) =>
                                !Editor.isEditor(n) &&
                                SlateElement.isElement(n) &&
                                n.type === "numbered-list",
                            split: true,
                        });
                    }

                    return;
                }
            }

            deleteBackward(...args);
        }
    };

    return editor;
};

const isBlockActive = (editor: Editor, format: ElementFormat) => {
    const [match] = Editor.nodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === format,
    });

    return !!match;
};

const toggleBlock = (editor: Editor, format: ElementFormat) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: (n) => {
            //make sure that the iterated node is not the editor or a slate element
            if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
                return LIST_TYPES.includes(n.type as string);
            }

            //if it is then just skip over it
            return false;
        },
        split: true,
    });

    const newProperties: Partial<SlateElement> = {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
    Transforms.setNodes(editor, newProperties);

    if (!isActive && isList) {
        //slapping type any on this cuz i don't know what ts wants from me here
        //is it CustomElement, Descendant, a collection of the custom elements?????
        const block: any = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};

const BlockButton = ({ format, icon }: any) => {
    const editor = useSlate();
    return (
        <ToolBarButton
            active={isBlockActive(editor, format)}
            onMouseDown={(event: Event) => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </ToolBarButton>
    );
};

const MarkButton = ({ format, icon }: any) => {
    const editor = useSlate();
    return (
        <ToolBarButton
            active={isMarkActive(editor, format)}
            onMouseDown={(event: Event) => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </ToolBarButton>
    );
};

const isMarkActive = (editor: Editor, format: ElementFormat) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: ElementFormat) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

export const Element = ({ attributes, children, element }: any) => {
    //have to add styling here to override the emotion styling cuz don't know how to get rid of like the 50 global classes emotions puts in the header
    //i think the classes might be from chakra but i dont know
    switch (element.type) {
        case "block-quote":
            return (
                <blockquote
                    style={{
                        borderLeft: "2px solid #ddd",
                        marginLeft: 0,
                        MarginRight: 0,
                        paddingLeft: "10px",
                        color: "#aaa",
                        fontStyle: "italic",
                    }}
                    {...attributes}
                >
                    {children}
                </blockquote>
            );
        case "bulleted-list":
            return (
                <ul
                    style={{
                        marginBlockStart: "1em",
                        paddingInlineStart: "40px",
                    }}
                    {...attributes}
                >
                    {children}
                </ul>
            );
        case "heading-one":
            return (
                <h1
                    style={{ fontSize: "2em", fontWeight: "bold" }}
                    {...attributes}
                >
                    {children}
                </h1>
            );
        case "heading-two":
            return (
                <h2
                    style={{ fontSize: "1.5em", fontWeight: "bold" }}
                    {...attributes}
                >
                    {children}
                </h2>
            );
        case "list-item":
            return <li {...attributes}>{children}</li>;
        case "numbered-list":
            return (
                <ol
                    style={{
                        marginBlockStart: "1em",
                        marginBlockEnd: "1em",
                        paddingInlineStart: "40px",
                    }}
                    {...attributes}
                >
                    {children}
                </ol>
            );
        default:
            return <p {...attributes}>{children}</p>;
    }
};

export const Leaf = ({ attributes, children, leaf }: any) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <Code>{children}</Code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};
