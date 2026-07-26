import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import chatbotStateReducer, { setAssistantPrompt } from "../../store/chatbotStateSlice";
import AssistantDock from "./AssistantDock";
import { getChatSuggestions, sendChatMessage, streamChatMessage } from "../../api/chatApi";

vi.mock("../../api/chatApi", () => ({
  getChatSuggestions: vi.fn(),
  sendChatMessage: vi.fn(),
  streamChatMessage: vi.fn(),
}));

beforeEach(() => {
  getChatSuggestions.mockReset();
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
  expect(screen.getByRole("complementary", { name: /Jacques AI workspace/i })).toHaveClass("lg:block");
  expect(screen.queryByRole("button", { name: /Role fit/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Project proof/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Experience summary/i })).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /Message Jacques AI/i })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /Message Jacques AI/i })).toHaveClass("h-14", "min-h-14");
  expect(screen.getByRole("button", { name: /Send message/i })).toHaveClass("h-14", "w-14");
  expect(container.querySelector("[data-assistant-header-icon]")).not.toBeInTheDocument();
});

test("limits typed chat messages to 500 characters and shows the count", async () => {
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  const textbox = screen.getByRole("textbox", { name: /Message Jacques AI/i });
  // The composer opens holding the first-contact question, so clear it before
  // measuring what typing alone is allowed to add.
  await userEvent.clear(textbox);
  await userEvent.type(textbox, "a".repeat(501));

  expect(textbox).toHaveAttribute("maxLength", "500");
  expect(textbox).toHaveValue("a".repeat(500));
  expect(screen.getByText("500/500")).toBeInTheDocument();
});

test("offers a mobile assistant entry point", () => {
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  expect(screen.getByRole("button", { name: /Ask Jacques AI/i })).toHaveClass("lg:hidden");
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

test("assistant send and swim AI response unlock first-contact and outside-the-code", async () => {
  const onAchievement = vi.fn();
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
    handlers.onDelta("Jacques likes to swim between builds.");
    handlers.onComplete({ done: true });
  });

  renderWithStore(<AssistantDock onNavigate={() => {}} onAchievement={onAchievement} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Say hello");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });

  expect(await screen.findByText("Jacques likes to swim between builds.")).toBeInTheDocument();
  expect(onAchievement).toHaveBeenCalledWith("first-contact");
  expect(onAchievement).toHaveBeenCalledWith("outside-the-code");
  expect(onAchievement.mock.calls.map(([achievement]) => achievement)).toEqual([
    "first-contact",
    "outside-the-code",
  ]);
});

test("renders markdown styling inside chat bubbles", async () => {
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
    handlers.onDelta("Jacques writes **impactful code**.");
    handlers.onComplete({ done: true });
  });

  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "What does Jacques do?");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });

  const boldText = await screen.findByText("impactful code");
  expect(boldText.tagName).toBe("STRONG");
  expect(boldText).toHaveClass("font-semibold");
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

  expect(
    (await screen.findByText("https://github.com/jacquescogal/techfest24_100")).closest(".break-words")
  ).toHaveClass("break-words", "[overflow-wrap:anywhere]");
});

test("opens with the first-contact question already sendable and never asks the suggestions API", async () => {
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
    handlers.onDelta("Built with Vite and a FastAPI retrieval backend.");
    handlers.onComplete({ done: true });
  });

  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  const textbox = screen.getByRole("textbox", { name: /Message Jacques AI/i });
  // Real text, not a placeholder: Send has to work on the first press.
  expect(textbox).toHaveValue("Who are you? And how was this built?");
  expect(textbox).toHaveAttribute("placeholder", "Ask about experience or projects…");
  expect(screen.queryByRole("button", { name: /Suggestions/i })).not.toBeInTheDocument();

  const send = screen.getByRole("button", { name: /Send message/i });
  expect(send).toBeEnabled();
  await act(async () => {
    await userEvent.click(send);
  });

  expect(streamChatMessage).toHaveBeenCalledWith(
    expect.any(Array),
    "Who are you? And how was this built?",
    expect.any(Object)
  );
  expect(await screen.findByText("Built with Vite and a FastAPI retrieval backend.")).toBeInTheDocument();
  await waitFor(() => expect(textbox).toHaveValue(""));
  expect(getChatSuggestions).not.toHaveBeenCalled();
});

test("clear resets the transcript to the assistant greeting and is disabled when there is nothing to clear", async () => {
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
    handlers.onDelta("Jacques built AI products at UBS.");
    handlers.onComplete({ done: true });
  });

  const { store } = renderWithStore(<AssistantDock onNavigate={() => {}} />);

  expect(screen.getByRole("button", { name: /Clear/i })).toBeDisabled();

  const composer = screen.getByRole("textbox", { name: /Message Jacques AI/i });
  await userEvent.clear(composer);
  await userEvent.type(composer, "What did Jacques build at UBS?");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });

  expect(await screen.findByText("Jacques built AI products at UBS.")).toBeInTheDocument();

  const clear = screen.getByRole("button", { name: /Clear/i });
  expect(clear).toBeEnabled();
  await act(async () => {
    await userEvent.click(clear);
  });

  expect(screen.queryByText("Jacques built AI products at UBS.")).not.toBeInTheDocument();
  expect(screen.queryByText("What did Jacques build at UBS?")).not.toBeInTheDocument();
  expect(store.getState().chatbotState.chatHistory).toEqual([
    { entity: "AI", message: "Hello!", links: [] },
  ]);
  expect(screen.getByText("Hello!")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Clear/i })).toBeDisabled();
  // A full reset: the composer is back to the question the dock arrived with.
  expect(composer).toHaveValue("Who are you? And how was this built?");
});

test("clamps an over-long assistant prompt before it reaches the composer", async () => {
  const { store } = renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await act(async () => {
    store.dispatch(setAssistantPrompt("a".repeat(520)));
  });

  expect(screen.getByRole("textbox", { name: /Message Jacques AI/i })).toHaveValue("a".repeat(500));
});

test("clicking project section link unlocks follow-thread and deep-link and opens project link", async () => {
  const onAchievement = vi.fn();
  const onOpenProject = vi.fn();
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
    handlers.onDelta("Review the project notes %%project:https://github.com/jacquescogal/demo#architecture%%");
    handlers.onComplete({ done: true });
  });

  renderWithStore(
    <AssistantDock
      onNavigate={() => {}}
      onOpenProject={onOpenProject}
      onAchievement={onAchievement}
    />
  );

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Show project");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });
  await userEvent.click(await screen.findByRole("button", { name: "Open project README" }));

  const expectedLink = {
    type: "project",
    text: "Open project README",
    repoUrl: "https://github.com/jacquescogal/demo",
    headingSlug: "architecture",
  };
  expect(onOpenProject).toHaveBeenCalledWith(expectedLink);
  expect(onAchievement).toHaveBeenCalledWith("follow-thread");
  expect(onAchievement).toHaveBeenCalledWith("deep-link");
});

test("clicking internal assistant link unlocks follow-thread and navigates", async () => {
  const onAchievement = vi.fn();
  const onNavigate = vi.fn();
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
    handlers.onDelta("Reach out here %%contact%%");
    handlers.onComplete({ done: true });
  });

  renderWithStore(<AssistantDock onNavigate={onNavigate} onAchievement={onAchievement} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "How do I contact Jacques?");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });
  await userEvent.click(await screen.findByRole("button", { name: "Contact me" }));

  expect(onNavigate).toHaveBeenCalledWith({
    type: "internal",
    text: "Contact me",
    where: "contact",
  });
  expect(onAchievement).toHaveBeenCalledWith("follow-thread");
});

test("clicking external GitHub assistant link unlocks follow-thread and source-curious", async () => {
  const onAchievement = vi.fn();
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ id: "crafting_response", label: "Crafting response" });
    handlers.onDelta("See GitHub %%github%%");
    handlers.onComplete({ done: true });
  });

  renderWithStore(<AssistantDock onNavigate={() => {}} onAchievement={onAchievement} />);

  await userEvent.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Show GitHub");
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: /Send message/i }));
  });
  await userEvent.click(await screen.findByRole("link", { name: /GitHub/i }));

  expect(onAchievement).toHaveBeenCalledWith("follow-thread");
  expect(onAchievement).toHaveBeenCalledWith("source-curious");
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
    expect(dot).toHaveClass("h-2", "w-2");
    expect(dot).not.toHaveClass("size-2");
  });

  await act(async () => {
    vi.advanceTimersByTime(900);
  });

  expect(screen.getByText("Crafting response")).toBeInTheDocument();
  expect(screen.queryByText("Fetching related sources")).not.toBeInTheDocument();
  expect(document.querySelector("[data-stream-collapsed-stage]")).toHaveClass("crt", "rounded-unit");
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
