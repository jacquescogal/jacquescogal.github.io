import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { store } from "./store/store";

test("renders the portfolio profile section", () => {
  render(
    <Router>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  );

  expect(screen.getAllByRole("button", { name: /Resume/i }).length).toBeGreaterThan(0);
});
