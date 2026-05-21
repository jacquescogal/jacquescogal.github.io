import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import chatbotStateReducer, { addChatMessage } from "./store/chatbotStateSlice";
import modalStateReducer from "./store/modalStateSlice";

const createTestStore = () =>
  configureStore({
    reducer: {
      chatbotState: chatbotStateReducer,
      modalState: modalStateReducer,
    },
  });

beforeEach(() => {
  window.localStorage.clear();
  window.open = vi.fn();
  window.URL.createObjectURL = vi.fn(() => "blob:resume");
  window.HTMLAnchorElement.prototype.click = vi.fn();
  global.fetch = vi.fn(() =>
    Promise.resolve({
      blob: () => Promise.resolve(new Blob(["resume"], { type: "application/pdf" })),
    })
  );
});

async function renderApp() {
  const store = createTestStore();

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

  return { store };
}

test("shows achievement progress in the header initially at 0/10", async () => {
  await renderApp();

  const achievementProgress = await screen.findByRole("button", { name: "Achievements 0/10" });
  expect(achievementProgress).toBeInTheDocument();
  expect(achievementProgress).toHaveClass("h-8", "overflow-hidden");
});

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

test("resume download unlocks Kept on File and updates achievement progress", async () => {
  await renderApp();

  const resumeButtons = await screen.findAllByRole("button", { name: /^Resume$/i });
  await userEvent.click(resumeButtons[0]);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith("/resume_Jacques.pdf");
  });
  expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(window.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(window.HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);

  const downloadedAnchor = window.HTMLAnchorElement.prototype.click.mock.instances[0];
  expect(downloadedAnchor.href).toBe("blob:resume");
  expect(downloadedAnchor.download).toBe("Resume_CogalJacques.pdf");
  expect(await screen.findByText("Kept on File")).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Achievements 1/10" })).toBeInTheDocument();
});

test("opens the shadcn markdown project archive", async () => {
  await renderApp();

  await userEvent.click(await screen.findByRole("button", { name: /Open README/i }));

  const archiveDialog = screen.getByRole("dialog", { name: /AI Portfolio Assistant/i });
  expect(archiveDialog).toBeInTheDocument();
  expect(within(archiveDialog).getByRole("heading", { name: /AI Portfolio Assistant/i })).toBeInTheDocument();
  expect(within(archiveDialog).getByText(/streaming responses/i)).toBeInTheDocument();
});

test("opening a project README unlocks Proof Reader", async () => {
  await renderApp();

  await userEvent.click(await screen.findByRole("button", { name: /Open README/i }));

  expect(await screen.findByText("Proof Reader")).toBeInTheDocument();
});

test("renders certifications and promotes a supporting certification", async () => {
  await renderApp();

  expect(await screen.findByRole("heading", { name: /Certifications/i })).toBeInTheDocument();
  expect(screen.getAllByText(/Azure AI Engineer Associate/i).length).toBeGreaterThan(0);

  const fundamentalsButton = screen.getByRole("button", { name: /Azure Fundamentals/i });
  await userEvent.click(fundamentalsButton);

  const certificationsSection = screen.getByRole("region", { name: /Certifications/i });
  expect(within(certificationsSection).getByText(/Credential ID: 4609/i)).toBeInTheDocument();
});

test("clicking a credential URL unlocks Credential Check", async () => {
  await renderApp();

  await userEvent.click(await screen.findByRole("link", { name: /Show credential/i }));

  expect(await screen.findByText("Credential Check")).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Achievements 1/10" })).toBeInTheDocument();
});

test("send email unlocks Direct Line", async () => {
  await renderApp();

  await userEvent.click(await screen.findByRole("button", { name: /Send E-mail/i }));

  expect(window.open).toHaveBeenCalledWith(expect.stringMatching(/^mailto:jacques\.tracy@gmail\.com/));
  expect(await screen.findByText("Direct Line")).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Achievements 1/10" })).toBeInTheDocument();
});

test("chat certification links select the matching certification", async () => {
  const { store } = await renderApp();

  act(() => {
    store.dispatch(
      addChatMessage({
        entity: "AI",
        message: "Relevant credential.",
        links: [
          {
            type: "internal",
            text: "Open certification",
            where: "certifications",
            certificationSlug: "azure-fundamentals",
          },
        ],
      })
    );
  });

  await userEvent.click(await screen.findByRole("button", { name: /Open certification/i }));

  const certificationsSection = screen.getByRole("region", { name: /Certifications/i });
  expect(within(certificationsSection).getByText(/Credential ID: 4609/i)).toBeInTheDocument();
});
