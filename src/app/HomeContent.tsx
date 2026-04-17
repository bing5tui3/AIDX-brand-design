"use client";

import AnimatedTerminal from "@/components/animated-terminal";
import GridContainer from "@/components/grid-container";
import { ButtonLink } from "@/components/link";
import { P } from "@/components/text";
import type { TerminalFontSize } from "@/components/terminal";
import type { TerminalsMap } from "./terminal-data";
import { useEffect, useState } from "react";
import s from "./home-content.module.css";

interface HomeClientProps {
  terminalData: TerminalsMap;
}

function useWindowSize() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    function updateSize() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return [width, height];
}

export default function HomeContent({ terminalData }: HomeClientProps) {
  const animationFrames = Object.keys(terminalData)
    .filter((k) => k.startsWith("home/animation_frames"))
    .map((k) => terminalData[k]);

  const [windowWidth, windowHeight] = useWindowSize();
  const widthSize =
    windowWidth > 1100 ? "small" : windowWidth > 674 ? "tiny" : "xtiny";
  const heightSize =
    windowHeight > 900 ? "small" : windowHeight > 750 ? "tiny" : "xtiny";
  let fontSize: TerminalFontSize = "small";
  const sizePriority = ["xtiny", "tiny", "small"];
  for (const size of sizePriority) {
    if (widthSize === size || heightSize === size) {
      fontSize = size;
      break;
    }
  }

  return (
    <main className={s.homePage}>
      {windowWidth > 0 && (
        <>
          <section className={s.terminalWrapper} aria-hidden={true}>
            <AnimatedTerminal
              title={"> AIDX"}
              fontSize={fontSize}
              whitespacePadding={
                windowWidth > 950 ? 20 : windowWidth > 850 ? 10 : 0
              }
              className={s.animatedTerminal}
              columns={100}
              rows={41}
              frames={animationFrames}
              frameLengthMs={31}
            />
          </section>
          <GridContainer>
            <P weight="regular" className={s.tagline}>
              AI-powered Developer Experience Platform. Accelerate your
              development workflow with intelligent tools.
            </P>
          </GridContainer>
          <GridContainer className={s.buttonsList}>
            <ButtonLink href="#" text="Get Started" size="large" />
            <ButtonLink
              href="/docs"
              text="Documentation"
              size="large"
              theme="neutral"
            />
          </GridContainer>
        </>
      )}
    </main>
  );
}
