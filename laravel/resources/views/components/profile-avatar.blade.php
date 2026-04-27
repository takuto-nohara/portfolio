@props([
    'sizeClass' => 'w-48 h-48',
])

<div class="{{ $sizeClass }} shrink-0 rounded-4xl border border-border-subtle bg-linear-to-br from-surface-card via-surface-secondary to-surface-primary p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
    <div class="relative h-full w-full overflow-hidden rounded-3xl border border-border-subtle/70 bg-surface-card/80">
        <img
            src="{{ asset('images/profile/takuto-nohara-portrait.png') }}"
            alt="Takuto Nohara portrait"
            class="h-full w-full object-cover object-center"
        >
        <div class="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-surface-primary/85 via-surface-primary/20 to-transparent px-4 py-4">
            <span class="text-[10px] uppercase tracking-[0.45em] text-surface-primary">profile</span>
        </div>
    </div>
</div>
