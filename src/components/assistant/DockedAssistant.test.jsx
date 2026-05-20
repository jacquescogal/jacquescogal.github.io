import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import chatbotStateReducer from "../../store/chatbotStateSlice";
import AssistantDock from "../portfolio/AssistantDock";

function renderWithStore(ui) {
  const store = configureStore({
    reducer: { chatbotState: chatbotStateReducer },
  });

  render(<Provider store={store}>{ui}</Provider>);
  return store;
}

test("renders assistant prompts and chat for desktop visitors", () => {
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  expect(screen.getByRole("complementary", { name: /Jacques AI workspace/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Role fit/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Project proof/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Experience summary/i })).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /Message Jacques AI/i })).toBeInTheDocument();
});

test("offers a mobile assistant entry point", () => {
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  expect(screen.getByRole("button", { name: /Ask Jacques AI/i })).toBeInTheDocument();
});
