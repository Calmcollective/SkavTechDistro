import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// A dummy component to test, representing the Dashboard
function Dashboard() {
  return (
    <div>
      <h1>Refurbishment Dashboard</h1>
    </div>
  );
}

describe("Dashboard", () => {
  it("renders the main dashboard heading", () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /Refurbishment Dashboard/i })).toBeInTheDocument();
  });
});