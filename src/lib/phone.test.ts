import { describe, expect, it } from "vitest";
import { normalizePhone } from "./phone";

describe("owner phone normalization", () => {
  it("preserves the first requested administrator phone", () => {
    expect(normalizePhone("557099944")).toBe("557099944");
    expect(normalizePhone("+995 557 099 944")).toBe("557099944");
  });
  it("preserves the second requested administrator phone", () => {
    expect(normalizePhone("555673731")).toBe("555673731");
    expect(normalizePhone("+995 555 673 731")).toBe("555673731");
  });
});