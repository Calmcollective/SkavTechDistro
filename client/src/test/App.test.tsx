import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// A dummy component to test
function App() {
  return <h1>Hello Skavtech</h1>;
}

describe("App", () => {
  it("renders headline", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /hello skavtech/i })).toBeInTheDocument();
  });
});