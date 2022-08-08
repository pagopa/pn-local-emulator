import { evalChecklist } from "../types";

describe("evalChecklist", () => {
  it("should eval the checklist without errors", () => {
    const group = {
      name: "Group name",
    };
    const check0 = {
      name: "Check 0",
      group: group,
      eval: (input: boolean) => input
    };
    const check1 = {
      name: "Check 1",
      group: group,
      eval: (input: boolean) => !input
    };

    const actual = evalChecklist([check0, check1])(true);
    const expected = [
      {
        name: "Check 0",
        group: group,
        result: "ok",
      },
      {
        name: "Check 1",
        group: group,
        result: "ko",
      }
    ];

    expect(actual).toStrictEqual(expected);
  });
});
