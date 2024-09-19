import { differenceInYears } from "date-fns";

export const validateAge = (date: Date | undefined, threshold: number = 21) => {
  const today = new Date();
  if (!date) return "A valid date is required.";

  const age = differenceInYears(today, date);
  if (age < threshold) {
    return `You must be at least ${threshold} years old.`;
  }

  return true;
};
