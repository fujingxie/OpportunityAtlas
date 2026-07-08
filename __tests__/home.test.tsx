import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("home page", () => {
  it("shows the search entrance and avoids deferred feature copy", () => {
    render(<HomePage />);

    expect(screen.getByText("发现活动机会，连接真实案例路径")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "搜索活动与案例" })).toBeInTheDocument();
    expect(screen.queryByText("智能匹配")).not.toBeInTheDocument();
    expect(screen.queryByText("AI 分析")).not.toBeInTheDocument();
    expect(screen.queryByText("匹配度")).not.toBeInTheDocument();
  });
});
