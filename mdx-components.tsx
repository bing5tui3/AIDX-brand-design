import type { MDXComponents } from "mdx/types";
import Blockquote from "@/components/blockquote";
import Callout, {
  Caution,
  Important,
  Note,
  Tip,
  Warning,
} from "@/components/callout";
import CodeBlock from "@/components/codeblock";
import JumplinkHeader from "@/components/jumplink-header";
import { BodyParagraph, LI } from "@/components/text";
import s from "@/lib/docs/docs-mdx.module.css";
import { type ComponentPropsWithoutRef } from "react";

const mdxComponents: MDXComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <JumplinkHeader {...props} as="h1" />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <JumplinkHeader {...props} as="h2" />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <JumplinkHeader {...props} as="h3" />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <JumplinkHeader {...props} as="h4" />
  ),
  h5: (props: ComponentPropsWithoutRef<"h5">) => (
    <JumplinkHeader {...props} as="h5" />
  ),
  h6: (props: ComponentPropsWithoutRef<"h6">) => (
    <JumplinkHeader {...props} as="h6" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <LI {...props} />,
  p: (props: ComponentPropsWithoutRef<"p">) => <BodyParagraph {...props} />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => <CodeBlock {...props} />,
  blockquote: Blockquote,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // biome-ignore lint/performance/noImgElement: Docs content deliberately uses plain img tags.
    <img className={s.image} src={props.src} alt={props.alt} />
  ),
  Callout,
  Note,
  Tip,
  Important,
  Warning,
  Caution,
  "callout-title": () => null,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
