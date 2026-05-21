import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { store } from "./store/store";

async function renderApp() {
  await act(async () => {
    render(
      <Router>
        <Provider store={store}>
          <App />
        </Provider>
      </Router>
    );
    await Promise.resolve();
  });
}

test("renders the portfolio profile section", async () => {
  await renderApp();

  await waitFor(() => {
    expect(screen.getAllByRole("button", { name: /Resume/i }).length).toBeGreaterThan(0);
  });
  screen.getAllByRole("button", { name: /Resume/i }).forEach((button) => {
    expect(button).toHaveClass("border-emerald-200", "bg-emerald-50", "text-emerald-700", "hover:bg-emerald-100");
  });
  expect(screen.getByRole("complementary", { name: /Jacques AI workspace/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /Software Engineer/i })).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: /Open README/i })).toBeInTheDocument();
});

test("opens the shadcn markdown project archive", async () => {
  await renderApp();

  await userEvent.click(await screen.findByRole("button", { name: /Open README/i }));

  const archiveDialog = screen.getByRole("dialog", { name: /AI Portfolio Assistant/i });
  expect(archiveDialog).toBeInTheDocument();
  expect(within(archiveDialog).getByRole("heading", { name: /AI Portfolio Assistant/i })).toBeInTheDocument();
  expect(within(archiveDialog).getByText(/streaming responses/i)).toBeInTheDocument();
});
