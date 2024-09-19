import { toZonedTime, format } from "date-fns-tz";
import { parse, isValid } from "date-fns";

const commonDateFormats = [
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "yyyy-MM-dd",
  "dd-MM-yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "dd MMM yyyy",
  "MMM dd, yyyy",
  // Add more formats as needed
];

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const abbreviateDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const abbreviatedMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const timeZone = "UTC"; // Always convert to UTC

function isValidDate(d: any): boolean {
  return d instanceof Date && !isNaN(d.getTime());
}
function createDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  // Try parsing with Date constructor
  let date = new Date(dateInput);
  if (isValidDate(date)) {
    return date;
  }
  // If parsing fails, append 'Z' to interpret as UTC
  if (!dateInput?.endsWith("Z")) {
    dateInput += "Z";
    date = new Date(dateInput);
  }
  return date;
}

export function formatDate(dateInput: string | Date) {
  const date = createDate(dateInput);
  if (!isValidDate(date)) {
    return "Invalid Date";
  }
  return format(date, "MM/dd/yyyy");
}

export function AWSFormatDate(dateInput: string | Date): string {
  let date: Date | undefined;

  if (typeof dateInput === "string") {
    for (const formatString of commonDateFormats) {
      date = parse(dateInput, formatString, new Date());
      if (isValid(date)) break;
    }
  } else {
    date = dateInput;
  }

  if (!date || !isValid(date)) {
    return "Invalid Date";
  }

  return format(date, "yyyy-MM-dd");
}
// Parses the date string in 'MM/dd/yyyy' format
export function AWSFormatDateISOString(dateInput: string | Date) {
  let date;

  if (typeof dateInput === "string") {
    // Adjust the parse format to match the input format
    date = parse(dateInput, "MM/dd/yyyy", new Date());
  } else {
    date = dateInput;
  }

  if (!isValid(date)) {
    return "Invalid Date";
  }

  return new Date(date).toISOString();
}

export function AWSFormatDateTime(dateInput: Date | string): string {
  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = createDate(dateInput);
  }

  if (!isValidDate(date)) {
    return "Invalid Date";
  }

  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone });
}

export function formatUSStandardDateTime(
  dateInput: Date | string,
  timeZone: string = "America/New_York"
) {
  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = createDate(dateInput);
  }

  if (!isValidDate(date)) {
    return "Invalid Date";
  }

  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, "MM/dd/yyyy, hh:mm aa");
}

export function formatExtendedUSDate(
  dateInput: Date | string,
  includeTime: boolean = false
): string {
  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = createDate(dateInput);
  }
  const zonedDate = toZonedTime(date, timeZone);
  const dayOfWeek = abbreviateDaysOfWeek[zonedDate.getDay()];
  const month = abbreviatedMonths[zonedDate.getMonth()];
  const dayOfMonth = zonedDate.getDate();
  const year = zonedDate.getFullYear();

  if (includeTime) {
    const time = getTimeIn12HourFormat(format(zonedDate, "HH:mm"));
    return `${dayOfWeek}, ${month} ${dayOfMonth}, ${year}, ${time}`;
  }

  return `${dayOfWeek}, ${month} ${dayOfMonth}, ${year}`;
}

export function getEventFormatDate(awsDate: string): {
  dayOfWeek: string;
  month: string;
  dayOfMonth: string;
  year: string;
} {
  const date = createDate(awsDate);

  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  const month = months[date.getUTCMonth()];
  const dayOfMonth = date.getUTCDate().toString();
  const year = date.getUTCFullYear().toString();

  return {
    dayOfWeek,
    month,
    dayOfMonth,
    year,
  };
}

export function getDayofWeek(awsDate: string): string {
  const date = toZonedTime(createDate(awsDate), timeZone);
  const dayOfWeek = daysOfWeek[date.getDay()];
  return `${dayOfWeek}`;
}

export function getMonth(awsDate: string): string {
  const date = toZonedTime(createDate(awsDate), timeZone);
  const month = months[date.getMonth()];
  return `${month}`;
}

export function getDayOfMonth(awsDate: string): string {
  const date = toZonedTime(createDate(awsDate), timeZone);
  const dayOfMonth = date.getDate();
  return `${dayOfMonth}`;
}

export function getTimeIn12HourFormat(time: string): string {
  const [hour, minute] = time.split(":").map(Number); // we don't care about seconds and milliseconds
  let period = "AM";
  let formattedHour = hour;

  if (hour >= 12) {
    period = "PM";
    if (hour > 12) {
      formattedHour = hour - 12;
    }
  } else if (hour === 0) {
    formattedHour = 12;
  }

  return `${formattedHour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")} ${period}`;
}

export function formatBusinessHours(hoursString: string) {
  const convertTo12HourFormat = (time: string) => {
    let [hour, minute] = time.split(":");
    const hourInt = parseInt(hour);
    const isPM = hourInt >= 12;
    const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12; // Converts "00" to "12" and handles noon/midnight
    return `${formattedHour}:${minute}${isPM ? "PM" : "AM"}`;
  };
  if (hoursString === "Closed") {
    return hoursString;
  }
  const times = hoursString.split("-").map(convertTo12HourFormat);
  return times.join("-");
}
