import {
  formatPhoneNumber,
  AWSFormatPhoneNumberWithDefaultCountryCode,
} from "../formatPhoneNumber";

describe("PhoneNumber Formatting", () => {
  describe("formatPhoneNumber", () => {
    it("should NOT format phone numbers with less than or equal to 3 digits", () => {
      expect(formatPhoneNumber("1")).toBe(null);
      expect(formatPhoneNumber("12")).toBe(null);
      expect(formatPhoneNumber("123")).toBe(null);
    });

    it("should NOT format phone numbers with more than 3 and less than or equal to 6 digits", () => {
      expect(formatPhoneNumber("1234")).toBe(null);
      expect(formatPhoneNumber("12345")).toBe(null);
      expect(formatPhoneNumber("123456")).toBe(null);
    });

    it("should format phone numbers with more than 6 digits correctly", () => {
      expect(formatPhoneNumber("1234567")).toBe(null);
      expect(formatPhoneNumber("12345678")).toBe(null);
      expect(formatPhoneNumber("1234567890")).toBe("(123) 456-7890");
    });

    // Edge Cases
    it("should handle phone numbers with non-digit characters", () => {
      expect(formatPhoneNumber("1a2b3c")).toBe(null);
      expect(formatPhoneNumber("(123)-456-7890")).toBe("(123) 456-7890");
    });

    it("should handle empty strings", () => {
      expect(formatPhoneNumber("")).toBe(null);
    });

    it("should handle phone numbers with more than 10 digits", () => {
      expect(formatPhoneNumber("12345678901")).toBe("+1 (234) 567-8901"); // Truncates extra digits
    });
  });

  describe("AWSFormatPhoneNumber", () => {
    it("should remove non-digit characters from phone numbers", () => {
      expect(AWSFormatPhoneNumberWithDefaultCountryCode("1a2b3c")).toBe("+1123");
      expect(AWSFormatPhoneNumberWithDefaultCountryCode("(123)-456-7890")).toBe(
        "+11234567890",
      );
    });

    // Edge Cases
    it("should handle empty strings", () => {
      expect(AWSFormatPhoneNumberWithDefaultCountryCode("")).toBe("");
    });
  });
});
