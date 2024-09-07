export function preprocessStockData(input: string): string {
  // Split the input into lines and remove empty lines
  const lines = input.split('\n').filter(line => line.trim() !== '');
  
  // Clean each line: remove extra spaces and trim
  const cleanedLines = lines.map(line => 
    line.replace(/\s+/g, ' ').trim()
  );

  // Join the cleaned lines back into a single string
  return cleanedLines.join('\n');
}