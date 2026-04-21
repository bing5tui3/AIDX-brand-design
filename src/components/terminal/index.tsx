"use client";

import classNames from "classnames";
import {
  forwardRef,
  useImperativeHandle,
  type UIEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type React from "react";
import { Code, P } from "../text";
import s from "./Terminal.module.css";

import { X, Menu, LayoutGrid, SquarePlus } from "lucide-react";

/**
 * Sanitize a terminal line string to allow only safe span tags used for
 * syntax highlighting (.b, .e, .h, .g, .o classes). All other HTML is escaped.
 */
function sanitizeTerminalLine(line: string): string {
  const escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/&lt;span class="([beghoBEGHO]+)"&gt;/g, '<span class="$1">')
    .replace(/&lt;\/span&gt;/g, "</span>");
}

export type TerminalFontSize = "xtiny" | "tiny" | "small" | "medium" | "large";
export interface TerminalProps {
  className?: string;
  columns: number;
  rows: number;
  fontSize?: TerminalFontSize;
  title?: string;
  lines?: string[];
  whitespacePadding?: number;
  disableScrolling?: boolean;
}

export default forwardRef<HTMLElement, TerminalProps>(function Terminal(
  {
    columns,
    rows,
    fontSize = "medium",
    className,
    title,
    lines,
    whitespacePadding = 0,
    disableScrolling = false,
  }: TerminalProps,
  ref: React.Ref<HTMLElement>,
) {
  const [platformStyle, setPlatformStyle] = useState("macos");
  useEffect(() => {
    const userAgent = window?.navigator.userAgent;
    const isLinux = /Linux/i.test(userAgent);
    setPlatformStyle(isLinux ? "adwaita" : "macos");
  }, []);

  const [autoScroll, setAutoScroll] = useState(true);
  const handleScroll = (e: UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLElement;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable === 0) return; // nothing to scroll — avoid division by zero
    const position = Math.ceil((scrollTop / scrollable) * 100);
    if (position < 100) {
      setAutoScroll(false);
    }
    if (position === 100) {
      setAutoScroll(true);
    }
  };

  const codeRef = useRef<HTMLElement>(null);
  // biome-ignore lint/style/noNonNullAssertion: codeRef is always mounted before this ref is consumed
  useImperativeHandle(ref, () => codeRef.current!, []);
  useEffect(() => {
    if (autoScroll) {
      codeRef.current?.scrollTo({
        top: codeRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, [lines?.length, autoScroll]);

  const padding = " ".repeat(whitespacePadding);
  return (
    <div
      className={classNames(
        s.terminal,
        className,
        {
          [s.fontXTiny]: fontSize === "xtiny",
          [s.fontTiny]: fontSize === "tiny",
          [s.fontSmall]: fontSize === "small",
          [s.fontMedium]: fontSize === "medium",
          [s.fontLarge]: fontSize === "large",
        },
        {
          [s.adwaita]: platformStyle === "adwaita",
          [s.macos]: platformStyle === "macos",
        },
      )}
      style={
        {
          "--columns": columns + 2 * whitespacePadding,
          "--rows": rows,
        } as React.CSSProperties
      }
    >
      <div className={s.header}>
        {platformStyle === "adwaita" && <AdwaitaButtons />}
        {platformStyle === "macos" && <MacosButtons />}
        <P className={s.title}>{title}</P>
      </div>
      <Code
        ref={codeRef}
        aria-live="off"
        className={classNames(s.content, {
          [s.disableScrolling]: disableScrolling,
        })}
        onScroll={handleScroll}
      >
        {lines?.map((line, i) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: stable key intentional — lines update via direct DOM patching
              key={i}
              dangerouslySetInnerHTML={{
                __html: `${padding}${sanitizeTerminalLine(line)}${padding}`,
              }}
            />
          );
        })}
      </Code>
    </div>
  );
}); // closes forwardRef(function Terminal(...) { ... })

function AdwaitaButtons() {
  // NOTE:
  // It is entirely intentional that the maximize/minimize buttons are missing.
  // Blame GNOME.

  return (
    <>
      <ul className={classNames(s.windowControls, s.start)}>
        <li>
          <SquarePlus className={s.icon} />
        </li>
      </ul>
      <ul className={classNames(s.windowControls, s.end)}>
        <li>
          <LayoutGrid className={s.icon} />
        </li>
        <li>
          <Menu className={s.icon} />
        </li>
        <li className={s.circularButton}>
          <X className={s.icon} />
        </li>
      </ul>
    </>
  );
}
function MacosButtons() {
  return (
    <ul className={classNames(s.windowControls, s.start)}>
      <li className={s.circularButton} />
      <li className={s.circularButton} />
      <li className={s.circularButton} />
    </ul>
  );
}
