export function toUpperCase(string) {
  return string.replace(/^\D/i, match => match.toUpperCase());
}
