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

vi.mock('react-markdown', () => ({
  default: ({ children }) => React.createElement(React.Fragment, null, children),
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
