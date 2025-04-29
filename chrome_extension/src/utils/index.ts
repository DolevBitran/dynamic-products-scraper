export const cn = (...inputs: (string | undefined | null | false)[]): string => {
  return inputs
    .filter(Boolean)    // Remove false, null, undefined, empty
    .join(' ')          // Join remaining strings with space
    .replace(/\s+/g, ' ') // Clean extra spaces
    .trim();            // Remove leading/trailing spaces
}