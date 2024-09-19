export const validateEmail = (value: string) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z.]{2,}$/i;
  if (!emailRegex.test(value)) {
    return "Please enter a valid email address";
  } else {
    return true;
  }
};
