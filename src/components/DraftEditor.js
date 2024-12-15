import React, { useState, useEffect } from "react";
import { Editor, EditorState, RichUtils, Modifier, convertFromRaw, convertToRaw } from "draft-js";
import "draft-js/dist/Draft.css";

const DraftEditor = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
        const savedContent = localStorage.getItem("editorState");  // Load saved editor state from localStorage

        if (savedContent) {
            try {
                const parsedContent = JSON.parse(savedContent);
                const contentState = convertFromRaw(parsedContent);
                setEditorState(EditorState.createWithContent(contentState));
            } catch (e) {
                console.error("Failed to load editor state from localStorage:", e);
            }
        }
    }, []);

    const handleBeforeInput = (input, editorState) => {
        const currentContent = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const startKey = selection.getStartKey();
        const startOffset = selection.getStartOffset();
        const block = currentContent.getBlockForKey(startKey);
        const text = block.getText().slice(0, startOffset) + input;

        if (text === "# ") {
            // Remove '# ' and convert to header
            const newContentState = Modifier.replaceText(
                currentContent,
                selection.merge({
                    anchorOffset: 0,
                    focusOffset: startOffset + 2, // Skip over '# ' (2 characters)
                }),
                editorState.getCurrentInlineStyle()
            );

            const newEditorState = EditorState.push(
                editorState,
                newContentState,
                "change-block-type"
            );

            // Change block type to header-one
            const updatedEditorState = Modifier.setBlockType(
                newEditorState.getCurrentContent(),
                newEditorState.getSelection(),
                "header-one"
            );

            setEditorState(EditorState.push(newEditorState, updatedEditorState, "change-block-type"));
            return "handled";
        }

        if (text === "* ") {
            // Apply bold
            const newContentState = Modifier.replaceText(
                currentContent,
                selection.merge({
                    anchorOffset: 0,
                    focusOffset: startOffset + 1,
                }),
                "",
                editorState.getCurrentInlineStyle()
            );
            const newEditorState = RichUtils.toggleInlineStyle(
                EditorState.push(editorState, newContentState, "insert-characters"),
                "BOLD"
            );
            setEditorState(newEditorState);
            return "handled";
        }

        if (text === "** ") {
            // Apply red text
            const newContentState = Modifier.replaceText(
                currentContent,
                selection.merge({
                    anchorOffset: 0,
                    focusOffset: startOffset + 2,
                }),
                "",
                editorState.getCurrentInlineStyle()
            );
            const newEditorState = RichUtils.toggleInlineStyle(
                EditorState.push(editorState, newContentState, "insert-characters"),
                "RED"
            );
            setEditorState(newEditorState);
            return "handled";
        }

        if (text === "*** ") {
            // Apply underline
            const newContentState = Modifier.replaceText(
                currentContent,
                selection.merge({
                    anchorOffset: 0,
                    focusOffset: startOffset + 3,
                }),
                "",
                editorState.getCurrentInlineStyle()
            );
            const newEditorState = RichUtils.toggleInlineStyle(
                EditorState.push(editorState, newContentState, "insert-characters"),
                "UNDERLINE"
            );
            setEditorState(newEditorState);
            return "handled";
        }

        return "not-handled";
    };

    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return "handled";
        }
        return "not-handled";
    };

    const handleSave = () => {
        // Save editor content to localStorage
        const contentState = editorState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        localStorage.setItem("editorState", JSON.stringify(rawContent));
        alert("Content saved!");
    };

    return (
        <>
            <div className="topContent" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Demo Editor By Tejas Salunke</h1>
                <div className="saveBtn">
                    <button style={{ padding: "10px 43px", cursor: "pointer" }} onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div >
            <div style={{ border: "1px solid #ddd", padding: "10px", minHeight: "200px" }}>
                <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    handleBeforeInput={(input) => handleBeforeInput(input, editorState)}
                    handleKeyCommand={handleKeyCommand}
                    customStyleMap={{
                        RED: { color: "red" },
                        UNDERLINE: { textDecoration: "underline" }
                    }}
                    placeholder="Press # , * , ** or *** and Space"
                />
            </div>
        </>
    );
};

export default DraftEditor;
