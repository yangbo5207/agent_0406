"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useRef, useState } from "react";
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

import { PromptEditor } from "../components/prompt-editor/prompt-editor";
import type {
  PromptAsset,
  PromptEditorHandle,
  PromptSegment,
} from "../components/prompt-editor/types";

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

type ResourceInsertSource = "toolbar-at" | "placeholder-at";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptEditorRef = useRef<PromptEditorHandle>(null);
  const [files, setFiles] = useState<PromptAsset[]>([]);
  const [fullscreenAsset, setFullscreenAsset] = useState<PromptAsset | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  const [showRatioPopup, setShowRatioPopup] = useState(false);
  const [showAtTooltip, setShowAtTooltip] = useState(false);
  const [showResourcePopup, setShowResourcePopup] = useState(false);
  const [resourceInsertSource, setResourceInsertSource] =
    useState<ResourceInsertSource>("toolbar-at");

  const handleImageHover = useCallback((index: number | null) => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }

    if (index !== null) {
      hoverTimer.current = setTimeout(() => setHoveredIndex(index), 50);
    } else {
      setHoveredIndex(null);
    }
  }, []);

  const handleDelete = (index: number) => {
    const removedAsset = files[index];

    if (!removedAsset) {
      return;
    }

    promptEditorRef.current?.removeAssetReferences(removedAsset);

    if (fullscreenAsset?.url === removedAsset.url) {
      setFullscreenAsset(null);
    }

    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((file, i) => ({ ...file, name: `图片${i + 1}` }));
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;

    if (!selected || selected.length === 0) {
      return;
    }

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
          body: formData,
          method: "POST",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || "上传失败");
        }

        const data: { url: string } = await res.json();

        setFiles((prev) => [
          ...prev,
          {
            name: `图片${prev.length + 1}`,
            url: data.url,
          },
        ]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const openResourcePicker = (source: ResourceInsertSource) => {
    setResourceInsertSource(source);
    setShowAtTooltip(false);
    setShowResourcePopup(true);
  };

  const handleInsertResource = (asset: PromptAsset) => {
    promptEditorRef.current?.insertAsset(asset, {
      mode: resourceInsertSource === "placeholder-at" ? "start" : "saved-or-end",
    });
    setShowResourcePopup(false);
  };

  const handleSend = () => {
    const content = promptEditorRef.current?.getStructuredContent() ?? [];

    if (isPromptEmpty(content)) {
      toast.error("请输入文字或插入资源");
      return;
    }

    console.log("promptSegments", content);
    toast.success(`已读取 ${content.length} 段结构化内容`);
  };

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
                  <span className="text-[12px] leading-4 text-zinc-700">
                    {label}
                  </span>
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
                  <div
                    className="mb-9 flex items-start gap-5"
                    style={{ minHeight: "84px" }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,video/mp4"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    {files.length === 0 ? (
                      <div
                        onClick={() =>
                          !uploading && fileInputRef.current?.click()
                        }
                        className={`mt-[6px] flex h-[78px] w-[56px] shrink-0 rotate-[-9deg] cursor-pointer items-center justify-center rounded-[6px] border border-[#ececef] bg-[linear-gradient(180deg,#f6f6f7_0%,#efeff1_100%)] text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-transform duration-150 hover:scale-[1.1] ${
                          uploading ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        <span className="text-[31px] font-light leading-none">
                          +
                        </span>
                      </div>
                    ) : (
                      <div className="relative mt-[6px] h-[78px] w-[56px] shrink-0 overflow-visible">
                        <div
                          className="absolute top-0 left-0 h-[78px] transition-[width] duration-500"
                          style={{
                            width: hovered
                              ? `${(files.length < 9 ? files.length : files.length - 1) * 68 + 56}px`
                              : "56px",
                          }}
                          onMouseEnter={() => setHovered(true)}
                          onMouseLeave={() => {
                            setHovered(false);
                            handleImageHover(null);
                          }}
                        >
                          {files.map((file, i) => (
                            <div
                              key={file.url}
                              className="absolute top-0 left-0 h-[78px] w-[56px] transition-all duration-500"
                              style={{
                                opacity: !hovered && i < files.length - 3 ? 0 : 1,
                                transform: hovered
                                  ? `translateX(${i * 68}px) rotate(${(files.length - i) % 2 === 0 ? 5 : -5}deg)${hoveredIndex === i ? " scale(1.1)" : ""}`
                                  : `rotate(${(files.length - 1 - i) % 2 === 0 ? 8 : -8}deg)`,
                                zIndex: hoveredIndex === i ? 20 : i,
                              }}
                              onMouseEnter={() => hovered && handleImageHover(i)}
                              onMouseLeave={() => handleImageHover(null)}
                            >
                              {hovered && hoveredIndex === i && (
                                <>
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-white shadow">
                                    {file.name}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDelete(i);
                                    }}
                                    className="absolute -right-1.5 -top-1.5 z-30 flex size-4 items-center justify-center rounded-full bg-zinc-900 text-white shadow transition-colors hover:bg-black"
                                  >
                                    <X className="size-2.5" />
                                  </button>
                                </>
                              )}
                              <img
                                src={file.url}
                                alt={file.name}
                                className="h-full w-full rounded-[6px] border border-[#ececef] object-cover shadow-sm"
                              />
                            </div>
                          ))}
                          {files.length < 9 && (
                            <div
                              onClick={() =>
                                !uploading && fileInputRef.current?.click()
                              }
                              className={`absolute top-0 left-0 flex h-[78px] w-[56px] cursor-pointer items-center justify-center rounded-[6px] border border-[#ececef] bg-[linear-gradient(180deg,#f6f6f7_0%,#efeff1_100%)] text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-all duration-500 hover:scale-[1.1] ${
                                uploading ? "pointer-events-none opacity-50" : ""
                              }`}
                              style={{
                                opacity: hovered ? 1 : 0,
                                transform: hovered
                                  ? `translateX(${files.length * 68}px) rotate(5deg)`
                                  : "rotate(-12deg)",
                                zIndex: files.length,
                              }}
                            >
                              <span className="text-[31px] font-light leading-none">
                                +
                              </span>
                            </div>
                          )}
                        </div>
                        {files.length < 9 && !hovered && (
                          <button
                            type="button"
                            onClick={() =>
                              !uploading && fileInputRef.current?.click()
                            }
                            className={`absolute z-30 flex size-8 items-center justify-center rounded-full border border-[#e8e8ea] bg-zinc-100 text-zinc-500 shadow-sm transition-all hover:bg-zinc-200 hover:shadow-md ${
                              uploading ? "pointer-events-none opacity-50" : ""
                            }`}
                            style={{ top: "58px", left: "36px" }}
                          >
                            <span className="text-md leading-none">+</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="relative z-0 min-w-0 flex-1">
                      <PromptEditor
                        ref={promptEditorRef}
                        onOpenAssetPicker={() =>
                          openResourcePicker("placeholder-at")
                        }
                        onPreviewAsset={setFullscreenAsset}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[8px] text-zinc-700"
                        onClick={() => setShowRatioPopup((value) => !value)}
                      >
                        {selectedRatio === "智能" ? "智能" : selectedRatio}
                        <ChevronDown className="ml-1 size-3.5" />
                      </Button>
                      {showRatioPopup && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowRatioPopup(false)}
                          />
                          <div className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-[12px] border border-[#ececef] bg-white p-2 shadow-lg">
                            {ratioOptions.map((option) => (
                              <button
                                key={option.label}
                                type="button"
                                onClick={() => {
                                  setSelectedRatio(option.label);
                                  setShowRatioPopup(false);
                                }}
                                className={`flex min-w-[52px] flex-col items-center gap-1.5 rounded-[8px] px-2 py-2 transition-colors ${
                                  selectedRatio === option.label
                                    ? "bg-zinc-900 text-white"
                                    : "text-zinc-500 hover:bg-zinc-100"
                                }`}
                              >
                                <div
                                  className={`rounded-[3px] border ${
                                    selectedRatio === option.label
                                      ? "border-white/40"
                                      : "border-zinc-300"
                                  }`}
                                  style={{
                                    height: "14px",
                                    width: option.auto
                                      ? "16px"
                                      : `${Math.round((option.w / option.h) * 14)}px`,
                                  }}
                                />
                                <span className="whitespace-nowrap text-[11px] leading-none">
                                  {option.label}
                                </span>
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
                        onClick={() => openResourcePicker("toolbar-at")}
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
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowResourcePopup(false)}
                          />
                          <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-[#ececef] bg-white p-3 shadow-lg">
                            <div className="mb-2 text-xs text-zinc-400">
                              选择参考图片
                            </div>
                            {files.length === 0 ? (
                              <div className="py-4 text-center text-sm text-zinc-400">
                                暂无上传资源
                              </div>
                            ) : (
                              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                                {files.map((file) => (
                                  <button
                                    key={file.url}
                                    type="button"
                                    onClick={() => handleInsertResource(file)}
                                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-zinc-100"
                                  >
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="size-10 shrink-0 rounded object-cover"
                                    />
                                    <span className="text-sm text-zinc-700">
                                      {file.name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="ml-auto">
                      <Button
                        onClick={handleSend}
                        className="size-10 rounded-full border border-[#e8e8ea] bg-zinc-100 p-0 text-zinc-500 shadow-none hover:bg-zinc-200/80"
                      >
                        <Send className="size-[18px]" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {fullscreenAsset && (
                <div
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]"
                  onClick={() => setFullscreenAsset(null)}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFullscreenAsset(null);
                    }}
                    className="fixed top-5 right-5 z-[60] flex size-11 items-center justify-center rounded-full bg-white/10 text-white shadow-[0_12px_36px_rgba(0,0,0,0.32)] transition-colors hover:bg-white/18"
                    aria-label="关闭预览"
                  >
                    <X className="size-6" />
                  </button>

                  <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
                    <div
                      className="max-w-[92vw]"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <img
                        src={fullscreenAsset.url}
                        alt={fullscreenAsset.name}
                        className="max-h-[88vh] max-w-[88vw] rounded-2xl object-contain shadow-[0_28px_80px_rgba(0,0,0,0.42)]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function isPromptEmpty(content: PromptSegment[]) {
  return content.every((segment) =>
    segment.type === "text" ? segment.text.trim().length === 0 : false,
  );
}
