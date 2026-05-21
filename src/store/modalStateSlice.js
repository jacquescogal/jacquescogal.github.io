
import { createSlice } from '@reduxjs/toolkit';

export const DEFAULT_MODAL_CONTENT = `# Brief

An app to aid users learn Chinese based on the HSK standard up to HSK 6

## DB Architecture

![db architecture](https://github.com/jacquescogal/cn-llm/blob/main/cn_llm_db.png?raw=true)

## Features

1. Conversational Bot
2. Storybook
3. Flashcards (spaced repetition with fsrs algorithm https://github.com/open-spaced-repetition)
4. Quizzes
`;

const initialState = {
  showModal: false,
  content: DEFAULT_MODAL_CONTENT,
};

const modalStateSlice = createSlice({
  name: "articleSlice",
  initialState,
  reducers: {
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
    setContent: (state, action) => {
        state.content = action.payload;
    }
  },
});

export const { setShowModal, setContent } = modalStateSlice.actions;
export default modalStateSlice.reducer;
