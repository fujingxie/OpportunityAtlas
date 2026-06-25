import Image from "next/image";

type LogoMarkProps = {
  className?: string;
  priority?: boolean;
};

export function LogoMark({ className, priority = false }: LogoMarkProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={`select-none object-contain ${className ?? ""}`}
      draggable={false}
      height={1024}
      priority={priority}
      src="/logo-mark.png"
      width={1024}
    />
  );
}
