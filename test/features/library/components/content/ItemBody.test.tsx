import Markdoc from "@markdoc/markdoc";
import { renderToString } from "react-dom/server";
import { expect, test } from "vitest";
import { ItemBody } from "../../../../../src/features/library/components/content/ItemBody";

test("a number in a body is one you can tap", () => {
  const html = renderToString(<ItemBody doc={Markdoc.parse("Call **PANDA on 1300 726 306** or 000.")} />);
  expect(html).toContain('href="tel:1300726306"');
  expect(html).toContain('href="tel:000"');
  expect(html).toContain("<strong>PANDA on <a");
});
