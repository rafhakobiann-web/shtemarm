import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

type Props = {
  src?: string;
  title?: string;
  size?: "sm" | "lg";
};

/** Book catalog cover only; never shown alongside individual exam questions. */
export function BookCover({ src, title = "", size = "sm" }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);

  const dimensions = size === "lg" ? "h-32 w-24" : "h-24 w-[4.5rem]";
  const classes = `${dimensions} shrink-0 rounded-xl border border-border/75 shadow-sm`;
  const valid = Boolean(src?.startsWith("/covers/") || src?.startsWith("/math/books/covers/"));

  if (!valid || failed) return (
    <span aria-hidden="true" className={`${classes} grid place-items-center bg-primary/10 text-primary`}>
      <BookOpen className={size === "lg" ? "size-8" : "size-6"} />
    </span>
  );

  return (
    <img
      src={src}
      alt={title ? `${title} · շտեմարանի կազմ` : ""}
      width={size === "lg" ? 96 : 72}
      height={size === "lg" ? 128 : 96}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`${classes} bg-muted object-cover`}
    />
  );
}
