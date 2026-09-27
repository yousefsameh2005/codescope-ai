export function repositoryInitials(name = "") {
  return name
    .split(/[\s-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function repositoryStatus(repository) {
  return repository?.status || "ready";
}