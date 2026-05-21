import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { getCertifications } from "./certificationApi";

describe("certificationApi", () => {
  test("normalizes certification payloads", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: [
        {
          title: "Azure AI Engineer Associate",
          issuer: "Microsoft",
          description: "Azure AI engineering",
          issued_on: "Feb 2026",
          expires_on: "Feb 2027",
          credential_id: "364C",
          credential_url: "https://example.com/ai",
          icon_name: "FaMicrosoft",
          display_order: 1,
          status: "active",
        },
      ],
    });

    const certifications = await getCertifications();

    expect(certifications).toEqual([
      {
        title: "Azure AI Engineer Associate",
        issuer: "Microsoft",
        description: "Azure AI engineering",
        issuedOn: "Feb 2026",
        expiresOn: "Feb 2027",
        credentialId: "364C",
        credentialUrl: "https://example.com/ai",
        iconName: "FaMicrosoft",
        displayOrder: 1,
        status: "active",
      },
    ]);
  });
});
