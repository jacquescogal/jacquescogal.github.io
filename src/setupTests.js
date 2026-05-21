// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

const mockAxios = {
  get: vi.fn(() => Promise.resolve({ data: { body: '[]' } })),
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
