"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/button";
import { Card, CardContent } from "@workspace/ui/card";
import {
  AtSign,
  FolderOpen,
  Home as HomeIcon,
  Send,
  Sparkles,
} from "lucide-react";

const sidebarItems = [
  { label: "灵感", icon: HomeIcon, active: true },
  { label: "生成", icon: Sparkles, active: false },
  { label: "资产", icon: FolderOpen, active: false },
];


export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Array<{ url: string; name: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleImageHover = useCallback((index: number | null) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (index !== null) {
      hoverTimer.current = setTimeout(() => setHoveredIndex(index), 50);
    } else {
      setHoveredIndex(null);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    toast.info(`onChange 触发，选中 ${selected?.length ?? 0} 个文件`);
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
    toast.info("开始上传...");
    try {
      for (const file of toUpload) {
        toast.info(`正在上传: ${file.name} (${file.size} bytes, ${file.type})`);
        const formData = new FormData();
        formData.append("file", file);

        let res: Response;
        try {
          res = await fetch("http://localhost:3002/upload", {
            method: "POST",
            body: formData,
          });
        } catch (fetchErr) {
          toast.error(`fetch 网络错误: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
          throw fetchErr;
        }

        toast.info(`上传响应: ${res.status}`);

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || "上传失败");
        }

        const data: { url: string; key: string } = await res.json();
        toast.success(`上传成功: ${data.url}`);
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
                  <div className="mb-9 flex items-start gap-5">
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
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`mt-[6px] flex h-[78px] w-[56px] shrink-0 rotate-[-9deg] cursor-pointer items-center justify-center rounded-[6px] border border-[#ececef] bg-[linear-gradient(180deg,#f6f6f7_0%,#efeff1_100%)] text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] transition-transform duration-150 hover:scale-[1.2] ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <span className="text-[31px] font-light leading-none">+</span>
                      </div>
                    ) : (
                      <div className="relative mt-[6px] shrink-0">
                        <div
                          className="relative h-[78px] transition-[width] duration-300"
                          style={{
                            width: hovered ? `${(files.length - 1) * 62 + 56}px` : "56px",
                          }}
                          onMouseEnter={() => setHovered(true)}
                          onMouseLeave={() => { setHovered(false); handleImageHover(null); }}
                        >
                          {files.map((f, i) => (
                            <div
                              key={f.url}
                              className="absolute top-0 left-0 h-[78px] w-[56px] transition-all duration-300"
                              style={{
                                transform: hovered
                                  ? `translateX(${i * 62}px) rotate(0deg)${hoveredIndex === i ? " scale(1.1)" : ""}`
                                  : `rotate(${(i - Math.floor(Math.min(files.length, 3) / 2)) * 10 - 12}deg)`,
                                zIndex: hoveredIndex === i ? 20 : i,
                                opacity: !hovered && i < files.length - 3 ? 0 : 1,
                              }}
                              onMouseEnter={() => hovered && handleImageHover(i)}
                              onMouseLeave={() => handleImageHover(null)}
                            >
                              {hovered && hoveredIndex === i && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-white shadow">
                                  {f.name}
                                </div>
                              )}
                              <img
                                src={f.url}
                                alt={f.name}
                                className="h-full w-full rounded-[6px] border border-[#ececef] object-cover shadow-sm"
                              />
                            </div>
                          ))}
                        </div>
                        {files.length < 9 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); !uploading && fileInputRef.current?.click(); }}
                            onMouseEnter={(e) => e.stopPropagation()}
                            className={`absolute z-30 flex size-7 items-center justify-center rounded-full border border-[#e8e8ea] bg-white text-zinc-500 shadow-sm transition-all duration-300 hover:bg-zinc-100 hover:shadow-md ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                            style={{
                              top: "58px",
                              left: hovered ? `${(files.length - 1) * 62 + 46}px` : "46px",
                            }}
                          >
                            <span className="text-sm leading-none">+</span>
                          </button>
                        )}
                      </div>
                    )}
                    <div className="pt-1 text-[15px] leading-8 text-zinc-400">
                      上传产品图、输入文字或
                      <span className="mx-2 inline-flex size-8 items-center justify-center rounded-[10px] border border-[#e8e8ea] bg-white text-sky-500">
                        @
                      </span>
                      主体，打造爆款视频吧！
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" className="rounded-[8px] text-zinc-700">
                      自动
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-[8px] px-3 text-zinc-700">
                      <AtSign className="size-4" />
                    </Button>
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
