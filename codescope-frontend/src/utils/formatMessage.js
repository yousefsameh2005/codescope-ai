export function formatMessage(text = "") {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}