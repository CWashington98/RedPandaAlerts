export function formatPhoneNumber(phoneNumber: string | null | undefined) {
  var cleaned = ("" + phoneNumber).replace(/\D/g, "");
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    var intlCode = match[1] ? "+1 " : "";
    return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
  }
  return null;
}

export function AWSFormatPhoneNumberWithDefaultCountryCode(
  phoneNumber: string | null | undefined,
): string {
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
