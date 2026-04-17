import createMDX from "@next/mdx";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const gfmAlertsAsCalloutsPlugin = require.resolve(
  "./src/lib/docs/remark-gfm-alerts-as-callouts.mjs",
);
const headingIdsPlugin = require.resolve(
  "./src/lib/docs/remark-heading-ids.mjs",
);
const syntaxHighlightingPlugin = require.resolve(
  "./src/lib/docs/rehype-highlight-all.mjs",
);

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      "remark-frontmatter",
      "remark-gfm",
      gfmAlertsAsCalloutsPlugin,
      headingIdsPlugin,
    ],
    rehypePlugins: [syntaxHighlightingPlugin],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
  experimental: {
    largePageDataBytes: 2 * 1024 * 1024,
  },
  env: {
    GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || "",
  },
  async headers() {
    const headers = [];
    if (process.env.VERCEL_ENV !== "production") {
      headers.push({
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
        source: "/:path*",
      });
    }
    return headers;
  },
};

export default withMDX(nextConfig);
