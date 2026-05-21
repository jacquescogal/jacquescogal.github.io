import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Button } from "./button";

test("forwards refs to the rendered button element", () => {
  const ref = React.createRef();

  render(<Button ref={ref}>Save</Button>);

  expect(ref.current).toBe(screen.getByRole("button", { name: "Save" }));
});
