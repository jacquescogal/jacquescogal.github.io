// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

const mockAxios = {
  get: vi.fn((url = "") => {
    if (String(url).includes("/id")) {
      return Promise.resolve({ data: { conversation_id: "test-conversation" } });
    }

    if (String(url).includes("certifications")) {
      return Promise.resolve({
        data: [
          {
            title: "Azure AI Engineer Associate",
            issuer: "Microsoft",
            description: "Azure AI engineering.",
            issued_on: "Feb 2026",
            expires_on: "Feb 2027",
            credential_id: "364C",
            credential_url: "https://example.com/ai",
            icon_name: "FaMicrosoft",
            display_order: 1,
            status: "active",
          },
          {
            title: "Azure Fundamentals",
            issuer: "Microsoft",
            description: "Azure fundamentals.",
            issued_on: "Jan 2025",
            expires_on: "",
            credential_id: "4609",
            credential_url: "https://example.com/fundamentals",
            icon_name: "FaMicrosoft",
            display_order: 2,
            status: "active",
          },
        ],
      });
    }

    return Promise.resolve({
      data: [
        {
          title: "AI Portfolio Assistant",
          url_link: "https://github.com/jacquescogal/portfolio",
          description: "Streaming portfolio assistant.",
          tags: ["React", "SSE"],
          readme_content: "## AI Portfolio Assistant\n\nUses streaming responses from pinned README content.",
          readme_sha: "abc123",
          readme_updated_at: "2026-05-21T00:00:00Z",
        },
      ],
    });
  }),
  post: vi.fn(() => Promise.resolve({ data: { ai_message: 'Hello!' } })),
};

vi.mock('axios', () => ({
  __esModule: true,
  default: mockAxios,
  ...mockAxios,
}));

const renderMarkdownInline = (value, components = {}) => {
  const text = String(value ?? "");
  const Strong = components.strong || "strong";
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return React.createElement(Strong, { key: index }, part.slice(2, -2));
    }

    return part;
  });
};

vi.mock('react-markdown', () => ({
  default: ({ children, className, components }) => React.createElement(
    "div",
    { className },
    renderMarkdownInline(children, components)
  ),
}));
vi.mock('remark-gfm', () => ({ default: vi.fn() }));

window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollTo = vi.fn();

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;
