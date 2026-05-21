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

  test("parses tab-specific experience links", () => {
    const parsed = linkTextParser(
      "See %%experience:work%%, %%experience:education%%, and %%experience:hackathons%%."
    );

    expect(parsed.links).toEqual([
      {
        type: "internal",
        text: "Work experience",
        where: "experiences",
        experienceTab: "work",
        experienceToken: "work",
      },
      {
        type: "internal",
        text: "Education",
        where: "experiences",
        experienceTab: "education",
        experienceToken: "education",
      },
      {
        type: "internal",
        text: "Hackathons",
        where: "experiences",
        experienceTab: "achievements",
        experienceToken: "hackathons",
      },
    ]);
    expect(linkToText(parsed.links)).toBe(
      " %%experience:work%% %%experience:education%% %%experience:hackathons%%"
    );
  });

  test("parses certification section and specific certification links", () => {
    const parsed = linkTextParser(
      "See %%certifications%% and %%certification:azure-ai-engineer%%."
    );

    expect(parsed.links).toEqual([
      {
        type: "internal",
        text: "Certifications",
        where: "certifications",
      },
      {
        type: "internal",
        text: "Open certification",
        where: "certifications",
        certificationSlug: "azure-ai-engineer",
        certificationToken: "azure-ai-engineer",
      },
    ]);
    expect(linkToText(parsed.links)).toBe(
      " %%certifications%% %%certification:azure-ai-engineer%%"
    );
  });
});
