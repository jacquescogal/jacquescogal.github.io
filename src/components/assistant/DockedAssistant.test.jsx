import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, expect, test, vi } from "vitest";
import chatbotStateReducer from "../../store/chatbotStateSlice";
import AssistantDock from "../portfolio/AssistantDock";
import { streamChatMessage } from "../../api/chatApi";

vi.mock("../../api/chatApi", () => ({
  getChatSuggestions: vi.fn(),
  sendChatMessage: vi.fn(),
  streamChatMessage: vi.fn(),
}));

beforeEach(() => {
  streamChatMessage.mockReset();
});

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

test("renders completed streaming assistant response", async () => {
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage("message_received");
    handlers.onStage("fetching_related_sources");
    await Promise.resolve();
    handlers.onStage("crafting_response");
    handlers.onDelta("Jacques builds ");
    handlers.onDelta("AI products.");
    handlers.onComplete({ done: true });
  });

  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Tell me about UBS");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
    await Promise.resolve();
  });

  expect(await screen.findByText("Jacques builds AI products.")).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText("Fetching related sources")).not.toBeInTheDocument();
  });
});

test("shows active streaming stages while response is in flight", async () => {
  let streamHandlers;
  streamChatMessage.mockImplementation((_history, _message, handlers) => {
    streamHandlers = handlers;
    handlers.onStage("message_received");
    handlers.onStage("fetching_related_sources");
    return new Promise(() => {});
  });

  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Tell me about UBS");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });

  expect(await screen.findByText("Message received")).toBeInTheDocument();
  expect(screen.getByText("Fetching related sources")).toBeInTheDocument();

  await act(async () => {
    streamHandlers.onStage("crafting_response");
    streamHandlers.onDelta("Starting answer");
  });

  expect(screen.getByText("Crafting response")).toBeInTheDocument();
  expect(screen.queryByText("Fetching related sources")).not.toBeInTheDocument();
  expect(screen.getByText("Starting answer")).toBeInTheDocument();
});
