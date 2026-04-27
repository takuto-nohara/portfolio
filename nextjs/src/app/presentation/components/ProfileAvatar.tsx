import Image from "next/image";

interface ProfileAvatarProps {
  readonly sizeClass: string;
  readonly priority?: boolean;
}

export function ProfileAvatar({ sizeClass, priority = false }: ProfileAvatarProps) {
  return (
    <div
      className={`relative shrink-0 aspect-square overflow-hidden rounded-full border border-border-subtle bg-surface-card shadow-[0_0_0_12px_rgba(14,165,233,0.08)] ${sizeClass}`}
    >
      <Image
        src="/images/profile/takuto-nohara-portrait.png"
        alt="Takuto Nohara portrait"
        fill
        priority={priority}
        sizes="(min-width: 640px) 320px, 192px"
        className="object-cover"
      />
    </div>
  );
}