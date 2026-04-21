"use client";

import { useEffect, useRef } from "react";
import Terminal, { type TerminalProps } from "../terminal";

// Frame data is static pre-rendered HTML containing trusted HTML entities
// (e.g. &gt;) and <span class="b|e|h|g|o"> syntax-highlight tags.
// Strip any tag that is NOT an allowlisted span open/close — never re-escape
// entities that are already encoded in the source data.
function sanitizeTerminalLine(line: string): string {
  return line.replace(/<(?!\/?span\b)[^>]*>/g, "");
}

// A simple animation frame loop manager that's tied to requestAnimationFrame
// and should always keep frames in lock step with timing updates
class AnimationManager {
  _animation: number | null = null;
  callback: () => void;
  lastFrame = -1;
  frameTime = 1000 / 30; // 30fps

  constructor(callback: () => void, fps = 30) {
    this.callback = callback;
    this.frameTime = 1000 / fps;
  }

  updateFPS(fps: number) {
    this.frameTime = 1000 / fps;
  }

  start() {
    if (this._animation != null) return;
    this._animation = requestAnimationFrame(this.update);
  }

  pause() {
    if (this._animation == null) return;
    this.lastFrame = -1;
    cancelAnimationFrame(this._animation);
    this._animation = null;
  }

  update = (time: number) => {
    const { lastFrame } = this;
    let delta = time - lastFrame;
    if (this.lastFrame === -1) {
      this.lastFrame = time;
    } else {
      while (delta >= this.frameTime) {
        this.callback();
        delta -= this.frameTime;
        this.lastFrame += this.frameTime;
      }
    }
    this._animation = requestAnimationFrame(this.update);
  };
}

const KONAMI_CODE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

export type AnimationFrame = string[];

export type AnimatedTerminalProps = Omit<TerminalProps, "lines"> & {
  frames: AnimationFrame[];
  frameLengthMs: number;
};

export default function AnimatedTerminal({
  className,
  columns,
  rows,
  fontSize,
  title,
  frames,
  whitespacePadding,
  frameLengthMs,
}: AnimatedTerminalProps) {
  const baseFps = 1000 / frameLengthMs;

  const contentRef = useRef<HTMLElement>(null);
  const frameIndexRef = useRef(0);
  const framesRef = useRef(frames);
  useEffect(() => { framesRef.current = frames; }, [frames]);
  const padding = " ".repeat(whitespacePadding ?? 0);

  const managerRef = useRef<AnimationManager | null>(null);
  if (managerRef.current === null) {
    managerRef.current = new AnimationManager(() => {
      frameIndexRef.current = (frameIndexRef.current + 1) % framesRef.current.length;
      if (contentRef.current) {
        contentRef.current.innerHTML = framesRef.current[frameIndexRef.current]
          .map((line) => `<div>${padding}${sanitizeTerminalLine(line)}${padding}</div>`)
          .join(""); // no newlines — must match React's dangerouslySetInnerHTML output
      }
    }, baseFps);
  }
  const animationManager = managerRef.current;

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return; // LIFE-03: reduced motion at mount — don't start

    const handleVisibilityChange = () => {
      // LIFE-02: correct API for tab visibility
      if (document.visibilityState === "hidden") {
        animationManager.pause();
      } else {
        animationManager.start();
      }
    };
    const handleMotionChange = (e: MediaQueryListEvent) => {
      // LIFE-03: reactive — fires when OS preference changes after mount
      if (e.matches) {
        animationManager.pause();
      } else if (document.visibilityState === "visible") {
        animationManager.start();
      }
    };
    const codeInProgress: string[] = [];
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (KONAMI_CODE[codeInProgress.length] === key) {
        codeInProgress.push(key);
      } else {
        codeInProgress.length = 0;
      }
      if (codeInProgress.length !== KONAMI_CODE.length) {
        return;
      }
      if (animationManager.frameTime === 1000 / baseFps) {
        animationManager.updateFPS(240);
      } else {
        animationManager.updateFPS(baseFps);
      }
      codeInProgress.length = 0;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    mql.addEventListener("change", handleMotionChange);
    window.addEventListener("keyup", handleKeyUp);

    if (document.visibilityState === "visible") {
      animationManager.start();
    }

    return () => {
      animationManager.pause(); // LIFE-01: cancel rAF on unmount — prevents leak
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mql.removeEventListener("change", handleMotionChange);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [animationManager, frames.length, baseFps]);

  return (
    <Terminal
      ref={contentRef}
      className={className}
      columns={columns}
      whitespacePadding={whitespacePadding}
      rows={rows}
      title={title}
      fontSize={fontSize}
      lines={frames[frameIndexRef.current]}
      disableScrolling={true}
    />
  );
}
