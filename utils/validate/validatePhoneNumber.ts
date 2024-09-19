import parsePhoneNumberFromString from "libphonenumber-js";

export const validatePhoneNumber = (value: string | undefined) => {
  if (!value) {
    return "Please enter your phone number";
  }

  const phoneNumber = parsePhoneNumberFromString(value);
  if (!phoneNumber) {
    return "Please enter a valid phone number";
  }

  if (!phoneNumber.isValid()) {
    return "Please enter a valid phone number";
  }

  return true;
};
