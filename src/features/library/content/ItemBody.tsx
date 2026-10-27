// An item's body on screen: its Markdoc tree, resolved against the household's
// answers, with each tag drawn by its component. The tags are declared, and
// checked, in src/content/markdoc.ts.

import Markdoc, { type Config, type Node } from "@markdoc/markdoc";
import { Body } from "@sixthshift/design-system/body";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { markdocConfig } from "../../../content/markdoc";
import { Ask } from "./Ask";
import { useContentContext } from "./context";
import { Window } from "./Window";

const renderConfig: Config = {
  ...markdocConfig,
  nodes: {
    paragraph: { ...Markdoc.nodes.paragraph, render: "Paragraph" },
    link: { ...Markdoc.nodes.link, render: "Link" },
  },
};

const components = {
  Ask,
  Window,
  Paragraph: ({ children }: { children: React.ReactNode }) => (
    <Body as="p" className="mt-2">
      {children}
    </Body>
  ),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-fg-brand underline">
      {children}
    </a>
  ),
};

export function ItemBody({ doc, className }: { doc: Node; className?: string }) {
  const { profile } = useContentContext();
  const tree = React.useMemo(() => Markdoc.transform(doc, { ...renderConfig, variables: profile }), [doc, profile]);
  return (
    <div className={cn("flex flex-col [&_li]:text-sm [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5", className)}>
      {Markdoc.renderers.react(tree, React, { components })}
    </div>
  );
}
