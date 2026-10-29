// An item's body on screen: its Markdoc tree, resolved against the household's
// answers, with each tag drawn by its component, and every phone number in it
// one you can tap. The tags are declared, and checked, in src/content/markdoc.ts.

import Markdoc, { type Config, type Node, Tag } from "@markdoc/markdoc";
import { Body } from "@sixthshift/design-system/body";
import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";
import { markdocConfig } from "../../../../content/markdoc";
import { telHref } from "../../../../lib/emergency";
import { splitPhones } from "../../../../lib/phones";
import { variables } from "../../../settings/model/facts";
import { Ask } from "./Ask";
import { useContentContext } from "./context";
import { Window } from "./Window";

const renderConfig: Config = {
  ...markdocConfig,
  nodes: {
    paragraph: { ...Markdoc.nodes.paragraph, render: "Paragraph" },
    link: { ...Markdoc.nodes.link, render: "Link" },
    text: {
      ...Markdoc.nodes.text,
      transform(node, config) {
        const content = node.attributes.content;
        if (typeof content !== "string") return Markdoc.nodes.text.transform!(node, config);
        return splitPhones(content).map((part) => (typeof part === "string" ? part : new Tag("Phone", { number: part.phone }, [part.phone])));
      },
    },
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
  Phone: ({ number, children }: { number: string; children: React.ReactNode }) => (
    <a href={telHref(number)} className="font-medium whitespace-nowrap text-fg-brand underline">
      {children}
    </a>
  ),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-fg-brand underline">
      {children}
    </a>
  ),
};

export function ItemBody({ doc, className }: { doc: Node; className?: string }) {
  const { facts } = useContentContext();
  const tree = React.useMemo(() => Markdoc.transform(doc, { ...renderConfig, variables: variables(facts) }), [doc, facts]);
  return (
    <div
      className={cn(
        "flex flex-col [&_h2]:mt-5 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-fg-strong [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-fg-strong [&_li]:text-sm [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5",
        className
      )}
    >
      {Markdoc.renderers.react(tree, React, { components })}
    </div>
  );
}
