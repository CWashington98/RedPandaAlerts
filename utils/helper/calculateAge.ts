import { differenceInYears } from "date-fns";

export const calculateAge = (date: Date) => {
  const today = new Date();
  return differenceInYears(today, date);
};
