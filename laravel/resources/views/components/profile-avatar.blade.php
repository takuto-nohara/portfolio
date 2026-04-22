@props([
    'sizeClass' => 'w-48 h-48',
])

<div class="{{ $sizeClass }} shrink-0 rounded-2xl border border-border-subtle bg-linear-to-br from-surface-card via-surface-secondary to-surface-primary p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
    <div class="flex h-full w-full flex-col items-center justify-center rounded-xl border border-border-subtle/70 bg-surface-card/80 text-center">
        <span class="text-3xl font-semibold tracking-[0.28em] text-accent-primary sm:text-5xl">TN</span>
        <span class="mt-3 text-[10px] uppercase tracking-[0.45em] text-foreground-muted">profile</span>
    </div>
</div>