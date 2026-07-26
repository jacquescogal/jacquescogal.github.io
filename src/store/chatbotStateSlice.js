
import { createSlice } from '@reduxjs/toolkit';


/* The transcript a visitor arrives to, and the one Clear returns them to.
   Defined once so "reset" can never drift from "initial". */
export const seedChatHistory = () => [{
  entity: "AI",
  message: "Hello!",
  links: [],
}];

const initialState = {
  showChat: false,
  isThinking: false,
  isChatActive: false,
  assistantPrompt: "",
  dialogue: "Hey there, click on me. I'd like to chat with you!",
  chatHistory: seedChatHistory(),
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
    setChatActive: (state, isAction) => {
        state.isChatActive = isAction.payload;
    },
    addChatMessage: (state, action) => {
        state.chatHistory.push(action.payload);
    },
    resetChatHistory: (state) => {
        state.chatHistory = seedChatHistory();
        state.isThinking = false;
        state.assistantPrompt = "";
    },
    setDialogue: (state, action) => {
    
        state.dialogue = action.payload;
    },
    setAssistantPrompt: (state, action) => {
        state.assistantPrompt = action.payload;
    }

  },
});

export const { setShowChat, setThinking, toggleThinking, setChatActive, addChatMessage, resetChatHistory, setDialogue, setAssistantPrompt } = chatbotStateSlice.actions;
export default chatbotStateSlice.reducer;

// Redux Thunk for setTempDialogue
export const setTempDialogue = (message) => (dispatch) => {
  dispatch(setDialogue(message));

  setTimeout(() => {
    dispatch(setDialogue(""));
  }, 2000);
};
