import { describe, expect, test } from "vitest";
import { linkTextParser, linkToText } from "./Links";

describe("chat link helpers", () => {
  test("serializes parsed internal links back to backend tokens", () => {
    const parsed = linkTextParser("See %%contact%% and %%project%%.");

    expect(linkToText(parsed.links)).toBe(" %%contact%% %%project%%");
  });

  test("parses project README links with heading slugs", () => {
    const parsed = linkTextParser("See this %%project:https://github.com/jacquescogal/portfolio#setup%%.");

    expect(parsed.message).toBe("See this .");
    expect(parsed.links).toEqual([
      {
        type: "project",
        text: "Open project README",
        repoUrl: "https://github.com/jacquescogal/portfolio",
        headingSlug: "setup",
      },
    ]);
    expect(linkToText(parsed.links)).toBe(" %%project:https://github.com/jacquescogal/portfolio#setup%%");
  });
});
