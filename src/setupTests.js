// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: { body: '[]' } })),
  post: jest.fn(() => Promise.resolve({ data: { ai_message: 'Hello!' } })),
};

jest.mock('axios', () => ({
  __esModule: true,
  default: mockAxios,
  ...mockAxios,
}));

jest.mock('react-markdown', () => ({ children }) => <>{children}</>);
jest.mock('remark-gfm', () => jest.fn());

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollTo = jest.fn();

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;
