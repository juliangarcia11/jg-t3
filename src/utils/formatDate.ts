const baseFormat = {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
} as const;

const shortFormat = {
  minute: "2-digit",
  hour: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  timeZone: "UTC",
} as const;

enum DateFormat {
  Base,
  Short,
}

/**
 * Turn a `Date` object into a formatted `string`.
 * Useful for converting from DB times to user presentable formats.
 *
 * @return string The date item as a string formatted as desired
 * @param date
 * @param format
 */
export function formatDateToString(
  date: Date,
  format: DateFormat = DateFormat.Short
) {
  return date.toLocaleDateString(
    "en-US",
    format === DateFormat.Short ? shortFormat : baseFormat
  );
}
