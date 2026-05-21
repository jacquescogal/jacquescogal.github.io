import { afterEach, describe, expect, test, vi } from "vitest";
import { parseSseChunk, streamChatMessage } from "./chatApi";

describe("chat streaming API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("parses a complete SSE stage event", () => {
    const result = parseSseChunk("", 'event: stage\ndata: {"stage":"message_received","label":"Message received"}\n\n');

    expect(result).toEqual({
      events: [
        {
          event: "stage",
          data: { stage: "message_received", label: "Message received" },
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

    const second = parseSseChunk(
      first.buffer,
      '\ndata: {"stage":"message_received","label":"Message received"}\r\n\r\n',
    );

    expect(second).toEqual({
      events: [
        {
          event: "stage",
          data: { stage: "message_received", label: "Message received" },
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
        controller.enqueue(encoder.encode('event: stage\ndata: {"stage":"message_received","label":"Message received"}\n\n'));
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
    expect(handlers.onStage).toHaveBeenCalledWith({ stage: "message_received", label: "Message received" });
    expect(handlers.onDelta).toHaveBeenCalledWith("Hi");
    expect(handlers.onComplete).toHaveBeenCalledWith({ message: "done" });
    expect(handlers.onError).not.toHaveBeenCalled();
  });
});
