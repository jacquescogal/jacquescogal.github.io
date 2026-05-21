import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import chatbotStateReducer from "../../store/chatbotStateSlice";
import AssistantDock from "../portfolio/AssistantDock";
import { sendChatMessage, streamChatMessage } from "../../api/chatApi";

vi.mock("../../api/chatApi", () => ({
  getChatSuggestions: vi.fn(),
  sendChatMessage: vi.fn(),
  streamChatMessage: vi.fn(),
}));

beforeEach(() => {
  sendChatMessage.mockReset();
  streamChatMessage.mockReset();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderWithStore(ui) {
  const store = configureStore({
    reducer: { chatbotState: chatbotStateReducer },
  });

  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

test("renders assistant prompts and chat for desktop visitors", () => {
  const { container } = renderWithStore(<AssistantDock onNavigate={() => {}} />);

  expect(screen.getByRole("complementary", { name: /Jacques AI workspace/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Role fit/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Project proof/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Experience summary/i })).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /Message Jacques AI/i })).toBeInTheDocument();
  expect(container.querySelector('img[src="/ai_mascot_only.png"]')).not.toBeInTheDocument();
  expect(container.querySelector("[data-assistant-header-icon]")).not.toBeInTheDocument();
});

test("offers a mobile assistant entry point", () => {
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  expect(screen.getByRole("button", { name: /Ask Jacques AI/i })).toBeInTheDocument();
});

test("hides the mobile assistant trigger while the dock is open", async () => {
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.click(screen.getByRole("button", { name: /Ask Jacques AI/i }));

  expect(screen.queryByRole("button", { name: /Ask Jacques AI/i })).not.toBeInTheDocument();
  expect(screen.getByRole("complementary", { name: /Jacques AI workspace/i })).toBeInTheDocument();
});

test("renders completed streaming assistant response", async () => {
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "message_received", label: "Message received" });
    handlers.onStage({ id: "fetching_related_sources", label: "Fetching related sources" });
    await Promise.resolve();
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
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

test("breaks long unspaced assistant text inside message bubbles", async () => {
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
    handlers.onDelta("https://github.com/jacquescogal/techfest24_100");
    handlers.onComplete({ done: true });
  });

  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Show repo");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });

  expect(await screen.findByText("https://github.com/jacquescogal/techfest24_100")).toHaveClass(
    "break-words",
    "[overflow-wrap:anywhere]"
  );
});

test("keeps streaming nodes visible briefly after crafting starts", async () => {
  vi.useFakeTimers();
  let streamHandlers;
  streamChatMessage.mockImplementation((_history, _message, handlers) => {
    streamHandlers = handlers;
    handlers.onStage({ id: "message_received", label: "Message received" });
    handlers.onStage({ id: "fetching_related_sources", label: "Fetching related sources" });
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
    streamHandlers.onStage({ id: "crafting_response", label: "Crafting response" });
    streamHandlers.onDelta("Starting answer");
  });

  expect(screen.getByText("Crafting response")).toBeInTheDocument();
  expect(screen.getByText("Fetching related sources")).toBeInTheDocument();
  expect(screen.getByText("Starting answer")).toBeInTheDocument();
  expect(document.querySelectorAll("[data-stream-stage-dot]")).toHaveLength(3);
  document.querySelectorAll("[data-stream-stage-dot]").forEach((dot) => {
    expect(dot).toHaveClass("h-2.5", "w-2.5");
    expect(dot).not.toHaveClass("size-2");
  });

  await act(async () => {
    vi.advanceTimersByTime(900);
  });

  expect(screen.getByText("Crafting response")).toBeInTheDocument();
  expect(screen.queryByText("Fetching related sources")).not.toBeInTheDocument();
  expect(document.querySelector("[data-stream-collapsed-stage]")).toHaveClass("rounded-full");
  expect(document.querySelector("[data-stream-stage-dot]")).toHaveClass("h-2", "w-2");
});

test("does not silently fall back when the stream endpoint fails before opening", async () => {
  streamChatMessage.mockRejectedValue(new Error("Chat stream request failed: 404 Not Found"));
  sendChatMessage.mockResolvedValue({ ai_message: "Fallback answer" });

  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Tell me about UBS");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });

  expect(await screen.findByText(/error: Error: Chat stream request failed: 404 Not Found/i)).toBeInTheDocument();
  expect(screen.queryByText("Fallback answer")).not.toBeInTheDocument();
  expect(sendChatMessage).not.toHaveBeenCalled();
});

test("shows the first node while waiting for the first stream event", async () => {
  streamChatMessage.mockImplementation(() => new Promise(() => {}));

  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Tell me about UBS");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });

  expect(await screen.findByText("Message received")).toBeInTheDocument();
  expect(screen.queryByText("Fetching related sources")).not.toBeInTheDocument();
});

test("shows a system error and clears pending UI when an opened stream fails", async () => {
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "message_received", label: "Message received" });
    handlers.onDelta("Partial answer");
    handlers.onError(new Error("Chat stream ended before completion"));
  });

  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Tell me about UBS");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });

  expect(await screen.findByText(/error: Error: Chat stream ended before completion/i)).toBeInTheDocument();
  expect(screen.queryByText("Partial answer")).not.toBeInTheDocument();
  expect(screen.queryByText("Message received")).not.toBeInTheDocument();

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Again");
  expect(screen.getByRole("button", { name: /Send message/i })).toBeEnabled();
});

test("ignores repeated sends while a stream is already active", async () => {
  streamChatMessage.mockImplementation(() => new Promise(() => {}));

  const { store } = renderWithStore(<AssistantDock onNavigate={() => {}} />);
  const textbox = screen.getByRole("textbox", { name: /Message Jacques AI/i });

  await userEvent.type(textbox, "Tell me about UBS");
  await act(async () => {
    const form = textbox.closest("form");
    fireEvent.submit(form);
    fireEvent.submit(form);
  });

  expect(streamChatMessage).toHaveBeenCalledTimes(1);
  expect(
    store
      .getState()
      .chatbotState.chatHistory.filter((chatMessage) => chatMessage.entity === "USER")
  ).toHaveLength(1);
});
