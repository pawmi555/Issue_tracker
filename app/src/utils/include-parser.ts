export const parseInclude = (include?: string) => {
  if (!include) {
    return [];
  }

  return include
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};
