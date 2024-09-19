import { validatePassword } from "../validatePassword"; // Adjust the import to your file structure

describe("validatePassword function", () => {
  it("should return true for a valid password", () => {
    expect(validatePassword("A1#bcdefg")).toBe(true);
  });

  it("should return an error message for a password without an uppercase letter", () => {
    expect(validatePassword("1#bcdefgh")).toBe(
      "Password must contain an uppercase letter.",
    );
  });

  it("should return an error message for a password without a number", () => {
    expect(validatePassword("A#bcdefgh")).toBe(
      "Password must contain a number.",
    );
  });

  it("should return an error message for a password without a special character", () => {
    expect(validatePassword("A1bcdefgh")).toBe(
      "Password must contain a special character.",
    );
  });

  it("should return an error message for a password with less than 8 characters", () => {
    expect(validatePassword("A1#bcde")).toBe(
      "Password must contain at least 8 characters.",
    );
  });

  it("should return a combined error message for a password with multiple issues", () => {
    expect(validatePassword("abc")).toBe(
      "Password must contain an uppercase letter, a number, a special character, at least 8 characters.",
    );
  });

  it("should return true for a password with exactly 8 characters meeting all criteria", () => {
    expect(validatePassword("A1#bcdef")).toBe(true);
  });

  it("should return true for a password with more than 8 characters meeting all criteria", () => {
    expect(validatePassword("A1#bcdefghijk")).toBe(true);
  });
});
