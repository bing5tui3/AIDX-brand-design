import type { Metadata } from "next";
import { H2, P } from "@/components/text";
import s from "./404Page.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Page not found | AIDX",
  description: "We couldn't find what you were looking for.",
};

export default function NotFoundPage() {
  return (
    <main className={s.notFoundPage}>
      <header className={s.header}>
        <H2>This page could not be found.</H2>
        <P>
          Try browsing the <a href="/docs">documentation</a>.
        </P>
      </header>
    </main>
  );
}
