import HomeContent from "./HomeContent";
import { loadAllTerminalFiles } from "./terminal-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIDX",
  description: "AI-powered Developer Experience Platform",
};

export default async function HomePage() {
  const terminalData = await loadAllTerminalFiles("/home");
  return <HomeContent terminalData={terminalData} />;
}
