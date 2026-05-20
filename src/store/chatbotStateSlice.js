
import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  showChat: false,
  isBootingUp: true,
  isThinking: false,
  isChatActive: false,
  assistantPrompt: "",
  dialogue: "Hey there, click on me. I'd like to chat with you!",
  chatHistory: [{
    entity: "AI",
    message: "Hello!",
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
    },
    setAssistantPrompt: (state, action) => {
        state.assistantPrompt = action.payload;
    }

  },
});

export const { setShowChat, setThinking, toggleThinking, setBootingUp, setChatActive, addChatMessage, setDialogue, setAssistantPrompt } = chatbotStateSlice.actions;
export default chatbotStateSlice.reducer;

// Redux Thunk for setTempDialogue
export const setTempDialogue = (message) => (dispatch) => {
  dispatch(setDialogue(message));

  setTimeout(() => {
    dispatch(setDialogue(""));
  }, 2000);
};
