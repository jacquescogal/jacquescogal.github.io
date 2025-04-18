import axios from "axios";
import { linkToText } from "../utils/Links";

const CHAT_URL = process.env.REACT_APP_CHAT_URL; // Read from .env

export const sendChatMessage = async (chat_history, user_message) => {

  try {
    const chat_history_payload = chat_history.map(({ links, ...rest }) => {
      rest.message += linkToText(links);
      return rest;
    }).filter((message) => message.entity !== "SYSTEM" && message.entity !== "THINK").slice(-10);

    // filter out system messages
    const payload = {
      chat_history: chat_history_payload,
      user_message: user_message,
      conversation_id: await getConversationid(),
    };
    const response = await axios.post(CHAT_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Chat API error:", error);
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