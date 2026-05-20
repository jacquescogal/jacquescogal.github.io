import { describe, expect, test } from "vitest";
import { linkTextParser, linkToText } from "./Links";

describe("chat link helpers", () => {
  test("serializes parsed internal links back to backend tokens", () => {
    const parsed = linkTextParser("See %%contact%% and %%project%%.");

    expect(linkToText(parsed.links)).toBe(" %%contact%% %%project%%");
  });
});
