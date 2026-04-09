"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/button";
import { Card, CardContent } from "@workspace/ui/card";
import {
  AtSign,
  ChevronDown,
  FolderOpen,
  Home as HomeIcon,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  createCommand,
  $createTextNode,
  $insertNodes,
  DecoratorNode,
  EditorState,
  LexicalNode,
  SerializedLexicalNode,
} from "lexical";

const sidebarItems = [
  { label: "灵感", icon: HomeIcon, active: true },
  { label: "生成", icon: Sparkles, active: false },
  { label: "资产", icon: FolderOpen, active: false },
];

const ratioOptions = [
  { label: "智能", w: 0, h: 0, auto: true },
  { label: "21:9", w: 21, h: 9 },
  { label: "16:9", w: 16, h: 9 },
  { label: "4:3", w: 4, h: 3 },
  { label: "1:1", w: 1, h: 1 },
  { label: "3:4", w: 3, h: 4 },
  { label: "9:16", w: 9, h: 16 },
];

// 输出结构类型
interface EditorContent {
  nodes: Array<
    | { type: "text"; content: string }
    | { type: "asset"; url: string; name: string }
  >;
}

// AssetNode - 原子行内资源节点
class AssetNode extends DecoratorNode<React.ReactNode> {
  __url: string;
  __name: string;

  static getType(): string {
    return "asset";
  }

  static clone(node: AssetNode): AssetNode {
    return new AssetNode(node.__url, node.__name);
  }

  constructor(url: string, name: string) {
    super();
    this.__url = url;
    this.__name = name;
  }

  getType(): string {
    return "asset";
  }

  getURL(): string {
    return this.__url;
  }

  getName(): string {
    return this.__name;
  }

  isInline(): boolean {
    return true;
  }

  isKeyboardEditable(): boolean {
    return false;
  }

  updateDOM(): boolean {
    return false;
  }

  clone(): AssetNode {
    return new AssetNode(this.__url, this.__name);
  }

  exportJSON(): SerializedLexicalNode & { url: string; name: string } {
    return {
      ...super.exportJSON(),
      type: "asset",
      url: this.__url,
      name: this.__name,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedLexicalNode & { url: string; name: string }): AssetNode {
    return new AssetNode(serializedNode.url, serializedNode.name);
  }

  decorate(): React.ReactNode {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-[4px] border border-[#e8e8ea] bg-[#f8f8f9] px-1 py-0.5 align-baseline text-[15px] leading-8 text-zinc-700"
        data-lexical-asset="true"
      >
        <img src={this.__url} alt={this.__name} className="size-4 rounded-[2px] object-cover" />
        <span>{this.__name}</span>
      </span>
    );
  }
}

// 插入资源命令
const INSERT_ASSET_COMMAND = createCommand<{ url: string; name: string }>("INSERT_ASSET_COMMAND");

// 获取编辑器内容
function getEditorContent(editorState: EditorState): EditorContent {
  const nodes: EditorContent["nodes"] = [];

  const root = editorState._nodeMap;
  root.forEach((node: LexicalNode) => {
    const nodeType = (node as unknown as { __type: string }).__type;
    if (nodeType === "text") {
      const textContent = (node as unknown as { __text: string }).__text;
      nodes.push({ type: "text", content: textContent });
    } else if (nodeType === "asset") {
      const assetNode = node as unknown as { __url: string; __name: string };
      nodes.push({ type: "asset", url: assetNode.__url, name: assetNode.__name });
    }
  });

  return { nodes };
}

// 自定义资产节点插件
function AssetNodePlugin({
  onContentChange,
}: {
  onContentChange?: (content: EditorContent) => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const listener = () => {
      const editorState = editor.getEditorState();
      const content = getEditorContent(editorState);
      onContentChange?.(content);
    };

    return editor.registerUpdateListener(listener);
  }, [editor, onContentChange]);

  return null;
}

// 插入资源插件
function InsertAssetPlugin({
  onInsertAsset,
}: {
  onInsertAsset?: (callback: (url: string, name: string) => void) => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const callback = (url: string, name: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = new AssetNode(url, name);
          $insertNodes([node]);
          // 插入后创建空文本节点并移动光标
          const textNode = $createTextNode("");
          $insertNodes([textNode]);
          textNode.select();
        }
      });
    };
    onInsertAsset?.(callback);
  }, [editor, onInsertAsset]);

  return null;
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Array<{ url: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  const [showRatioPopup, setShowRatioPopup] = useState(false);
  const [showAtTooltip, setShowAtTooltip] = useState(false);
  const [showResourcePopup, setShowResourcePopup] = useState(false);
  const [editorContent, setEditorContent] = useState<EditorContent>({ nodes: [] });
  const insertAssetRef = useRef<((url: string, name: string) => void) | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const allSelected = Array.from(selected);
    e.target.value = "";

    const remaining = 9 - files.length;
    if (remaining <= 0) {
      toast.error("图片最多支持 9 张");
      return;
    }

    const toUpload = allSelected.slice(0, remaining);
    if (allSelected.length > remaining) {
      toast.error(`最多还能上传 ${remaining} 张，已自动截取`);
    }

    setUploading(true);
    try {
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:3002/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || "上传失败");
        }

        const data: { url: string; key: string } = await res.json();
        setFiles((prev) => [
          ...prev,
          { url: data.url, name: `图片${prev.length + 1}` },
        ]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const handleInsertResource = () => {
    setShowResourcePopup(true);
  };

  const handleSelectResource = (resource: { url: string; name: string }) => {
    if (insertAssetRef.current) {
      insertAssetRef.current(resource.url, resource.name);
    }
    setShowResourcePopup(false);
    setEditorKey((k) => k + 1);
  };

  const initialConfig = useMemo(
    () => ({
      namespace: "creative-editor",
      onError: (error: Error) => console.error(error),
      nodes: [AssetNode],
    }),
    []
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fafafa_0%,#f7f8fa_100%)] text-zinc-950">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-[84px] shrink-0 flex-col items-center justify-between border-r border-[#ececef] bg-[#f8f8f9] py-7 lg:flex">
          <div className="flex flex-col items-center gap-8">
            <div className="flex size-8 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#2563eb)] text-white shadow-[0_6px_18px_rgba(37,99,235,0.16)]">
              <Sparkles className="size-[14px]" />
            </div>
            <nav className="flex flex-col gap-7">
              {sidebarItems.map(({ label, icon: Icon, active }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex size-9 items-center justify-center rounded-[12px] transition ${
                      active
                        ? "bg-zinc-950 text-white shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
                        : "text-zinc-700 hover:bg-white"
                    }`}
                  >
                    <Icon className="size-[17px]" />
                  </div>
                  <span className="text-[12px] leading-4 text-zinc-700">{label}</span>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-center gap-5">
            <div className="rounded-[14px] border border-sky-100/70 bg-white px-3 py-3 text-center text-sky-600 shadow-[0_1px_4px_rgba(14,165,233,0.04)]">
              <div className="text-[18px] font-semibold leading-5">66</div>
              <div className="mt-1 text-[11px]">开会员</div>
            </div>
            <div className="size-8 rounded-full border border-zinc-200 bg-white" />
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="mx-auto w-full max-w-[1730px] px-5 lg:px-7">
            <section className="mx-auto max-w-[1188px]">
              <div className="pb-12 text-center">
                <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-zinc-950 md:text-[34px]">
                  打造爆款视频
                </h1>
              </div>

              <Card className="rounded-[28px] border-[#ececef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.01),0_10px_28px_rgba(15,23,42,0.02)]">
                <CardContent className="p-[18px]">
                  <div className="relative mb-9" style={{ minHeight: "84px" }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,video/mp4"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    {/* Lexical 富文本编辑器区域 */}
                    <div className="relative flex items-start gap-5">
                      {/* 左侧 + 按钮 */}
                      <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`mt-[6px] flex h-[78px] w-[56px] shrink-0 rotate-[-9deg] cursor-pointer items-center justify-center rounded-[6px] border border-[#ececef] bg-[linear-gradient(180deg,#f6f6f7_0%,#efeff1_100%)] text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-transform duration-150 hover:scale-[1.1] ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <span className="text-[31px] font-light leading-none">+</span>
                      </div>

                      {/* Lexical 编辑器 */}
                      <div className="min-h-[78px] flex-1 pt-1">
                        <LexicalComposer
                          key={editorKey}
                          initialConfig={initialConfig}
                        >
                          <RichTextPlugin
                            contentEditable={
                              <ContentEditable className="text-[15px] leading-8 text-zinc-400 outline-none min-h-[78px]" />
                            }
                            placeholder={
                              <div className="text-[15px] leading-8 text-zinc-400 pointer-events-none absolute top-0 left-0 select-none">
                                上传产品图、输入文字或
                                <span
                                  className="relative mx-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-[10px] border border-[#e8e8ea] bg-white text-sky-500 pointer-events-auto"
                                  onMouseEnter={() => setShowAtTooltip(true)}
                                  onMouseLeave={() => setShowAtTooltip(false)}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleInsertResource();
                                  }}
                                >
                                  @
                                  {showAtTooltip && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-[11px] text-white shadow">
                                      引用参考
                                    </span>
                                  )}
                                </span>
                                主体，打造爆款视频吧！
                              </div>
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                          />
                          <AssetNodePlugin
                            onContentChange={setEditorContent}
                          />
                          <InsertAssetPlugin
                            onInsertAsset={(callback) => {
                              insertAssetRef.current = callback;
                            }}
                          />
                        </LexicalComposer>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[8px] text-zinc-700"
                        onClick={() => setShowRatioPopup((v) => !v)}
                      >
                        {selectedRatio === "智能" ? "智能" : selectedRatio}
                        <ChevronDown className="ml-1 size-3.5" />
                      </Button>
                      {showRatioPopup && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowRatioPopup(false)} />
                          <div className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-[12px] border border-[#ececef] bg-white p-2 shadow-lg">
                            {ratioOptions.map((opt) => (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => {
                                  setSelectedRatio(opt.label);
                                  setShowRatioPopup(false);
                                }}
                                className={`flex min-w-[52px] flex-col items-center gap-1.5 rounded-[8px] px-2 py-2 transition-colors ${
                                  selectedRatio === opt.label
                                    ? "bg-zinc-900 text-white"
                                    : "text-zinc-500 hover:bg-zinc-100"
                                }`}
                              >
                                <div
                                  className={`rounded-[3px] border ${
                                    selectedRatio === opt.label ? "border-white/40" : "border-zinc-300"
                                  }`}
                                  style={{
                                    width: opt.auto ? "16px" : `${Math.round((opt.w / opt.h) * 14)}px`,
                                    height: "14px",
                                  }}
                                />
                                <span className="text-[11px] leading-none whitespace-nowrap">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[8px] px-3 text-zinc-700"
                        onMouseEnter={() => setShowAtTooltip(true)}
                        onMouseLeave={() => setShowAtTooltip(false)}
                        onClick={() => handleInsertResource()}
                      >
                        <AtSign className="size-4" />
                        {showAtTooltip && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-[11px] text-white shadow">
                            引用参考
                          </span>
                        )}
                      </Button>
                      {showResourcePopup && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowResourcePopup(false)} />
                          <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-[#ececef] bg-white p-3 shadow-lg">
                            <div className="mb-2 text-xs text-zinc-400">选择参考图片</div>
                            {files.length === 0 ? (
                              <div className="py-4 text-center text-sm text-zinc-400">暂无上传资源</div>
                            ) : (
                              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                                {files.map((f) => (
                                  <button
                                    key={f.url}
                                    type="button"
                                    onClick={() => handleSelectResource(f)}
                                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-zinc-100"
                                  >
                                    <img
                                      src={f.url}
                                      className="size-10 shrink-0 rounded object-cover"
                                      alt={f.name}
                                    />
                                    <span className="text-sm text-zinc-700">{f.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="ml-auto">
                      <Button className="size-10 rounded-full border border-[#e8e8ea] bg-zinc-100 p-0 text-zinc-500 shadow-none hover:bg-zinc-200/80">
                        <Send className="size-[18px]" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
