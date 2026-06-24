import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("home page", () => {
  it("shows the brand and avoids deferred feature copy", () => {
    render(<HomePage />);

    expect(screen.getByText("Opportunity Atlas")).toBeInTheDocument();
    expect(screen.queryByText("智能匹配")).not.toBeInTheDocument();
    expect(screen.queryByText("AI 分析")).not.toBeInTheDocument();
    expect(screen.queryByText("匹配度")).not.toBeInTheDocument();
  });
});

