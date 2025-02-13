import { configureStore } from "@reduxjs/toolkit";
import chatbotStateReducer from "./chatbotStateSlice";

export const store = configureStore({
  reducer: {
    chatbotState: chatbotStateReducer,
  },
});