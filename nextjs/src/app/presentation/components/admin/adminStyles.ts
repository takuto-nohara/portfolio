// 管理画面で繰り返し使う見た目（ポートフォリオのトークン + Water Design System の業務 UI パターン）

const focusRing = "outline-none transition-[border-color,box-shadow] focus:border-link focus:shadow-[0_0_0_3px_rgba(3,105,161,0.15)]";

export const adminInput = `h-11 w-full rounded border border-line-strong bg-white px-3 text-sm text-ink ${focusRing}`;

export const adminMonoInput = `${adminInput} font-mono text-[13px]`;

export const adminTextarea = `w-full resize-y rounded border border-line-strong bg-white px-3.5 py-3 text-sm leading-[1.8] text-ink ${focusRing}`;

export const adminLabel = "text-[13px] font-bold text-ink";

export const adminHint = "text-xs leading-relaxed text-ink-muted";

export const adminPrimaryButton =
  "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded border-0 bg-ink px-[18px] text-sm font-bold text-white transition-colors hover:bg-link hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

export const adminSecondaryButton =
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded border border-line-strong bg-white px-3.5 text-[13px] font-bold text-link transition-colors hover:border-sky";

export const adminIconButton =
  "grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded border-0 bg-transparent text-ink-body transition-colors hover:bg-sky-soft hover:text-link";

export const adminDangerIconButton =
  "grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded border-0 bg-transparent text-red-700 transition-colors hover:bg-red-50";

export function adminPill(active: boolean): string {
  return `inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[13px] font-bold transition-colors ${
    active ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink-body hover:border-sky hover:text-link"
  }`;
}

/** 一覧の 1 行（行クリックでドロワーを開く） */
export function adminRow(selected: boolean): string {
  return `-mx-3 cursor-pointer rounded px-3 transition-[background-color,transform] duration-300 ease-out-expo hover:translate-x-1 hover:bg-sky-soft/45 ${
    selected ? "bg-sky-soft/60" : ""
  }`;
}
