import { describe, expect, it } from "vitest";
import { planCombinations, type Combination } from "./combinationPlanner";
const demands = (sizes: number[]) =>
  sizes.map((need, i) => ({ id: String(i), need }));
function verify(plan: Combination, sizes: number[]) {
  expect(plan.machines.flatMap((m) => m.models).sort()).toEqual(
    sizes.map((_, i) => String(i)).sort(),
  );
  for (const m of plan.machines) {
    expect(m.used).toBe(m.models.reduce((n, id) => n + sizes[+id], 0));
    expect(m.used).toBeLessThanOrEqual(m.capacity);
  }
}
describe("simultaneous model placement", () => {
  it("finds a mixed fleet and respects inventory counts", () => {
    const r = planCombinations(
      demands([26, 15, 15]),
      [
        { id: "32", capacity: 32, count: 1 },
        { id: "16", capacity: 16, count: 2 },
      ],
      true,
    );
    expect(r.status).toBe("fit");
    expect(r.plans[0].count).toBe(3);
    expect(r.plans[0].machines.map((m) => m.deviceId).sort()).toEqual([
      "16",
      "16",
      "32",
    ]);
    verify(r.plans[0], [26, 15, 15]);
  });
  it("does not pool memory across machines", () => {
    expect(
      planCombinations(
        demands([33]),
        [{ id: "a", capacity: 32, count: 2 }],
        true,
      ).status,
    ).toBe("infeasible");
    expect(
      planCombinations(
        demands([20, 20, 20]),
        [{ id: "a", capacity: 32, count: 2 }],
        true,
      ).status,
    ).toBe("infeasible");
  });
  it("backtracks when greedy packing would waste a machine", () => {
    const sizes = [6, 5, 3, 2, 2, 2];
    const r = planCombinations(
      demands(sizes),
      [{ id: "a", capacity: 10, count: 2 }],
      true,
    );
    expect(r.status).toBe("fit");
    verify(r.plans[0], sizes);
    expect(r.plans[0].count).toBe(2);
  });
  it("ranks catalog combinations by count and then unused memory", () => {
    const r = planCombinations(demands([25, 15]), [
      { id: "small", capacity: 16 },
      { id: "mid", capacity: 32 },
      { id: "large", capacity: 48 },
    ]);
    expect(r.status).toBe("fit");
    expect(r.plans[0].machines[0].deviceId).toBe("large");
    const mixed = planCombinations(demands([25, 15]), [
      { id: "small", capacity: 16 },
      { id: "mid", capacity: 32 },
    ]);
    expect(mixed.plans[0].remaining).toBe(8);
    mixed.plans.forEach((p) => verify(p, [25, 15]));
  });
  it("rejects unknown requirements and invalid counts instead of using zero", () => {
    for (const need of [null, NaN, Infinity, -1, 0])
      expect(
        planCombinations([{ id: "m", need }], [{ id: "a", capacity: 16 }])
          .status,
      ).toBe("invalid");
    for (const count of [0, 1.2, NaN, 1000])
      expect(
        planCombinations(demands([1]), [{ id: "a", capacity: 16, count }], true)
          .status,
      ).toBe("invalid");
  });
  it("reports incomplete search honestly", () => {
    expect(
      planCombinations(demands([1, 2]), [{ id: "a", capacity: 16 }], false, 1)
        .status,
    ).toBe("limited");
  });
  it("matches an exhaustive two-bin feasibility oracle", () => {
    for (let a = 1; a <= 6; a++)
      for (let b = 1; b <= 6; b++)
        for (let c = 1; c <= 6; c++) {
          const sizes = [a, b, c];
          const possible = Array.from({ length: 8 }, (_, mask) =>
            sizes.reduce((n, v, i) => n + ((mask >> i) & 1 ? v : 0), 0),
          ).some((n) => n <= 8 && a + b + c - n <= 8);
          const r = planCombinations(
            demands(sizes),
            [{ id: "a", capacity: 8, count: 2 }],
            true,
          );
          expect(r.status === "fit").toBe(possible);
          r.plans.forEach((p) => verify(p, sizes));
        }
  });
});
