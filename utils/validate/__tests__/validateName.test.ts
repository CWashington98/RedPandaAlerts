import { validateName } from "../validateName"; // Adjust the import to your file structure

describe("validateName function", () => {
  it("should return true for a valid name containing letters", () => {
    expect(validateName("John Doe")).toBe(true);
  });

  it("should return true for a valid name containing numbers", () => {
    expect(validateName("John123")).toBe(true);
  });

  it("should return an error message for an empty string", () => {
    expect(validateName("")).toBe("Please enter your name");
  });

  it("should return an error message for a name containing only spaces", () => {
    expect(validateName("   ")).toBe(
      "Name should contain at least one letter or number",
    );
  });

  it("should return an error message for a name containing only special characters", () => {
    expect(validateName("!@#$%^&*()")).toBe(
      "Name should contain at least one letter or number",
    );
  });

  it("should return true for a name containing letters and special characters", () => {
    expect(validateName("John-Doe")).toBe(true);
  });

  it("should return true for a name containing numbers and special characters", () => {
    expect(validateName("123-456")).toBe(true);
  });

  it("should return true for a name containing letters, numbers, and special characters", () => {
    expect(validateName("John123!")).toBe(true);
  });
});
