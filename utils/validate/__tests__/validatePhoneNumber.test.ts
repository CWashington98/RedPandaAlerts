import parsePhoneNumberFromString from "libphonenumber-js";
import { validatePhoneNumber } from "../validatePhoneNumber";

describe("validatePhoneNumber function", () => {

  it("should return true for a valid phone number with country code", () => {
      expect(validatePhoneNumber("+15403265001")).toBe(true);
  });

  it("should retur true message for a formatted valid phone number with country code", () => {
    expect(validatePhoneNumber("+1 (540) 326-5001")).toBe(true);
  });

  it("should return an error message for a valid phone number without country code", () => {
    expect(validatePhoneNumber("(123) 456-7890")).toBe("Please enter a valid phone number");
  });


  it("should return an error message for a valid phone number without country code", () => {
    expect(validatePhoneNumber("(123) 456-7890")).toBe("Please enter a valid phone number");
  });
  it("should return an error message for a formatted phone number with country code", () => {
    expect(validatePhoneNumber("+1 (123) 456-7890")).toBe("Please enter a valid phone number");
  });
  it("should return an error message for an empty phone number", () => {
    expect(validatePhoneNumber("")).toBe("Please enter your phone number");
  });

  it("should return an error message for a phone number without area code", () => {
    expect(validatePhoneNumber("456-7890")).toBe(
      "Please enter a valid phone number",
    );
  });

  it("should return an error message for a phone number without dashes and spaces", () => {
    expect(validatePhoneNumber("1234567890")).toBe(
      "Please enter a valid phone number",
    );
  });

  it("should return an error message for a phone number with letters", () => {
    expect(validatePhoneNumber("(123) 456-789a")).toBe(
      "Please enter a valid phone number",
    );
  });

  it("should return an error message for a phone number with special characters", () => {
    expect(validatePhoneNumber("(123) 456-789!")).toBe(
      "Please enter a valid phone number",
    );
  });

  it("should return an error message for a phone number with incorrect format", () => {
    expect(validatePhoneNumber("123-456-7890")).toBe(
      "Please enter a valid phone number",
    );
  });
});
