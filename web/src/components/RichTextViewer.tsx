import React, { useMemo, useCallback } from "react";
import { Descendant, createEditor } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { Element, Leaf } from "./RichTextEditor";

interface RichTextViewerProps {
    textBody: Descendant[];
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({ textBody }) => {
    const editor = useMemo(() => withReact(createEditor()), []);
    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

    return (
        <Slate editor={editor} value={textBody} onChange={(value) => {}}>
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                readOnly
            />
        </Slate>
    );
};
