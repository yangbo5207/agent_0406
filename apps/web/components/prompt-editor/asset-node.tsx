"use client";

/* eslint-disable @next/next/no-img-element */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import { cn } from "@workspace/ui/lib/utils";
import {
  $getNodeByKey,
  COMMAND_PRIORITY_EDITOR,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type LexicalEditor,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { useEffect, useState, type JSX } from "react";

import { usePromptEditorContext } from "./context";
import type { PromptAsset } from "./types";

const ASSET_NODE_TYPE = "prompt-asset";

export type SerializedAssetNode = Spread<
  {
    asset: PromptAsset;
    type: typeof ASSET_NODE_TYPE;
    version: 1;
  },
  SerializedLexicalNode
>;

export class AssetNode extends DecoratorNode<JSX.Element> {
  __asset: PromptAsset;

  static getType(): string {
    return ASSET_NODE_TYPE;
  }

  static clone(node: AssetNode): AssetNode {
    return new AssetNode(node.__asset, node.__key);
  }

  static importJSON(serializedNode: SerializedAssetNode): AssetNode {
    return $createAssetNode(serializedNode.asset);
  }

  constructor(asset: PromptAsset, key?: NodeKey) {
    super(key);
    this.__asset = asset;
  }

  createDOM(): HTMLElement {
    const element = document.createElement("span");
    element.className = "inline-flex align-middle";
    return element;
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedAssetNode {
    return {
      ...super.exportJSON(),
      asset: this.getAsset(),
      type: ASSET_NODE_TYPE,
      version: 1,
    };
  }

  getTextContent(): string {
    return this.getAsset().name;
  }

  getAsset(): PromptAsset {
    return this.getLatest().__asset;
  }

  isInline(): true {
    return true;
  }

  isIsolated(): true {
    return true;
  }

  isKeyboardSelectable(): true {
    return true;
  }

  decorate(): JSX.Element {
    return <AssetChip asset={this.getAsset()} nodeKey={this.__key} />;
  }
}

function AssetChip({
  asset,
  nodeKey,
}: {
  asset: PromptAsset;
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [imageBroken, setImageBroken] = useState(false);
  const { onPreviewAsset } = usePromptEditorContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        (event) =>
          handleNodeRemoval(editor, nodeKey, isSelected, "backward", event),
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        (event) =>
          handleNodeRemoval(editor, nodeKey, isSelected, "forward", event),
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor, isSelected, nodeKey]);

  return (
    <button
      type="button"
      contentEditable={false}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        clearSelection();
        setSelected(true);
        editor.focus();
        onPreviewAsset?.(asset);
      }}
      className={cn(
        "mx-0.5 inline-flex h-[1.6em] max-w-[18rem] cursor-zoom-in items-center gap-1 rounded-full border border-[#e8e8ea] bg-[#f8f8f9] px-1.5 align-middle text-[15px] leading-none text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-colors",
        isSelected &&
          "border-sky-400 bg-sky-50 text-sky-700 shadow-[0_0_0_1px_rgba(14,165,233,0.16)]",
      )}
    >
      {imageBroken ? (
        <span className="flex size-[1.35em] shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[0.68em] font-medium uppercase text-zinc-600">
          {asset.name.slice(0, 1)}
        </span>
      ) : (
        <img
          src={asset.url}
          alt={asset.name}
          onError={() => setImageBroken(true)}
          className="size-[1.35em] shrink-0 rounded-full object-cover"
        />
      )}
      <span className="max-w-[11rem] truncate text-[1em] leading-none">
        {asset.name}
      </span>
    </button>
  );
}

function handleNodeRemoval(
  editor: LexicalEditor,
  nodeKey: NodeKey,
  isSelected: boolean,
  direction: "backward" | "forward",
  event?: KeyboardEvent | null,
) {
  if (!isSelected) {
    return false;
  }

  event?.preventDefault();
  event?.stopPropagation();

  editor.update(() => {
    const node = $getNodeByKey(nodeKey);

    if (!$isAssetNode(node)) {
      return;
    }

    if (direction === "backward") {
      node.selectPrevious();
    } else {
      node.selectNext();
    }

    node.remove();
  });

  return true;
}

export function $createAssetNode(asset: PromptAsset): AssetNode {
  return new AssetNode(asset);
}

export function $isAssetNode(
  node: unknown,
): node is AssetNode {
  return node instanceof AssetNode;
}
