export function formatPhoneNumber(phoneNumber) {
  const cleaned = removeNonDigits(phoneNumber);

  if (cleaned.length <= 4) {
    return formatCountryCode(cleaned);
  } else if (cleaned.length <= 7) {
    return formatCountryAndAreaCode(cleaned);
  } else if (cleaned.length <= 10) {
    return formatFirstTenDigits(cleaned);
  } else {
    // format the whole thing
    return formatFullNumber(cleaned);
  }
}

export function AWSFormatPhoneNumberWithDefaultCountryCode(phoneNumber) {
  if (!phoneNumber) return ""; // Handle null or undefined input

  // Remove non-digit characters but keep leading '+'
  const cleanedPhoneNumber = phoneNumber.replace(/[^\d+]/g, "");

  // Check if the phone number starts with a '+'
  const hasCountryCode = cleanedPhoneNumber.startsWith("+");

  if (hasCountryCode) {
    // If it has a country code, return the cleaned number as is
    return cleanedPhoneNumber;
  } else {
    // If no country code, prepend '+1' for US
    return `+1${cleanedPhoneNumber}`;
  }
}

function removeNonDigits(str) {
  return str.replace(/\D/g, "");
}

function formatCountryCode(digits) {
  return `+${digits}`;
}

function formatCountryAndAreaCode(digits) {
  return `+${digits.slice(0, 1)} (${digits.slice(1, 4)})`;
}

function formatFirstTenDigits(digits) {
  return `+${digits.slice(0, 1)} (${digits.slice(1, 4)})-${digits.slice(4, 7)}`;
}

function formatFullNumber(digits) {
  // Truncate the digits to the first 14 if there are more than 14 digits
  const truncatedDigits = digits.slice(0, 14);
  return `+${truncatedDigits.slice(0, 1)} (${truncatedDigits.slice(
    1,
    4,
  )}) ${truncatedDigits.slice(4, 7)}-${truncatedDigits.slice(7)}`;
}
