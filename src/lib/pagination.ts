export function ParseOffset(value: string | undefined, maximum = 10_000): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return 0;
  }

  return Math.min(parsed, maximum);
}
