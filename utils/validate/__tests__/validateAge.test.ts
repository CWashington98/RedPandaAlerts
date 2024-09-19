import { validateAge } from "../validateAge"; // Adjust the import to your file structure
import { differenceInYears } from "date-fns";

describe("validateAge function", () => {
  it("should return an error message if the date is undefined", () => {
    expect(validateAge(undefined)).toBe("A valid date is required.");
  });

  it("should return true if the age is greater than or equal to the threshold", () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 22); // Set the date to 22 years ago
    expect(validateAge(date)).toBe(true);
  });

  it("should return an error message if the age is less than the threshold", () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20); // Set the date to 20 years ago
    expect(validateAge(date)).toBe("You must be at least 21 years old.");
  });

  it("should correctly validate age with a different threshold", () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18); // Set the date to 18 years ago
    expect(validateAge(date, 18)).toBe(true);
  });

  it("should return ab error message if the age is exactly one day less than the threshold", () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 21); // Set the date to 21 years ago
    date.setDate(date.getDate() + 1); // Add one day, making the age one day less than 21 years
    expect(validateAge(date)).toBe("You must be at least 21 years old.");
  });
});
