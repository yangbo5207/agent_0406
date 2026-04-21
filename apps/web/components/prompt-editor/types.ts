export type PromptAsset = {
  name: string;
  url: string;
};

export type PromptSegment =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "asset";
      asset: PromptAsset;
    };

export type AssetInsertMode = "saved-or-end" | "start";

export type PromptEditorHandle = {
  focus: () => void;
  insertAsset: (
    asset: PromptAsset,
    options?: {
      mode?: AssetInsertMode;
    },
  ) => void;
  removeAssetReferences: (asset: PromptAsset) => void;
  getStructuredContent: () => PromptSegment[];
  isEmpty: () => boolean;
};
