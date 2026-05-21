# Assistant Thinking Stages Design

## Goal

Add a real backend-driven streaming chat experience to the portfolio assistant. While Jacques AI is answering, the dock should show operational request stages as nodes, then stream the final answer text into the assistant bubble.

This feature must avoid exposing or implying private model reasoning. The visible statuses describe backend lifecycle steps only.

## User Experience

When a visitor sends a chat message, the assistant dock shows a pending assistant response with a node timeline:

1. Message received
2. Fetching related sources
3. Crafting response

The timeline is expanded while the backend accepts the request and performs retrieval. When the backend enters `crafting_response`, the timeline collapses into a compact status row and the answer text begins streaming below it.

When streaming completes, the compact status row disappears and only the final assistant message remains. Existing internal and external links in assistant answers continue to render as clickable buttons, including portfolio section highlighting.

The retrieval stage stays generic. It says `Fetching related sources`; it does not expose source counts or document names in this first version.

## API Design

Add a new backend streaming endpoint while keeping the current blocking `/chat` endpoint as fallback:

```text
POST /chat/stream
Accept: text/event-stream
Content-Type: application/json
```

The request payload matches the existing `/chat` shape:

```json
{
  "chat_history": [],
  "user_message": "Tell me about UBS work",
  "conversation_id": "..."
}
```

The backend emits structured Server-Sent Events:

```text
event: stage
data: {"stage":"message_received","label":"Message received"}

event: stage
data: {"stage":"fetching_related_sources","label":"Fetching related sources"}

event: stage
data: {"stage":"crafting_response","label":"Crafting response"}

event: delta
data: {"text":"Jacques worked..."}

event: complete
data: {"done":true}
```

If the request fails after streaming starts, the backend emits:

```text
event: error
data: {"message":"Unable to complete response."}
```

## Backend Architecture

`QueryBot` keeps the current retrieval and answer-generation responsibilities, but gains a streaming path that can yield lifecycle events.

The streaming flow is:

1. Yield `message_received`.
2. Yield `fetching_related_sources`.
3. Retrieve Chroma context using the current retriever path.
4. Yield `crafting_response`.
5. Call the OpenAI responses API in streaming mode.
6. Yield `delta` events as text arrives.
7. Yield `complete`.

The existing `query()` method remains available for `/chat` and tests that rely on a complete string response.

## Frontend Architecture

Add a streaming chat API helper beside `sendChatMessage`. It should:

1. Build the same sanitized chat payload as the existing helper.
2. Request the streaming endpoint with `fetch`, because browser `EventSource` does not support POST bodies.
3. Parse SSE events from the response body.
4. Notify the caller about `stage`, `delta`, `complete`, and `error` events.
5. Fall back to the existing non-streaming helper only when the streaming request cannot be opened.

`AssistantDock` gets local pending-response state:

```text
streamStages: [{ id, label, status }]
activeStage: string
streamingMessage: string
isStreaming: boolean
```

During streaming, the pending assistant bubble is rendered separately from committed Redux chat history. On `complete`, the final streamed text is parsed with the existing `linkTextParser` and committed as a normal `AI` chat message.

## UI Behavior

The dock uses the selected Node Timeline treatment:

- Expanded vertical nodes for `message_received` and `fetching_related_sources`.
- Collapsed compact status row once `crafting_response` starts.
- Streaming text appears in the same assistant bubble below the compact row.
- Completed stages use the existing shadcn-inspired neutral/emerald palette.
- Error state appears as the existing system message style.

The chat history scroll behavior must stay contained inside the dock. New stage and token updates should scroll the chat history container, not the main portfolio page.

## Error Handling

If streaming is unsupported or the connection fails before events begin, the frontend retries once with the current `/chat` endpoint.

If streaming fails after events begin, the frontend should stop the pending response and add a system error message. It should not commit a partial assistant answer as a normal `AI` message unless the backend sends `complete`.

The send button remains disabled while a request is active.

## Testing

Backend tests:

- Streaming endpoint emits stages in the expected order.
- Streaming endpoint emits token deltas and a final complete event.
- Errors are converted to SSE `error` events.
- Existing `/chat` behavior remains unchanged.

Frontend tests:

- Sending a message can render the expanded node timeline.
- `crafting_response` collapses the timeline.
- Delta events append visible streamed text.
- Completion commits one final assistant message and clears pending status.
- Existing non-streaming fallback and link parsing behavior remain covered.

## Out Of Scope

- Showing retrieved document names or source counts.
- Exposing model chain-of-thought.
- Full WebSocket chat.
- Streaming suggested questions.
- Reworking the assistant dock layout beyond the pending-response state.
