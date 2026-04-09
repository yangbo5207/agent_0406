"use client";

import { createContext, useContext } from "react";

import type { PromptAsset } from "./types";

type PromptEditorContextValue = {
  onPreviewAsset?: (asset: PromptAsset) => void;
};

const PromptEditorContext = createContext<PromptEditorContextValue>({});

export function PromptEditorContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PromptEditorContextValue;
}) {
  return (
    <PromptEditorContext.Provider value={value}>
      {children}
    </PromptEditorContext.Provider>
  );
}

export function usePromptEditorContext() {
  return useContext(PromptEditorContext);
}
