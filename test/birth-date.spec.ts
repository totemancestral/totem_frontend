import { describe, expect, it } from "vitest";
import { normalizeBirthDate } from "@/lib/birth-date";

describe("year-free birthday", () => {
  it.each(["02-29", "12-31", "01-01"])("preserves a valid recurring anniversary %s", value => {
    expect(normalizeBirthDate(value)).toBe(value);
  });
  it("reads historical dates as day and month only", () => {
    expect(normalizeBirthDate("2000-02-29")).toBe("02-29");
    expect(normalizeBirthDate("1985-12-25")).toBe("12-25");
  });
  it.each([null, undefined, "02-30", "04-31", "2023-02-29", "0000-01-01", "--02-29"])("rejects an invalid historical or partial date %s", value => {
    expect(normalizeBirthDate(value)).toBeNull();
  });
});
