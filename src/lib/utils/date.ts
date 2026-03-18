// Helper to parse DD-MM-YYYY date strings
export function parseDDMMYYYYString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to parse YYYY-MM-DD date strings
export function parseYYYYMMDDString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to format Date object to YYYY-MM-DD string
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const toJSDate = (date: any): Date => {
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  return date;
};

/**
 * Returns the Indian fiscal year for a given date.
 * E.g., for 15 May 2023, returns "2023-24"
 * E.g., for 10 Feb 2024, returns "2023-24"
 */
export function getFiscalYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, 0 = Jan, 3 = Apr

  if (month < 3) {
    // Jan, Feb, Mar belong to previous calendar year's fiscal year
    return `${year - 1}-${year.toString().slice(-2)}`;
  } else {
    // Apr to Dec belong to current calendar year's fiscal year
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
}

/**
 * Returns the start and end dates for a given fiscal year string (e.g., "2023-24").
 */
export function getFiscalYearRange(fiscalYear: string): { start: Date; end: Date } {
  const [startYearStr] = fiscalYear.split('-');
  const startYear = parseInt(startYearStr, 10);
  const endYear = startYear + 1;

  return {
    start: new Date(startYear, 3, 1), // April 1st
    end: new Date(endYear, 2, 31, 23, 59, 59, 999), // March 31st
  };
}

/**
 * Returns the current fiscal year string.
 */
export function getCurrentFiscalYear(): string {
  return getFiscalYear(new Date());
}
