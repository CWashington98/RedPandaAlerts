export function convertToCapitalCase(text) {
  // Convert underscores to spaces and make all lowercase
  let lowercaseWithSpaces = text.replace(/_/g, " ").toLowerCase();
  // Convert first character of each word to uppercase
  let capitalCase = lowercaseWithSpaces.replace(/\b\w/g, function (l) {
    return l.toUpperCase();
  });
  return capitalCase;
}
