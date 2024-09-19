export const validateRegion = (value: string) => {
  if (value === "Select a region") {
    return "Please choose the region you're serving.";
  }
  return true;
};
