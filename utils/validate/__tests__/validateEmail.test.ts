import { validateEmail } from "../validateEmail"; // Adjust the import to your file structure

describe("validateEmail function", () => {
  it("should return true for a valid email address", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  it("should return an error message for an email without a domain", () => {
    expect(validateEmail("test@")).toBe("Please enter a valid email address");
  });

  it('should return an error message for an email without an "@" symbol', () => {
    expect(validateEmail("testexample.com")).toBe(
      "Please enter a valid email address",
    );
  });

  it("should return an error message for an email with spaces", () => {
    expect(validateEmail("test example.com")).toBe(
      "Please enter a valid email address",
    );
  });

  it("should return an error message for an empty string", () => {
    expect(validateEmail("")).toBe("Please enter a valid email address");
  });

  it("should return true for an email with a subdomain", () => {
    expect(validateEmail("test@sub.example.com")).toBe(true);
  });

  it("should return true for an email with numbers and special characters", () => {
    expect(validateEmail("test123._%+-@example.com")).toBe(true);
  });

  it('should return an error message for an email with multiple "@" symbols', () => {
    expect(validateEmail("test@@example.com")).toBe(
      "Please enter a valid email address",
    );
  });
});
