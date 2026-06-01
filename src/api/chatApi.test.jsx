import { afterEach, describe, expect, test, vi } from "vitest";
import axios from "axios";
import { getChatSuggestions, parseSseChunk, streamChatMessage } from "./chatApi";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../utils/Links", () => ({
  linkToText: vi.fn(() => ""),
}));

describe("chat streaming API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    axios.get.mockReset();
    axios.post.mockReset();
    sessionStorage.clear();
  });

  test("parses a complete SSE stage event", () => {
    const result = parseSseChunk("", 'event: stage\ndata: {"id":"message_received","label":"Message received"}\n\n');

    expect(result).toEqual({
      events: [
        {
          event: "stage",
          data: { id: "message_received", label: "Message received" },
        },
      ],
      buffer: "",
    });
  });

  test("buffers incomplete SSE chunks and parses them when completed", () => {
    const first = parseSseChunk("", 'event: delta\ndata: {"text":"Hel');

    expect(first).toEqual({
      events: [],
      buffer: 'event: delta\ndata: {"text":"Hel',
    });

    const second = parseSseChunk(first.buffer, 'lo"}\n\n');

    expect(second).toEqual({
      events: [
        {
          event: "delta",
          data: { text: "Hello" },
        },
      ],
      buffer: "",
    });
  });

  test("parses CRLF-framed SSE events", () => {
    const result = parseSseChunk("", 'event: stage\r\ndata: {"stage":"thinking","label":"Thinking"}\r\n\r\n');

    expect(result).toEqual({
      events: [
        {
          event: "stage",
          data: { stage: "thinking", label: "Thinking" },
        },
      ],
      buffer: "",
    });
  });

  test("preserves split CRLF line endings across chunks", () => {
    const first = parseSseChunk("", "event: stage\r");

    expect(first).toEqual({
      events: [],
      buffer: "event: stage\r",
    });

    const second = parseSseChunk(first.buffer, '\ndata: {"id":"message_received","label":"Message received"}\r\n\r\n');

    expect(second).toEqual({
      events: [
        {
          event: "stage",
          data: { id: "message_received", label: "Message received" },
        },
      ],
      buffer: "",
    });
  });

  test("streams chat messages and dispatches stage, delta, and complete events", async () => {
    sessionStorage.setItem("conversation_id", "conversation-1");
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: stage\ndata: {"id":"message_received","label":"Message received"}\n\n'));
        controller.enqueue(encoder.encode('event: delta\ndata: {"text":"Hi"}\n\n'));
        controller.enqueue(encoder.encode('event: complete\ndata: {"message":"done"}\n\n'));
        controller.close();
      },
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body,
    });
    vi.stubGlobal("fetch", fetchMock);

    const handlers = {
      onStage: vi.fn(),
      onDelta: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    await streamChatMessage([], "Hello", handlers);

    expect(fetchMock).toHaveBeenCalledWith(`${import.meta.env.VITE_CHAT_URL}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        chat_history: [],
        user_message: "Hello",
        conversation_id: "conversation-1",
      }),
    });
    expect(handlers.onStage).toHaveBeenCalledWith({ id: "message_received", label: "Message received" });
    expect(handlers.onDelta).toHaveBeenCalledWith("Hi");
    expect(handlers.onComplete).toHaveBeenCalledWith({ message: "done" });
    expect(handlers.onError).not.toHaveBeenCalled();
  });

  test("streams chat error events to onError", async () => {
    sessionStorage.setItem("conversation_id", "conversation-1");
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: error\ndata: {"message":"Unable to complete response."}\n\n'));
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      body,
    }));

    const handlers = {
      onStage: vi.fn(),
      onDelta: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    await streamChatMessage([], "Hello", handlers);

    expect(handlers.onError).toHaveBeenCalledWith({ message: "Unable to complete response." });
  });

  test("does not dispatch onError twice when an error event handler throws", async () => {
    sessionStorage.setItem("conversation_id", "conversation-1");
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: error\ndata: {"message":"Unable to complete response."}\n\n'));
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      body,
    }));

    const handlerError = new Error("Handler failed");
    const handlers = {
      onStage: vi.fn(),
      onDelta: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(() => {
        throw handlerError;
      }),
    };

    await expect(streamChatMessage([], "Hello", handlers)).rejects.toThrow("Handler failed");

    expect(handlers.onError).toHaveBeenCalledTimes(1);
    expect(handlers.onError).toHaveBeenCalledWith({ message: "Unable to complete response." });
  });

  test("rejects when a stream ends before a terminal event", async () => {
    sessionStorage.setItem("conversation_id", "conversation-1");
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: stage\ndata: {"id":"message_received","label":"Message received"}\n\n'));
        controller.enqueue(encoder.encode('event: delta\ndata: {"text":"Partial"}\n\n'));
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      body,
    }));

    const handlers = {
      onStage: vi.fn(),
      onDelta: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    await expect(streamChatMessage([], "Hello", handlers)).rejects.toThrow("Chat stream ended before completion");

    expect(handlers.onStage).toHaveBeenCalledWith({ id: "message_received", label: "Message received" });
    expect(handlers.onDelta).toHaveBeenCalledWith("Partial");
    expect(handlers.onComplete).not.toHaveBeenCalled();
    expect(handlers.onError).toHaveBeenCalledTimes(1);
    expect(handlers.onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(handlers.onError.mock.calls[0][0].message).toBe("Chat stream ended before completion");
  });

  test("getChatSuggestions sends the last ten non-system messages", async () => {
    axios.post.mockResolvedValueOnce({ data: { suggestions: ["What experience does Jacques have?"] } });
    const chatHistory = Array.from({ length: 12 }, (_, index) => ({
      entity: index % 2 === 0 ? "USER" : "AI",
      message: `Message ${index}`,
      links: [],
    }));
    chatHistory.splice(3, 0, { entity: "SYSTEM", message: "error", links: [] });
    chatHistory.splice(4, 0, { entity: "THINK", message: "thinking", links: [] });

    await getChatSuggestions(chatHistory);

    const payload = axios.post.mock.calls[0][1];
    expect(payload.chat_history).toHaveLength(10);
    expect(payload.chat_history[0].message).toBe("Message 2");
    expect(payload.chat_history[9].message).toBe("Message 11");
    expect(payload.chat_history.some((message) => message.entity === "SYSTEM")).toBe(false);
    expect(payload.chat_history.some((message) => message.entity === "THINK")).toBe(false);
  });
});
