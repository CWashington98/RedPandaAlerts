export const validatePassword = (value: string) => {
  const errors = [];

  if (!/[A-Z]/.test(value)) {
    errors.push("an uppercase letter");
  }

  if (!/[0-9]/.test(value)) {
    errors.push("a number");
  }

  if (!/[#?!@$%^&*-]/.test(value)) {
    errors.push("a special character");
  }
  if (value.length < 8) {
    errors.push("at least 8 characters");
  }
  return errors.length > 0
    ? `Password must contain ${errors.join(", ")}.`
    : true;
};
