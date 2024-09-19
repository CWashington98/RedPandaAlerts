export const validateName = (value: string) => {
  const nameRegex = /.*[A-Za-z0-9].*/;
  if (!value) {
    return "Please enter your name";
  } else if (!nameRegex.test(value)) {
    return "Name should contain at least one letter or number";
  } else {
    return true;
  }
};
