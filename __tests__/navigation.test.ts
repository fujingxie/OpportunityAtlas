import { visibleNavItems } from "@/lib/navigation";

describe("navigation visibility", () => {
  it("hides admin navigation for viewer", () => {
    const labels = visibleNavItems("viewer").map((item) => item.label);

    expect(labels).toEqual(["首页", "活动库", "案例库"]);
    expect(labels).not.toContain("数据管理");
  });

  it("shows admin navigation for admin", () => {
    const labels = visibleNavItems("admin").map((item) => item.label);

    expect(labels).toContain("数据管理");
  });
});

