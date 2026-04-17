import Footer from "@/components/footer";
import PathnameFilter from "@/components/pathname-filter";
import type { SimpleLink } from "@/components/link";
import Navbar from "@/components/navbar";
import { jetbrainsMono, pretendardStdVariable } from "@/components/text";
import { DOCS_DIRECTORY } from "@/lib/docs/config";
import { loadDocsNavTreeData } from "@/lib/docs/navigation";
import "@/styles/globals.css";
import classNames from "classnames";
import type { Metadata } from "next";
import s from "./layout.module.css";

const navLinks: Array<SimpleLink> = [
  {
    text: "Docs",
    href: "/docs",
  },
  {
    text: "GitHub",
    href: "https://github.com/your-org/aidx",
  },
];

const NO_CHROME_PATHS = ["/"];

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: "AIDX",
  description: "AI-powered Developer Experience Platform",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  other: {
    "darkreader-lock": "",
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docsNavTree = await loadDocsNavTreeData(DOCS_DIRECTORY, "");
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en">
      <body
        className={classNames(
          s.rootLayout,
          pretendardStdVariable.variable,
          jetbrainsMono.variable,
        )}
      >
        <PathnameFilter paths={NO_CHROME_PATHS} mode="exclude">
          <Navbar
            links={navLinks}
            docsNavTree={docsNavTree}
            cta={{
              href: "#",
              text: "Get Started",
            }}
          />
        </PathnameFilter>
        {children}
        <PathnameFilter paths={NO_CHROME_PATHS} mode="exclude">
          <Footer links={navLinks} copyright={`© ${currentYear} AIDX`} />
        </PathnameFilter>
      </body>
    </html>
  );
}
