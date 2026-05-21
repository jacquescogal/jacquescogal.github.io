import axios from "axios";
import { linkToText } from "../utils/Links";

const CHAT_URL = import.meta.env.VITE_CHAT_URL; // Read from .env

export const buildChatPayload = async (chat_history, user_message) => {
  const chat_history_payload = chat_history.map(({ links, ...rest }) => {
    rest.message += linkToText(links);
    return rest;
  }).filter((message) => message.entity !== "SYSTEM" && message.entity !== "THINK").slice(-10);

  return {
    chat_history: chat_history_payload,
    user_message: user_message,
    conversation_id: await getConversationid(),
  };
};

export const sendChatMessage = async (chat_history, user_message) => {
  try {
    const payload = await buildChatPayload(chat_history, user_message);
    const response = await axios.post(CHAT_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
};

export const parseSseChunk = (buffer, chunk) => {
  const combined = buffer + chunk;
  const parts = combined.split("\n\n");
  const nextBuffer = parts.pop();
  const events = parts.flatMap((part) => {
    if (part.trim() === "") {
      return [];
    }

    const lines = part.split("\n");
    const eventLine = lines.find((line) => line.startsWith("event:"));
    const dataLines = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice("data:".length).trimStart());

    if (!eventLine || dataLines.length === 0) {
      return [];
    }

    const event = eventLine.slice("event:".length).trim();
    const dataText = dataLines.join("\n");

    return [{
      event,
      data: JSON.parse(dataText),
    }];
  });

  return {
    events,
    buffer: nextBuffer,
  };
};

export const streamChatMessage = async (
  chat_history,
  user_message,
  { onStage, onDelta, onComplete, onError } = {},
) => {
  try {
    const payload = await buildChatPayload(chat_history, user_message);
    const response = await fetch(`${CHAT_URL}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) {
      throw new Error("Chat stream request failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    while (!done) {
      const result = await reader.read();
      done = result.done;

      if (result.value) {
        const parsed = parseSseChunk(buffer, decoder.decode(result.value, { stream: !done }));
        buffer = parsed.buffer;

        parsed.events.forEach(({ event, data }) => {
          if (event === "stage") {
            onStage?.(data);
          } else if (event === "delta") {
            onDelta?.(data.text || "");
          } else if (event === "complete") {
            onComplete?.(data);
          } else if (event === "error") {
            onError?.(data);
          }
        });
      }
    }
  } catch (error) {
    onError?.(error);
    throw error;
  }
};

export const getChatSuggestions = async (chat_history) => {
  try {
    const filtered_history = chat_history.map(({ links, ...rest }) => {
      rest.message += linkToText(links);
      return rest;
    }).filter((message) => message.entity !== "SYSTEM" && message.entity !== "THINK");

    // Get last 3 pairs (6 messages max: USER, AI, USER, AI, USER, AI)
    const chat_history_payload = filtered_history.slice(-6);

    const payload = {
      chat_history: chat_history_payload,
    };

    const response = await axios.post(CHAT_URL + "/suggestions", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data.suggestions;
  } catch (error) {
    console.error("Suggestions API error:", error);
    throw error;
  }
};

const getConversationid = async () => {
  if (sessionStorage.getItem("conversation_id") === null || sessionStorage.getItem("conversation_id") === undefined) {
    const response = await axios.get(CHAT_URL + "/id");
    sessionStorage.setItem("conversation_id", response.data.conversation_id);
  }
  return sessionStorage.getItem("conversation_id");
}
