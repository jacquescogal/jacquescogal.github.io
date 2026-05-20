import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  expect(screen.getByRole("button", { name: /Role fit/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Project proof/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Experience summary/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /Message Jacques AI/i })).toBeInTheDocument();
});

test("seeds the dock chat when an assistant prompt is clicked", async () => {
  const store = renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.click(screen.getByRole("button", { name: /Role fit/i }));

  expect(store.getState().chatbotState.showChat).toBe(true);
  await waitFor(() => {
    expect(screen.getByRole("textbox", { name: /Message Jacques AI/i }).value).toMatch(
      /fits this role/i
    );
  });
});

test("offers a mobile assistant entry point", () => {
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  expect(screen.getByRole("button", { name: /Ask Jacques AI/i })).toBeInTheDocument();
});
