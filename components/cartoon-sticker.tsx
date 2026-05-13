import {
  BookOpenCheck,
  CheckCircle2,
  Headphones,
  Pencil,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

type StickerVariant = "focus" | "listening" | "grammar" | "success";

const stickerCopy = {
  focus: {
    title: "Ready",
    label: "today",
    icon: Sparkles,
    className: "from-emerald-200 via-sky-100 to-amber-100",
  },
  listening: {
    title: "Listen",
    label: "A/B/C/D",
    icon: Headphones,
    className: "from-sky-200 via-cyan-100 to-emerald-100",
  },
  grammar: {
    title: "Grammar",
    label: "pattern",
    icon: BookOpenCheck,
    className: "from-amber-200 via-orange-100 to-rose-100",
  },
  success: {
    title: "Done",
    label: "review",
    icon: CheckCircle2,
    className: "from-emerald-200 via-lime-100 to-amber-100",
  },
};

export function CartoonSticker({
  variant = "focus",
  className,
}: {
  variant?: StickerVariant;
  className?: string;
}) {
  const sticker = stickerCopy[variant];
  const Icon = sticker.icon;

  return (
    <div
      className={cn(
        "cartoon-sticker relative mx-auto aspect-square w-full max-w-64 overflow-hidden rounded-lg border bg-gradient-to-br p-4 shadow-sm",
        sticker.className,
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/55" />
      <div className="absolute -bottom-8 -left-8 size-28 rounded-full bg-white/45" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-950 shadow-sm">
            {sticker.label}
          </span>
          <Sparkles className="size-5 text-amber-600" />
        </div>
        <div className="mx-auto flex size-28 rotate-[-4deg] flex-col items-center justify-center rounded-[2rem] border-4 border-white/80 bg-white shadow-md">
          <Icon className="size-9 text-emerald-700" />
          <div className="mt-3 flex gap-4">
            <span className="size-2 rounded-full bg-foreground" />
            <span className="size-2 rounded-full bg-foreground" />
          </div>
          <div className="mt-2 h-1.5 w-8 rounded-full bg-rose-300" />
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-black tracking-normal text-emerald-950">
            {sticker.title}
          </p>
          <div className="rounded-full bg-white/75 p-2 shadow-sm">
            <Pencil className="size-5 text-amber-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
