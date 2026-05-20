import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import chatbotStateReducer from "../../store/chatbotStateSlice";
import DockedAssistant from "./DockedAssistant";

function renderWithStore(ui) {
  const store = configureStore({
    reducer: { chatbotState: chatbotStateReducer },
  });

  render(<Provider store={store}>{ui}</Provider>);
  return store;
}

test("renders assistant prompts for desktop visitors", () => {
  renderWithStore(<DockedAssistant onNavigate={() => {}} />);

  expect(screen.getByRole("complementary", { name: /Jacques AI/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Role fit/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Project proof/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Experience summary/i })).toBeInTheDocument();
});

test("opens chat when an assistant prompt is clicked", async () => {
  const store = renderWithStore(<DockedAssistant onNavigate={() => {}} />);

  await userEvent.click(screen.getByRole("button", { name: /Role fit/i }));

  expect(store.getState().chatbotState.showChat).toBe(true);
});

test("offers a mobile assistant entry point", () => {
  renderWithStore(<DockedAssistant onNavigate={() => {}} />);

  expect(screen.getByRole("button", { name: /Ask Jacques AI/i })).toBeInTheDocument();
});
