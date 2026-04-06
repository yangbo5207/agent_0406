import { Badge } from "@workspace/ui/badge";
import { Button } from "@workspace/ui/button";
import { Card, CardContent } from "@workspace/ui/card";
import { Input } from "@workspace/ui/input";
import {
  AtSign,
  Bell,
  Clock3,
  FolderOpen,
  Home as HomeIcon,
  ImageIcon,
  LayoutGrid,
  LifeBuoy,
  Mic,
  MessageCircleMore,
  Search,
  Send,
  Sparkles,
  Stars,
  Video,
  WandSparkles,
} from "lucide-react";

const sidebarItems = [
  { label: "灵感", icon: HomeIcon, active: true },
  { label: "生成", icon: Sparkles, active: false },
  { label: "资产", icon: FolderOpen, active: false },
  { label: "画布", icon: LayoutGrid, active: false },
];

const capabilityCards = [
  { title: "无限画布", subtitle: "灵感无界，自由创作", icon: WandSparkles, tint: "from-sky-200 to-cyan-100" },
  { title: "Agent 模式", subtitle: "S2.0 视频创作", icon: Stars, tint: "from-cyan-200 to-sky-100" },
  { title: "图片生成", subtitle: "智能美学提升", icon: ImageIcon, tint: "from-teal-200 to-cyan-100" },
  { title: "视频生成", subtitle: "Seedance 2.0", icon: Video, tint: "from-blue-300 to-sky-100" },
  { title: "数字人", subtitle: "大师模式", icon: Mic, tint: "from-rose-200 to-orange-100" },
];

const galleryCards = [
  {
    title: "哈啤 AI 武林大会",
    meta: "已有 1053 人参与",
    className:
      "xl:col-span-2 xl:row-span-1 min-h-[268px] bg-[radial-gradient(circle_at_35%_15%,rgba(255,255,255,0.35),transparent_22%),linear-gradient(135deg,#93c5fd_0%,#2563eb_32%,#f59e0b_100%)]",
  },
  {
    title: "异瞳灵猫",
    meta: "电影感角色设定",
    className:
      "xl:col-span-1 xl:row-span-2 min-h-[542px] bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.18),transparent_18%),linear-gradient(160deg,#1f2937_0%,#52525b_36%,#84cc16_100%)]",
  },
  {
    title: "风雪压境",
    meta: "高动态海报",
    className:
      "xl:col-span-1 xl:row-span-2 min-h-[542px] bg-[radial-gradient(circle_at_62%_16%,rgba(255,255,255,0.14),transparent_18%),linear-gradient(165deg,#0f172a_0%,#334155_42%,#93c5fd_100%)]",
  },
  {
    title: "水墨悟空",
    meta: "东方笔触",
    className:
      "xl:col-span-1 xl:row-span-2 min-h-[542px] bg-[radial-gradient(circle_at_56%_15%,rgba(255,255,255,0.28),transparent_18%),linear-gradient(165deg,#fafaf9_0%,#e7e5e4_38%,#57534e_100%)] text-zinc-900",
  },
  {
    title: "暗夜面甲",
    meta: "角色封面",
    className:
      "xl:col-span-1 xl:row-span-1 min-h-[268px] bg-[radial-gradient(circle_at_48%_15%,rgba(239,68,68,0.12),transparent_18%),linear-gradient(165deg,#020617_0%,#082f49_50%,#164e63_100%)]",
  },
  {
    title: "群像设定",
    meta: "IP 人设组合",
    className:
      "xl:col-span-1 xl:row-span-1 min-h-[268px] bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.28),transparent_16%),linear-gradient(160deg,#fafaf9_0%,#e7e5e4_56%,#78716c_100%)] text-zinc-900",
  },
  {
    title: "古城远景",
    meta: "世界观场景",
    className:
      "xl:col-span-1 xl:row-span-1 min-h-[268px] bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.14),transparent_18%),linear-gradient(165deg,#111827_0%,#1f2937_50%,#475569_100%)]",
  },
];

export default function Home() {
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
            <div className="flex flex-col items-center gap-4 text-zinc-400">
              <div className="size-8 rounded-full border border-zinc-200 bg-white" />
              <div className="flex flex-col items-center gap-3">
                {[Bell, Clock3, MessageCircleMore, LifeBuoy].map((Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    className="flex size-7 items-center justify-center text-zinc-400 transition hover:text-zinc-600"
                  >
                    <Icon className="size-[16px]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mx-auto max-w-[1730px] px-5 pb-10 pt-7 lg:px-7">
            <section className="mx-auto max-w-[1188px]">
              <div className="pb-12 pt-14 text-center">
                <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-zinc-950 md:text-[34px]">
                  开启你的 <span className="text-sky-500">Agent 模式</span>，即刻造梦
                </h1>
              </div>

              <Card className="rounded-[28px] border-[#ececef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.01),0_10px_28px_rgba(15,23,42,0.02)]">
                <CardContent className="p-[18px]">
                  <div className="mb-9 flex items-start gap-5">
                    <div className="mt-[6px] flex h-[78px] w-[56px] shrink-0 rotate-[-9deg] items-center justify-center rounded-[6px] border border-[#ececef] bg-[linear-gradient(180deg,#f6f6f7_0%,#efeff1_100%)] text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
                      <span className="text-[31px] font-light leading-none">+</span>
                    </div>
                    <div className="pt-1 text-[15px] leading-8 text-zinc-400">
                      Seedance 2.0 全能参考，上传参考、输入文字或
                      <span className="mx-2 inline-flex size-8 items-center justify-center rounded-[10px] border border-[#e8e8ea] bg-white text-sky-500">
                        @
                      </span>
                      主体，创意无限可能
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" className="rounded-[8px] text-sky-600">
                      <WandSparkles className="size-4" />
                      Agent 模式
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-[8px]">
                      Seedance 视频创作
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-[8px] text-zinc-700">
                      自动
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-[8px]">
                      <Search className="size-4" />
                      灵感搜索
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-[8px]">
                      创意设计
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

              <div className="mt-11 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                {capabilityCards.map(({ title, subtitle, icon: Icon, tint }) => (
                  <Card
                    key={title}
                    className="rounded-[22px] border-[#ececef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.01),0_7px_18px_rgba(15,23,42,0.018)]"
                  >
                    <CardContent className="flex items-center gap-3 p-[14px]">
                      <div
                        className={`flex size-[54px] shrink-0 items-center justify-center rounded-[14px] border border-white/70 bg-gradient-to-br ${tint}`}
                      >
                        <Icon className="size-[24px] text-zinc-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold tracking-[-0.03em] text-zinc-950">
                          {title}
                        </div>
                        <div className="mt-0.5 truncate text-[12px] text-zinc-400">{subtitle}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mx-auto mt-20 max-w-[1680px]">
              <div className="mb-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge className="rounded-[12px] bg-white px-5 py-[11px] text-[14px] text-zinc-950">发现</Badge>
                  <Button size="sm" variant="outline" className="rounded-[14px] border-0 bg-transparent text-zinc-500 shadow-none hover:bg-white">
                    短片
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-[14px] border-0 bg-transparent text-zinc-500 shadow-none hover:bg-white">
                    活动
                  </Button>
                </div>
                <div className="w-full max-w-[336px]">
                  <Input readOnly value="海报制作" className="h-[38px] rounded-[10px] text-[14px] text-zinc-500" />
                </div>
              </div>

              <div className="hidden gap-[3px] xl:grid xl:grid-cols-5 xl:auto-rows-[268px]">
                {galleryCards.map((card) => (
                  <div
                    key={card.title}
                    className={`relative overflow-hidden rounded-[18px] border border-[#ececef] shadow-[0_1px_2px_rgba(15,23,42,0.012),0_6px_18px_rgba(15,23,42,0.022)] ${card.className}`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.26))]" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div
                        className={`text-[18px] font-semibold tracking-[-0.04em] ${
                          card.className.includes("text-zinc-900") ? "text-zinc-900" : "text-white"
                        }`}
                      >
                        {card.title}
                      </div>
                      <div
                        className={`mt-1 text-[13px] ${
                          card.className.includes("text-zinc-900") ? "text-zinc-600" : "text-white/78"
                        }`}
                      >
                        {card.meta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="columns-1 gap-3 space-y-3 sm:columns-2 lg:columns-3 xl:hidden">
                {galleryCards.map((card) => (
                  <div
                    key={card.title}
                    className={`relative mb-3 break-inside-avoid overflow-hidden rounded-[18px] border border-[#ececef] shadow-[0_1px_2px_rgba(15,23,42,0.012),0_6px_18px_rgba(15,23,42,0.022)] ${card.className}`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.26))]" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div
                        className={`text-[18px] font-semibold tracking-[-0.04em] ${
                          card.className.includes("text-zinc-900") ? "text-zinc-900" : "text-white"
                        }`}
                      >
                        {card.title}
                      </div>
                      <div
                        className={`mt-1 text-[13px] ${
                          card.className.includes("text-zinc-900") ? "text-zinc-600" : "text-white/78"
                        }`}
                      >
                        {card.meta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
