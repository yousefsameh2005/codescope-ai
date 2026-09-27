export function isZip(file) {
  return Boolean(file?.name?.toLowerCase().endsWith(".zip"));
}

export function isDocumentation(file) {
  return Boolean(file?.name?.toLowerCase().endsWith(".pdf"));
}

export function formatFileSize(bytes = 0) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index ? 1 : 0)} ${units[index]}`;
}