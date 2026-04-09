"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { mergeRegister } from "@lexical/utils";
import { cn } from "@workspace/ui/lib/utils";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isNodeSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  $nodesOfType,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
} from "lexical";
import {
  forwardRef,
  type MutableRefObject,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { AssetNode, $createAssetNode, $isAssetNode } from "./asset-node";
import { PromptEditorContextProvider } from "./context";
import type {
  AssetInsertMode,
  PromptAsset,
  PromptEditorHandle,
  PromptSegment,
} from "./types";

const editorTheme = {
  paragraph: "m-0",
};

type PromptEditorProps = {
  className?: string;
  onOpenAssetPicker: () => void;
  onPreviewAsset?: (asset: PromptAsset) => void;
};

export const PromptEditor = forwardRef<PromptEditorHandle, PromptEditorProps>(
  function PromptEditor(
    { className, onOpenAssetPicker, onPreviewAsset },
    ref,
  ) {
    const editorRef = useRef<LexicalEditor | null>(null);
    const lastSelectionRef = useRef<RangeSelection | null>(null);

    const initialConfig = useMemo(
      () => ({
        namespace: "prompt-editor",
        nodes: [AssetNode],
        onError(error: Error) {
          throw error;
        },
        theme: editorTheme,
      }),
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        focus() {
          editorRef.current?.focus();
        },
        insertAsset(asset, options) {
          const editor = editorRef.current;

          if (!editor) {
            return;
          }

          insertAssetIntoEditor(
            editor,
            lastSelectionRef,
            asset,
            options?.mode ?? "saved-or-end",
          );
        },
        removeAssetReferences(asset) {
          const editor = editorRef.current;

          if (!editor) {
            return;
          }

          removeAssetReferencesFromEditor(editor, asset);
        },
        getStructuredContent() {
          const editor = editorRef.current;

          if (!editor) {
            return [];
          }

          return editor.getEditorState().read(() => serializePromptContent());
        },
        isEmpty() {
          const editor = editorRef.current;

          if (!editor) {
            return true;
          }

          return editor
            .getEditorState()
            .read(() => serializePromptContent().length === 0);
        },
      }),
      [],
    );

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <PromptEditorContextProvider value={{ onPreviewAsset }}>
          <div className={cn("relative", className)}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  aria-label="创作提示词输入框"
                  className="min-h-[84px] w-full bg-transparent pt-1 text-[15px] leading-8 text-zinc-950 caret-zinc-950 outline-none"
                  spellCheck={false}
                />
              }
              placeholder={
                <PromptPlaceholder onOpenAssetPicker={onOpenAssetPicker} />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <EditorRefPlugin editorRef={editorRef} />
            <SelectionTrackerPlugin lastSelectionRef={lastSelectionRef} />
          </div>
        </PromptEditorContextProvider>
      </LexicalComposer>
    );
  },
);

function PromptPlaceholder({
  onOpenAssetPicker,
}: {
  onOpenAssetPicker: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="pointer-events-auto absolute inset-0 cursor-text pt-1 text-[15px] leading-8 text-zinc-400"
      onMouseDown={(event) => {
        const target = event.target;

        if (target instanceof HTMLElement && target.closest("[data-at-trigger]")) {
          return;
        }

        event.preventDefault();
        editor.focus();
      }}
    >
      上传产品图、输入文字或
      <span className="relative mx-2 inline-flex align-middle">
        <button
          type="button"
          data-at-trigger
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={(event) => {
            event.preventDefault();
            editor.focus();
            onOpenAssetPicker();
          }}
          className="inline-flex size-8 items-center justify-center rounded-[10px] border border-[#e8e8ea] bg-white text-sky-500 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
        >
          @
        </button>
        {showTooltip && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-[11px] leading-none text-white shadow">
            引用参考
          </span>
        )}
      </span>
      主体，打造爆款视频吧！
    </div>
  );
}

function SelectionTrackerPlugin({
  lastSelectionRef,
}: {
  lastSelectionRef: MutableRefObject<RangeSelection | null>;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.getEditorState().read(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              lastSelectionRef.current = selection.clone();
            }
          });

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            lastSelectionRef.current = selection.clone();
          }
        });
      }),
    );
  }, [editor, lastSelectionRef]);

  return null;
}

function ensureParagraphAtRoot() {
  const root = $getRoot();

  if (root.getChildrenSize() === 0) {
    root.append($createParagraphNode());
  }

  return root;
}

function insertAssetIntoEditor(
  editor: LexicalEditor,
  lastSelectionRef: MutableRefObject<RangeSelection | null>,
  asset: PromptAsset,
  mode: AssetInsertMode,
) {
  editor.update(() => {
    let selection = $getSelection();

    if ($isNodeSelection(selection)) {
      const [selectedNode] = selection.getNodes();

      if (selectedNode) {
        selectedNode.selectNext();
        selection = $getSelection();
      }
    }

    if (mode === "start") {
      selection = selectEditorBoundary("start");
    } else if (!$isRangeSelection(selection)) {
      const lastSelection = lastSelectionRef.current;

      if (lastSelection) {
        $setSelection(lastSelection.clone());
        selection = $getSelection();
      }

      if (!$isRangeSelection(selection)) {
        selection = selectEditorBoundary("end");
      }
    }

    if (!$isRangeSelection(selection)) {
      return;
    }

    const assetNode = $createAssetNode(asset);
    selection.insertNodes([assetNode]);
    assetNode.selectNext();
  });

  editor.focus();
}

function removeAssetReferencesFromEditor(
  editor: LexicalEditor,
  asset: PromptAsset,
) {
  editor.update(() => {
    const referencedNodes = $nodesOfType(AssetNode).filter(
      (node) => node.getAsset().url === asset.url,
    );

    referencedNodes.forEach((node) => {
      if (node.isSelected()) {
        node.selectNext();
      }

      node.remove();
    });
  });
}

function selectEditorBoundary(position: "start" | "end") {
  const root = ensureParagraphAtRoot();
  const targetNode =
    position === "start" ? root.getFirstChild() : root.getLastChild();

  if ($isElementNode(targetNode)) {
    return position === "start" ? targetNode.selectStart() : targetNode.selectEnd();
  }

  return $getSelection();
}

function serializePromptContent(): PromptSegment[] {
  const segments: PromptSegment[] = [];
  const topLevelNodes = $getRoot().getChildren();

  topLevelNodes.forEach((node, index) => {
    appendSegmentsFromNode(node, segments);

    if (index < topLevelNodes.length - 1) {
      appendTextSegment(segments, "\n");
    }
  });

  return segments.filter(
    (segment) => segment.type === "asset" || segment.text.length > 0,
  );
}

function appendSegmentsFromNode(
  node: LexicalNode,
  segments: PromptSegment[],
): void {
  if ($isTextNode(node)) {
    appendTextSegment(segments, node.getTextContent());
    return;
  }

  if ($isLineBreakNode(node)) {
    appendTextSegment(segments, "\n");
    return;
  }

  if ($isAssetNode(node)) {
    segments.push({
      asset: node.getAsset(),
      type: "asset",
    });
    return;
  }

  if ($isElementNode(node)) {
    node.getChildren().forEach((child) => {
      appendSegmentsFromNode(child, segments);
    });
    return;
  }

  appendTextSegment(segments, node.getTextContent());
}

function appendTextSegment(segments: PromptSegment[], text: string) {
  if (!text) {
    return;
  }

  const previousSegment = segments[segments.length - 1];

  if (previousSegment?.type === "text") {
    previousSegment.text += text;
    return;
  }

  segments.push({
    text,
    type: "text",
  });
}

PromptEditor.displayName = "PromptEditor";
