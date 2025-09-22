"use client";
import { TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  muted?: boolean;
};

const GlassTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, muted, readOnly, ...rest }, ref) => (
    <textarea
      spellCheck={false}
      autoCorrect="off"
      ref={ref}
      readOnly={readOnly}
      className={clsx(
        "w-full rounded-lg p-3 font-mono text-sm block",
        "bg-black/70 text-white placeholder-white/60",
        "border border-white/20 outline-none focus:ring-2 focus:ring-white/30",
        muted || readOnly ? "italic" : "",
        className
      )}
      {...rest}
    />
  )
);
GlassTextarea.displayName = "GlassTextarea";
export default GlassTextarea;
