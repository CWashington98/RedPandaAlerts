import { convertToCapitalCase } from "../formatText";

describe("Utility Functions", () => {
  describe("convertToCapitalCase Function", () => {
    it("should convert text with underscores to capital case", () => {
      const input = "HELLO_WORLD";
      const expectedOutput = "Hello World";

      expect(convertToCapitalCase(input)).toBe(expectedOutput);
    });

    it("should convert lowercase text to capital case", () => {
      const input = "hello_world";
      const expectedOutput = "Hello World";

      expect(convertToCapitalCase(input)).toBe(expectedOutput);
    });

    it("should handle empty strings without error", () => {
      const input = "";
      const expectedOutput = "";

      expect(convertToCapitalCase(input)).toBe(expectedOutput);
    });
  });
});
