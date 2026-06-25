export function toDateInputValue(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDateInput(input: string, options: { min?: string; max?: string } = {}) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const compactMatch = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);
  const separatedMatch = trimmed.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?$/);
  const match = compactMatch ?? separatedMatch;
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  const normalized = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (options.min && normalized < options.min) return null;
  if (options.max && normalized > options.max) return null;
  return normalized;
}

