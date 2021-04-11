import React, {
    LegacyRef,
    PropsWithChildren,
    Ref,
    RefObject,
    useEffect,
    useRef,
} from "react";
import { ClassNames } from "@emotion/react";
import { Editor, Range, Text, Transforms } from "slate";
import { useSlate, ReactEditor } from "slate-react";
import { Portal } from "@chakra-ui/portal";

interface BaseProps {
    className: string;
    [key: string]: unknown;
}

const Menu = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: LegacyRef<HTMLDivElement>
    ) => (
        <ClassNames>
            {({ css, cx }) => (
                <div
                    {...props}
                    ref={ref}
                    className={cx(
                        className,
                        css`
                            & > * {
                                display: inline-block;
                            }
                            & > * + * {
                                margin-left: 15px;
                            }
                        `
                    )}
                />
            )}
        </ClassNames>
    )
);

export const ToolBarButton = React.forwardRef(
    (
        {
            className,
            active,
            reversed,
            ...props
        }: PropsWithChildren<
            {
                active: boolean;
                reversed: boolean;
            } & BaseProps
        >,
        ref: LegacyRef<HTMLSpanElement>
    ) => (
        <ClassNames>
            {({ css, cx }) => (
                <span
                    {...props}
                    ref={ref}
                    className={cx(
                        className,
                        css`
                            cursor: pointer;
                            color: ${reversed
                                ? active
                                    ? "white"
                                    : "#aaa"
                                : active
                                ? "black"
                                : "#ccc"};
                        `
                    )}
                />
            )}
        </ClassNames>
    )
);

export const Icon = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: LegacyRef<HTMLSpanElement>
    ) => (
        <ClassNames>
            {({ css, cx }) => (
                <span
                    {...props}
                    ref={ref}
                    className={cx(
                        "material-icons",
                        className,
                        css`
                            font-size: 18px;
                            vertical-align: text-bottom;
                        `
                    )}
                />
            )}
        </ClassNames>
    )
);

export const Toolbar = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: Ref<HTMLDivElement>
    ) => (
        <ClassNames>
            {({ css, cx }) => (
                <Menu
                    {...props}
                    ref={ref}
                    className={cx(
                        className,
                        css`
                            position: relative;
                            padding: 1px 18px 17px;
                            border-bottom: 2px solid #eee;
                            margin-top: 20px;
                            margin-bottom: 20px;
                        `
                    )}
                />
            )}
        </ClassNames>
    )
);

const FormatButton = ({ format, icon }: any) => {
    const editor = useSlate();
    return (
        <ToolBarButton
            reversed
            active={isFormatActive(editor, format)}
            onMouseDown={(event: Event) => {
                event.preventDefault();
                toggleFormat(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </ToolBarButton>
    );
};

export const toggleFormat = (editor: Editor, format: string) => {
    const isActive = isFormatActive(editor, format);
    Transforms.setNodes(
        editor,
        { [format]: isActive ? null : true },
        { match: Text.isText, split: true }
    );
};

const isFormatActive = (editor: Editor, format: string) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => n[format] === true,
        mode: "all",
    });
    return !!match;
};

export const HoveringToolbar = () => {
    const ref = useRef<HTMLDivElement>();
    const editor = useSlate();

    useEffect(() => {
        const el = ref.current;
        const { selection } = editor;

        if (!el) return;

        if (
            !selection ||
            !ReactEditor.isFocused(editor) ||
            Range.isCollapsed(selection) ||
            Editor.string(editor, selection) === ""
        ) {
            el.removeAttribute("style");
            return;
        }

        const domSelection = window.getSelection();

        if (!domSelection) return;

        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();
        el.style.opacity = "1";
        el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
        el.style.left = `${
            rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
        }px`;
    });

    return (
        <Portal>
            <ClassNames>
                {({ css }) => (
                    <Menu
                        ref={ref as Ref<HTMLDivElement>}
                        className={css`
                            padding: 8px 7px 6px;
                            position: absolute;
                            z-index: 1;
                            top: -10000px;
                            left: -10000px;
                            margin-top: -6px;
                            opacity: 0;
                            background-color: #222;
                            border-radius: 4px;
                            transition: opacity 0.75s;
                        `}
                    >
                        <FormatButton format="bold" icon="format_bold" />
                        <FormatButton format="italic" icon="format_italic" />
                        <FormatButton
                            format="underline"
                            icon="format_underlined"
                        />
                    </Menu>
                )}
            </ClassNames>
        </Portal>
    );
};
