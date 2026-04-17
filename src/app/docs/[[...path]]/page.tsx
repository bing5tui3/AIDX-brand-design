import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Breadcrumb } from "@/components/breadcrumbs";
import type { NavTreeNode } from "@/components/nav-tree";
import { DOCS_DIRECTORY, DOCS_PAGES_ROOT_PATH } from "@/lib/docs/config";
import {
  type DocsPageData,
  loadAllDocsPageSlugs,
  loadDocsPage,
} from "@/lib/docs/page";
import {
  docsMetadataTitle,
  loadDocsNavTreeData,
  navTreeToBreadcrumbs,
} from "@/lib/docs/navigation";
import DocsPageContent from "../DocsPageContent";

interface DocsRouteProps {
  params: Promise<{ path?: string[] }>;
}

export const dynamicParams = false;

function normalizePathSegments(path: string[] | undefined): string[] {
  return path ?? [];
}

function toActivePageSlug(path: string[]): string {
  return path.length === 0 ? "index" : path.join("/");
}

function isErrorWithCode(err: unknown): err is Error & { code: unknown } {
  return err instanceof Error && typeof err === "object" && "code" in err;
}

async function loadDocsRouteData(path: string[]): Promise<{
  navTreeData: NavTreeNode[];
  docsPageData: DocsPageData;
  breadcrumbs: Breadcrumb[];
}> {
  const activePageSlug = toActivePageSlug(path);
  const [navTreeData, docsPageData] = await Promise.all([
    loadDocsNavTreeData(DOCS_DIRECTORY, activePageSlug),
    loadDocsPage(DOCS_DIRECTORY, activePageSlug).catch((err: unknown) => {
      if (isErrorWithCode(err) && err.code === "ENOENT") {
        notFound();
      }
      throw err;
    }),
  ]);

  const breadcrumbs = navTreeToBreadcrumbs(
    "AIDX Docs",
    DOCS_PAGES_ROOT_PATH,
    navTreeData,
    activePageSlug,
  );

  return { navTreeData, docsPageData, breadcrumbs };
}

export async function generateStaticParams(): Promise<
  Array<{ path: string[] }>
> {
  const docsPageSlugs = await loadAllDocsPageSlugs(DOCS_DIRECTORY);
  const docsPagePaths = docsPageSlugs
    .filter((slug) => slug !== "index")
    .map((slug) => ({ path: slug.split("/") }));

  return [{ path: [] }, ...docsPagePaths];
}

export async function generateMetadata({
  params,
}: DocsRouteProps): Promise<Metadata> {
  const { path } = await params;
  const { docsPageData, breadcrumbs } = await loadDocsRouteData(
    normalizePathSegments(path),
  );

  return {
    title: docsMetadataTitle(breadcrumbs),
    description: docsPageData.description,
  };
}

export default async function DocsPage({ params }: DocsRouteProps) {
  const { path } = await params;
  const { navTreeData, docsPageData, breadcrumbs } = await loadDocsRouteData(
    normalizePathSegments(path),
  );

  return (
    <DocsPageContent
      navTreeData={navTreeData}
      docsPageData={docsPageData}
      breadcrumbs={breadcrumbs}
    />
  );
}
