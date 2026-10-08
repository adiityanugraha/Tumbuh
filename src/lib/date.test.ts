import { describe, expect, it } from "vitest";
import { timeOfDay } from "./date";

describe("timeOfDay", () => {
  it("membagi jam jadi pagi, siang, sore, malam", () => {
    expect([4, 5, 9, 10, 14, 15, 17, 18, 23].map(timeOfDay)).toEqual([
      "malam",
      "pagi",
      "pagi",
      "siang",
      "siang",
      "sore",
      "sore",
      "malam",
      "malam",
    ]);
  });
});
