
import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  showChat: false,
  isBootingUp: true,
  isThinking: false,
  isChatActive: false,
  dialogue: "Hey there, click on me. I'd like to chat with you!",
  chatHistory: [{
    entity: "AI",
    message: "Hello! Ask me anything about Jacques!",
    links: [],
  }],
};

const chatbotStateSlice = createSlice({
  name: "chatbotState",
  initialState,
  reducers: {
    setShowChat: (state, action) => {
      state.showChat = action.payload;
    },
    setThinking: (state, action) => {
      state.isThinking = action.payload;
    },
    toggleThinking: (state) => {
      state.isThinking = !state.isThinking;
    },
    setBootingUp: (state, isAction) => {
        state.isBootingUp = isAction.payload;
    },
    setChatActive: (state, isAction) => {
        state.isChatActive = isAction.payload;
    },
    addChatMessage: (state, action) => {
        state.chatHistory.push(action.payload);
    },
    setDialogue: (state, action) => {
    
        state.dialogue = action.payload;
    }

  },
});

export const { setShowChat, setThinking, toggleThinking, setBootingUp, setChatActive, addChatMessage, setDialogue } = chatbotStateSlice.actions;
export default chatbotStateSlice.reducer;

// Redux Thunk for setTempDialogue
export const setTempDialogue = (message) => (dispatch) => {
  dispatch(setDialogue(message));

  setTimeout(() => {
    dispatch(setDialogue(""));
  }, 2000);
};


import { configureStore } from "@reduxjs/toolkit";
import chatbotStateReducer from "./chatbotStateSlice";

export const store = configureStore({
  reducer: {
    chatbotState: chatbotStateReducer,
  },
});