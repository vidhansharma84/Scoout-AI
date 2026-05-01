"use client";

import { ReactNode } from "react";

export default function Marquee({
  children,
  duration = 40,
  reverse = false,
  className = "",
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center gap-12 pr-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12 pr-12" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
