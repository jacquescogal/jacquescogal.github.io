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
  screen.getAllByRole("button", { name: /Resume/i }).forEach((button) => {
    expect(button).toHaveClass("border-emerald-200", "bg-emerald-50", "text-emerald-700", "hover:bg-emerald-100");
  });
  expect(screen.getByRole("complementary", { name: /Jacques AI workspace/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Software Engineer/i })).toBeInTheDocument();
});
