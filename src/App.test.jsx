import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { store } from "./store/store";

test("renders the portfolio profile section", async () => {
  render(
    <Router>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  );

  await waitFor(() => {
    expect(screen.getAllByRole("button", { name: /Resume/i }).length).toBeGreaterThan(0);
  });
  expect(screen.getByRole("complementary", { name: /Jacques AI workspace/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Full-stack software engineer/i })).toBeInTheDocument();
});
