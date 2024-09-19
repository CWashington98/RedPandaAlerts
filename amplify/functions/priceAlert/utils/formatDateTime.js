import { utcToZonedTime, format } from "date-fns-tz";

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

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}
function createDate(dateInput) {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  // Try parsing with Date constructor
  let date = new Date(dateInput);
  if (isValidDate(date)) {
    return date;
  }
  // If parsing fails, append 'Z' to interpret as UTC
  if (!dateInput.endsWith("Z")) {
    dateInput += "Z";
    date = new Date(dateInput);
  }
  return date;
}

export function formatDate(dateInput) {
  const date = createDate(dateInput);
  if (!isValidDate(date)) {
    return "Invalid Date";
  }
  return format(date, "MM/dd/yyyy");
}
export function AWSFormatDate(dateInput) {
  const date = createDate(dateInput);

  if (!isValidDate(date)) {
    return "Invalid Date";
  }

  return format(date, "yyyy-MM-dd");
}
export function AWSFormatDateTime(dateInput) {
  let date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = createDate(dateInput);
  }

  if (!isValidDate(date)) {
    return "Invalid Date";
  }

  const zonedDate = utcToZonedTime(date, timeZone);
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone });
}

export function formatUSStandardDateTime(
  dateInput,
  timeZone = "America/New_York",
) {
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = createDate(dateInput);
  }

  if (!isValidDate(date)) {
    return "Invalid Date";
  }

  const zonedDate = utcToZonedTime(date, timeZone);
  return format(zonedDate, "MM/dd/yyyy, hh:mm aa");
}

export function formatExtendedUSDate(dateInput, includeTime = null) {
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = createDate(dateInput);
  }
  const zonedDate = utcToZonedTime(date, timeZone);
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

export function getEventFormatDate(awsDate) {
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

export function getDayofWeek(awsDate) {
  const date = utcToZonedTime(createDate(awsDate), timeZone);
  const dayOfWeek = daysOfWeek[date.getDay()];
  return `${dayOfWeek}`;
}

export function getMonth(awsDate) {
  const date = utcToZonedTime(createDate(awsDate), timeZone);
  const month = months[date.getMonth()];
  return `${month}`;
}

export function getDayOfMonth(awsDate) {
  const date = utcToZonedTime(createDate(awsDate), timeZone);
  const dayOfMonth = date.getDate();
  return `${dayOfMonth}`;
}

export function getTimeIn12HourFormat(time) {
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
