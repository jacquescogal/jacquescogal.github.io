# Assistant Thinking Stages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real backend-driven SSE stages and streamed assistant response text to Jacques AI.

**Architecture:** FastAPI exposes a new `/chat/stream` endpoint that yields operational lifecycle events and OpenAI text deltas. The frontend adds a `fetch`-based SSE parser and renders a pending assistant bubble with an expanded node timeline that collapses once response generation starts. The existing blocking `/chat` path remains as fallback.

**Tech Stack:** FastAPI `StreamingResponse`, OpenAI Python Responses streaming (`response.output_text.delta`), React 18, Redux Toolkit, Vitest/jsdom, existing shadcn-style UI primitives.

---

## File Structure

- Modify `../backend/src/utils/query_bot.py`
  - Add reusable prompt construction helpers.
  - Add an async streaming event generator while preserving `query()`.
- Modify `../backend/src/routes/query_route.py`
  - Add `/chat/stream` route returning `StreamingResponse`.
- Add `../backend/tests/test_query_bot_streaming.py`
  - Unit-test stage order, delta extraction, and error events from `QueryBot`.
- Add `../backend/tests/test_query_route_stream.py`
  - Route-level test for SSE framing.
- Modify `src/api/chatApi.js`
  - Add `streamChatMessage()` and shared payload sanitization.
- Add `src/api/chatApi.test.jsx`
  - Unit-test SSE parser behavior and fallback conditions.
- Modify `src/components/portfolio/AssistantDock.jsx`
  - Render pending streaming message, node timeline, collapsed status, and final commit.
- Modify `src/components/assistant/DockedAssistant.test.jsx`
  - Cover stage UI, collapse behavior, streamed text, and committed final answer.

---

### Task 1: Backend QueryBot Streaming Events

**Files:**
- Modify: `../backend/src/utils/query_bot.py`
- Add: `../backend/tests/test_query_bot_streaming.py`

- [ ] **Step 1: Add failing tests for streaming event order and text deltas**

Create `../backend/tests/test_query_bot_streaming.py`:

```python
import sys
import types
import unittest
from unittest.mock import Mock, patch

from src.schemas.query_schemas import QuerySchema


def install_query_bot_import_stubs():
    openai = types.ModuleType("openai")

    class StubOpenAI:
        def __init__(self, *args, **kwargs):
            self.responses = types.SimpleNamespace(create=lambda **_: None)
            self.embeddings = types.SimpleNamespace(create=lambda **_: None)

    openai.OpenAI = StubOpenAI
    sys.modules.setdefault("openai", openai)


install_query_bot_import_stubs()
from src.utils.query_bot import QueryBot


class FakeOpenAIEvent:
    def __init__(self, event_type, delta=""):
        self.type = event_type
        self.delta = delta


class QueryBotStreamingTest(unittest.IsolatedAsyncioTestCase):
    async def test_stream_query_yields_stages_deltas_and_complete(self):
        query_bot = QueryBot.__new__(QueryBot)
        query_bot.openai_client = types.SimpleNamespace(
            responses=types.SimpleNamespace(
                create=Mock(
                    return_value=[
                        FakeOpenAIEvent("response.created"),
                        FakeOpenAIEvent("response.output_text.delta", "Hello "),
                        FakeOpenAIEvent("response.output_text.delta", "Jacques"),
                        FakeOpenAIEvent("response.output_text.done"),
                    ]
                )
            )
        )
        query_bot.model = "gpt-5.4-mini"
        query_bot.reasoning_effort = "low"
        query_bot.top_k = 8
        query_bot.collection = Mock()
        query_bot.collection.query.return_value = {
            "documents": [["UBS context"]],
            "metadatas": [[{"title": "ubs.txt", "filename": "work/ubs.txt"}]],
            "distances": [[0.12]],
        }
        schema = QuerySchema(
            user_message="Tell me about UBS",
            chat_history=[],
            conversation_id="conversation-1",
        )

        with patch("src.utils.query_bot.embed_with_openai", return_value=[[0.1, 0.2]]):
            events = [event async for event in query_bot.stream_query(schema)]

        self.assertEqual(
            events,
            [
                {"event": "stage", "data": {"stage": "message_received", "label": "Message received"}},
                {"event": "stage", "data": {"stage": "fetching_related_sources", "label": "Fetching related sources"}},
                {"event": "stage", "data": {"stage": "crafting_response", "label": "Crafting response"}},
                {"event": "delta", "data": {"text": "Hello "}},
                {"event": "delta", "data": {"text": "Jacques"}},
                {"event": "complete", "data": {"done": True}},
            ],
        )
        call_kwargs = query_bot.openai_client.responses.create.call_args.kwargs
        self.assertTrue(call_kwargs["stream"])
        self.assertEqual(call_kwargs["model"], "gpt-5.4-mini")
        self.assertIn("Knowledge Base:", call_kwargs["input"])

    async def test_stream_query_converts_exceptions_to_error_event(self):
        query_bot = QueryBot.__new__(QueryBot)
        query_bot.openai_client = types.SimpleNamespace(responses=types.SimpleNamespace(create=Mock()))
        query_bot.model = "gpt-5.4-mini"
        query_bot.reasoning_effort = "low"
        query_bot.top_k = 8
        schema = QuerySchema(
            user_message="Tell me about UBS",
            chat_history=[],
            conversation_id="conversation-1",
        )

        with patch.object(query_bot, "retrieve_context", side_effect=RuntimeError("boom")):
            events = [event async for event in query_bot.stream_query(schema)]

        self.assertEqual(events[0]["event"], "stage")
        self.assertEqual(events[1]["event"], "stage")
        self.assertEqual(events[-1], {"event": "error", "data": {"message": "Unable to complete response."}})


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the failing backend streaming tests**

Run from `../backend`:

```bash
python3 -m unittest tests/test_query_bot_streaming.py -v
```

Expected: FAIL because `QueryBot.stream_query` does not exist.

- [ ] **Step 3: Add streaming implementation to `QueryBot`**

Modify `../backend/src/utils/query_bot.py`:

```python
def build_answer_input(formatted_date: str, chat_history: str, docs: list[dict], question: str) -> str:
    return (
        f"Date: {formatted_date}\n\n"
        f"Chat History:\n{chat_history or 'None'}\n\n"
        f"Knowledge Base:\n{context_block(docs)}\n\n"
        f"Question: {question}"
    )


def current_portfolio_date() -> str:
    current_date = datetime.now()
    return f"{current_date.day} {current_date.strftime('%B')} {current_date.year}"
```

Update `query()` to use the helper:

```python
    async def query(self, query_schema: QuerySchema, _background_tasks=None):
        docs = self.retrieve_context(query_schema.user_message)
        chat_history = format_chat_history(query_schema.chat_history)

        response = self.openai_client.responses.create(
            **response_kwargs(self.model, self.reasoning_effort),
            instructions=ANSWER_INSTRUCTIONS,
            input=build_answer_input(
                current_portfolio_date(),
                chat_history,
                docs,
                query_schema.user_message,
            ),
            max_output_tokens=450,
        )
        return response.output_text
```

Add the streaming method inside `QueryBot`:

```python
    async def stream_query(self, query_schema: QuerySchema):
        yield {
            "event": "stage",
            "data": {"stage": "message_received", "label": "Message received"},
        }
        yield {
            "event": "stage",
            "data": {"stage": "fetching_related_sources", "label": "Fetching related sources"},
        }

        try:
            docs = self.retrieve_context(query_schema.user_message)
            chat_history = format_chat_history(query_schema.chat_history)
            yield {
                "event": "stage",
                "data": {"stage": "crafting_response", "label": "Crafting response"},
            }

            stream = self.openai_client.responses.create(
                **response_kwargs(self.model, self.reasoning_effort),
                instructions=ANSWER_INSTRUCTIONS,
                input=build_answer_input(
                    current_portfolio_date(),
                    chat_history,
                    docs,
                    query_schema.user_message,
                ),
                max_output_tokens=450,
                stream=True,
            )

            for event in stream:
                if getattr(event, "type", None) == "response.output_text.delta":
                    delta = getattr(event, "delta", "")
                    if delta:
                        yield {"event": "delta", "data": {"text": delta}}

            yield {"event": "complete", "data": {"done": True}}
        except Exception:
            yield {"event": "error", "data": {"message": "Unable to complete response."}}
```

- [ ] **Step 4: Run backend streaming tests**

Run from `../backend`:

```bash
python3 -m unittest tests/test_query_bot_streaming.py -v
```

Expected: PASS.

- [ ] **Step 5: Run existing QueryBot tests**

Run from `../backend`:

```bash
python3 -m unittest tests/test_query_bot_direct_context.py -v
```

Expected: PASS.

- [ ] **Step 6: Commit backend streaming core**

Run from `../backend`:

```bash
git add src/utils/query_bot.py tests/test_query_bot_streaming.py
git commit -m "feat: add assistant streaming query events"
```

Expected: commit succeeds.

---

### Task 2: Backend SSE Route

**Files:**
- Modify: `../backend/src/routes/query_route.py`
- Add: `../backend/tests/test_query_route_stream.py`

- [ ] **Step 1: Add failing route test for SSE framing**

Create `../backend/tests/test_query_route_stream.py`:

```python
import json
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from main import app


async def fake_stream_query(_query_schema):
    yield {"event": "stage", "data": {"stage": "message_received", "label": "Message received"}}
    yield {"event": "delta", "data": {"text": "Hello"}}
    yield {"event": "complete", "data": {"done": True}}


class QueryRouteStreamTest(unittest.TestCase):
    def test_chat_stream_returns_sse_events(self):
        payload = {
            "chat_history": [],
            "user_message": "Hello",
            "conversation_id": "conversation-1",
        }

        with patch("src.routes.query_route.query_bot.stream_query", side_effect=fake_stream_query):
            with TestClient(app) as client:
                response = client.post("/chat/stream", json=payload)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"].split(";")[0], "text/event-stream")
        self.assertIn("event: stage", response.text)
        self.assertIn('data: {"stage": "message_received", "label": "Message received"}', response.text)
        self.assertIn("event: delta", response.text)
        self.assertIn('data: {"text": "Hello"}', response.text)
        self.assertIn("event: complete", response.text)
        self.assertIn('data: {"done": true}', response.text)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the failing route test**

Run from `../backend`:

```bash
python3 -m unittest tests/test_query_route_stream.py -v
```

Expected: FAIL with 404 for `/chat/stream`.

- [ ] **Step 3: Add SSE formatter and route**

Modify `../backend/src/routes/query_route.py`:

```python
import json
```

Add imports:

```python
from fastapi.responses import StreamingResponse
```

Add helper:

```python
def format_sse(event: dict) -> str:
    return f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"
```

Add route:

```python
@query_routes.post('/chat/stream')
async def chatbot_stream(query_schema: QuerySchema):
    async def event_stream():
        async for event in query_bot.stream_query(query_schema):
            yield format_sse(event)

    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

- [ ] **Step 4: Run route tests**

Run from `../backend`:

```bash
python3 -m unittest tests/test_query_route_stream.py -v
```

Expected: PASS.

- [ ] **Step 5: Run backend test suite**

Run from `../backend`:

```bash
python3 -m unittest discover tests -v
```

Expected: PASS.

- [ ] **Step 6: Commit backend SSE route**

Run from `../backend`:

```bash
git add src/routes/query_route.py tests/test_query_route_stream.py
git commit -m "feat: expose assistant chat stream endpoint"
```

Expected: commit succeeds.

---

### Task 3: Frontend Streaming API Helper

**Files:**
- Modify: `src/api/chatApi.js`
- Add: `src/api/chatApi.test.jsx`

- [ ] **Step 1: Add failing tests for SSE parsing**

Create `src/api/chatApi.test.jsx`:

```jsx
import { describe, expect, test, vi } from "vitest";
import { parseSseChunk, streamChatMessage } from "./chatApi";

describe("parseSseChunk", () => {
  test("parses complete SSE events and returns the remaining buffer", () => {
    const result = parseSseChunk(
      "",
      'event: stage\ndata: {"stage":"message_received","label":"Message received"}\n\n'
    );

    expect(result.events).toEqual([
      {
        event: "stage",
        data: { stage: "message_received", label: "Message received" },
      },
    ]);
    expect(result.buffer).toBe("");
  });

  test("keeps incomplete SSE events in the buffer", () => {
    const first = parseSseChunk("", 'event: delta\ndata: {"text":"Hel');
    expect(first.events).toEqual([]);
    expect(first.buffer).toBe('event: delta\ndata: {"text":"Hel');

    const second = parseSseChunk(first.buffer, 'lo"}\n\n');
    expect(second.events).toEqual([{ event: "delta", data: { text: "Hello" } }]);
    expect(second.buffer).toBe("");
  });
});

describe("streamChatMessage", () => {
  test("calls event handlers for streamed events", async () => {
    sessionStorage.setItem("conversation_id", "conversation-1");
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: stage\ndata: {"stage":"message_received","label":"Message received"}\n\n'));
        controller.enqueue(encoder.encode('event: delta\ndata: {"text":"Hello"}\n\n'));
        controller.enqueue(encoder.encode('event: complete\ndata: {"done":true}\n\n'));
        controller.close();
      },
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body,
    });
    const handlers = {
      onStage: vi.fn(),
      onDelta: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    };

    await streamChatMessage([], "Hello", handlers);

    expect(handlers.onStage).toHaveBeenCalledWith({ stage: "message_received", label: "Message received" });
    expect(handlers.onDelta).toHaveBeenCalledWith("Hello");
    expect(handlers.onComplete).toHaveBeenCalledWith({ done: true });
    expect(handlers.onError).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run failing frontend API tests**

Run from `frontend`:

```bash
npm test -- src/api/chatApi.test.jsx
```

Expected: FAIL because `parseSseChunk` and `streamChatMessage` do not exist.

- [ ] **Step 3: Implement shared payload and SSE parser**

Modify `src/api/chatApi.js`:

```js
const buildChatPayload = async (chat_history, user_message) => {
  const chat_history_payload = chat_history
    .map(({ links, ...rest }) => ({
      ...rest,
      message: `${rest.message}${linkToText(links)}`,
    }))
    .filter((message) => message.entity !== "SYSTEM" && message.entity !== "THINK")
    .slice(-10);

  return {
    chat_history: chat_history_payload,
    user_message,
    conversation_id: await getConversationid(),
  };
};

export const parseSseChunk = (buffer, chunk) => {
  const nextBuffer = `${buffer}${chunk}`;
  const parts = nextBuffer.split("\n\n");
  const remainder = parts.pop() || "";
  const events = parts
    .map((part) => {
      const eventLine = part.split("\n").find((line) => line.startsWith("event: "));
      const dataLine = part.split("\n").find((line) => line.startsWith("data: "));
      if (!eventLine || !dataLine) return null;
      return {
        event: eventLine.replace("event: ", "").trim(),
        data: JSON.parse(dataLine.replace("data: ", "")),
      };
    })
    .filter(Boolean);

  return { events, buffer: remainder };
};
```

Update `sendChatMessage()` to use `buildChatPayload()`:

```js
    const payload = await buildChatPayload(chat_history, user_message);
```

Add `streamChatMessage()`:

```js
export const streamChatMessage = async (
  chat_history,
  user_message,
  { onStage, onDelta, onComplete, onError }
) => {
  const payload = await buildChatPayload(chat_history, user_message);
  const response = await fetch(`${CHAT_URL}/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming chat failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const parsed = parseSseChunk(buffer, decoder.decode(value, { stream: true }));
    buffer = parsed.buffer;

    parsed.events.forEach(({ event, data }) => {
      if (event === "stage") onStage?.(data);
      if (event === "delta") onDelta?.(data.text || "");
      if (event === "complete") onComplete?.(data);
      if (event === "error") onError?.(data);
    });
  }
};
```

- [ ] **Step 4: Run frontend API tests**

Run from `frontend`:

```bash
npm test -- src/api/chatApi.test.jsx
```

Expected: PASS.

- [ ] **Step 5: Commit frontend streaming API helper**

Run from `frontend`:

```bash
git add src/api/chatApi.js src/api/chatApi.test.jsx
git commit -m "feat: add streaming chat api helper"
```

Expected: commit succeeds.

---

### Task 4: Assistant Dock Streaming UI

**Files:**
- Modify: `src/components/portfolio/AssistantDock.jsx`
- Modify: `src/components/assistant/DockedAssistant.test.jsx`

- [ ] **Step 1: Mock streaming helper in dock tests**

Modify `src/components/assistant/DockedAssistant.test.jsx` imports:

```jsx
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";
```

Add mock before tests:

```jsx
vi.mock("../../api/chatApi", async () => {
  const actual = await vi.importActual("../../api/chatApi");
  return {
    ...actual,
    getChatSuggestions: vi.fn().mockResolvedValue([]),
    sendChatMessage: vi.fn().mockResolvedValue({ ai_message: "Fallback answer" }),
    streamChatMessage: vi.fn(),
  };
});
```

Add import after the mock:

```jsx
import { streamChatMessage } from "../../api/chatApi";
```

Add cleanup before the tests:

```jsx
beforeEach(() => {
  streamChatMessage.mockReset();
});
```

- [ ] **Step 2: Add failing test for node timeline, collapse, and streamed answer**

Add this test to `src/components/assistant/DockedAssistant.test.jsx`:

```jsx
test("streams assistant stages and collapses timeline while crafting response", async () => {
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    handlers.onStage({ stage: "message_received", label: "Message received" });
    handlers.onStage({ stage: "fetching_related_sources", label: "Fetching related sources" });
    await Promise.resolve();
    handlers.onStage({ stage: "crafting_response", label: "Crafting response" });
    handlers.onDelta("Jacques builds ");
    handlers.onDelta("AI products.");
    handlers.onComplete({ done: true });
  });
  const user = userEvent.setup();
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await user.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Tell me about UBS");
  await user.click(screen.getByRole("button", { name: /Send message/i }));

  await waitFor(() => {
    expect(screen.getByText("Jacques builds AI products.")).toBeInTheDocument();
  });
  expect(screen.queryByText("Fetching related sources")).not.toBeInTheDocument();
});
```

Add a second test for in-flight visible stages:

```jsx
test("shows expanded node timeline before response text starts", async () => {
  let savedHandlers;
  streamChatMessage.mockImplementation(async (_history, _message, handlers) => {
    savedHandlers = handlers;
    handlers.onStage({ stage: "message_received", label: "Message received" });
    handlers.onStage({ stage: "fetching_related_sources", label: "Fetching related sources" });
    return new Promise(() => {});
  });
  const user = userEvent.setup();
  renderWithStore(<AssistantDock onNavigate={() => {}} />);

  await user.type(screen.getByRole("textbox", { name: /Message Jacques AI/i }), "Tell me about UBS");
  await user.click(screen.getByRole("button", { name: /Send message/i }));

  expect(await screen.findByText("Message received")).toBeInTheDocument();
  expect(screen.getByText("Fetching related sources")).toBeInTheDocument();

  act(() => {
    savedHandlers.onStage({ stage: "crafting_response", label: "Crafting response" });
    savedHandlers.onDelta("Starting answer");
  });

  expect(await screen.findByText("Crafting response")).toBeInTheDocument();
  expect(screen.queryByText("Fetching related sources")).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Run failing dock tests**

Run from `frontend`:

```bash
npm test -- src/components/assistant/DockedAssistant.test.jsx
```

Expected: FAIL because `AssistantDock` still uses `sendChatMessage()` directly and has no streaming UI.

- [ ] **Step 4: Add pending stream state and stage constants**

Modify `src/components/portfolio/AssistantDock.jsx` imports:

```jsx
import { getChatSuggestions, sendChatMessage, streamChatMessage } from "../../api/chatApi";
```

Add constants above `AssistantDock`:

```jsx
const STREAM_STAGES = [
  { id: "message_received", label: "Message received" },
  { id: "fetching_related_sources", label: "Fetching related sources" },
  { id: "crafting_response", label: "Crafting response" },
];

const initialStreamState = {
  activeStage: "",
  message: "",
  started: false,
  collapsed: false,
};
```

Add state in `AssistantPanel`:

```jsx
  const [streamState, setStreamState] = useState(initialStreamState);
```

Update the chat scroll effect dependencies:

```jsx
  }, [chatHistory, isThinking, suggestions, showSuggestions, streamState]);
```

- [ ] **Step 5: Replace `deliverMessage()` request path with streaming first and blocking fallback**

Replace the API portion of `deliverMessage()` after `dispatch(setThinking(true));`:

```jsx
    setStreamState({ ...initialStreamState, started: true });

    try {
      let completedText = "";
      let streamOpened = false;

      await streamChatMessage(chatHistory, trimmed, {
        onStage: ({ stage }) => {
          streamOpened = true;
          setStreamState((current) => ({
            ...current,
            activeStage: stage,
            started: true,
            collapsed: stage === "crafting_response" || current.collapsed,
          }));
        },
        onDelta: (text) => {
          streamOpened = true;
          completedText += text;
          setStreamState((current) => ({
            ...current,
            message: `${current.message}${text}`,
            collapsed: true,
          }));
        },
        onComplete: () => {
          const parsed = linkTextParser(completedText);
          dispatch(addChatMessage({ entity: "AI", ...parsed }));
          setStreamState(initialStreamState);
        },
        onError: ({ message: errorMessage }) => {
          throw new Error(errorMessage || "Unable to complete response.");
        },
      });
    } catch (error) {
      if (!streamOpened) {
        const response = await sendChatMessage(chatHistory, trimmed);
        dispatch(
          addChatMessage({
            entity: "AI",
            ...linkTextParser(response.ai_message),
          })
        );
      } else {
        dispatch(
          addChatMessage({
            entity: "SYSTEM",
            message: `error: ${error.message || error}`,
            links: [],
          })
        );
      }
      setStreamState(initialStreamState);
    } finally {
      dispatch(setThinking(false));
    }
```

- [ ] **Step 6: Render pending streaming bubble**

In the chat history body, replace the current `isThinking && <div>Thinking...</div>` block with:

```jsx
            {streamState.started && (
              <AssistantStreamingMessage streamState={streamState} />
            )}
```

Add component below `AssistantMessage`:

```jsx
const AssistantStreamingMessage = ({ streamState }) => {
  const activeIndex = STREAM_STAGES.findIndex((stage) => stage.id === streamState.activeStage);

  return (
    <div className="mr-auto max-w-[88%] rounded-xl border bg-white px-3 py-2 text-sm leading-6 text-slate-700">
      {streamState.collapsed ? (
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500" />
          Crafting response
        </div>
      ) : (
        <div className="mb-2 space-y-1">
          {STREAM_STAGES.map((stage, index) => {
            const isComplete = activeIndex > index;
            const isActive = activeIndex === index;
            return (
              <div key={stage.id} className="grid grid-cols-[auto_1fr] gap-x-2 text-xs text-slate-500">
                <span
                  className={cn(
                    "mt-1 size-2 rounded-full",
                    isComplete || isActive ? "bg-emerald-500" : "bg-slate-300"
                  )}
                />
                <span className={cn(isActive && "font-medium text-emerald-700")}>{stage.label}</span>
              </div>
            );
          })}
        </div>
      )}
      {streamState.message ? <p>{streamState.message}</p> : null}
    </div>
  );
};
```

- [ ] **Step 7: Run dock tests**

Run from `frontend`:

```bash
npm test -- src/components/assistant/DockedAssistant.test.jsx
```

Expected: PASS.

- [ ] **Step 8: Commit dock streaming UI**

Run from `frontend`:

```bash
git add src/components/portfolio/AssistantDock.jsx src/components/assistant/DockedAssistant.test.jsx
git commit -m "feat: render assistant streaming stages"
```

Expected: commit succeeds.

---

### Task 5: Full Verification

**Files:**
- Verify all modified frontend and backend files.

- [ ] **Step 1: Run backend tests**

Run from `../backend`:

```bash
python3 -m unittest discover tests -v
```

Expected: PASS.

- [ ] **Step 2: Run frontend tests**

Run from `frontend`:

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 3: Run frontend build**

Run from `frontend`:

```bash
npm run build
```

Expected: PASS and Vite writes `build/`.

- [ ] **Step 4: Manual smoke test**

Run frontend from `frontend`:

```bash
npm run dev
```

Run backend from `../backend`:

```bash
uvicorn main:app --reload
```

Open the Vite URL, send a chat message, and verify:

- Node timeline appears.
- Timeline shows `Message received` and `Fetching related sources`.
- Timeline collapses at `Crafting response`.
- Answer text streams into the bubble.
- Completed answer keeps existing link button behavior.
- Chat scrolling stays inside the dock.

- [ ] **Step 5: Final status**

Run from `frontend`:

```bash
git status --short
```

Expected: clean working tree after all task commits, except ignored build or local runtime files.
