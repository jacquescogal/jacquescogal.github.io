import { configureStore } from "@reduxjs/toolkit";
import chatbotStateReducer from "./chatbotStateSlice";
import modalStateReducer from "./modalStateSlice";

export const store = configureStore({
  reducer: {
    chatbotState: chatbotStateReducer,
    modalState: modalStateReducer,
  },
});