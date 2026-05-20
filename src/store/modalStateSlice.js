
import { createSlice } from '@reduxjs/toolkit';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const initialState = {
  showModal: false,
  content: 
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {`# Brief

An app to aid users learn Chinese based on the HSK standard up to HSK 6

## DB Architecture

![db architecture](https://github.com/jacquescogal/cn-llm/blob/main/cn_llm_db.png?raw=true)

## Features

1. Conversational Bot
2. Storybook
3. Flashcards (spaced repetition with fsrs algorithm https://github.com/open-spaced-repetition)
4. Quizzes
`}
        </ReactMarkdown>
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