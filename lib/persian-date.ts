const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = ARABIC_DIGITS.indexOf(digit);
    return arabicIndex >= 0 ? String(arabicIndex) : digit;
  });
}

export function normalizePersianDate(value: string) {
  const normalized = toEnglishDigits(value.trim()).replace(/-/g, "/");
  const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return normalized;

  const [, year, month, day] = match;
  return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
}

function div(a: number, b: number) {
  return Math.trunc(a / b);
}

function jalaliToGregorian(jy: number, jm: number, jd: number) {
  jy += 1595;
  let days = -355668 + 365 * jy + div(jy, 33) * 8 + div((jy % 33) + 3, 4) + jd;
  days += jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;
  let gy = 400 * div(days, 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }

  const gd = days + 1;
  const salA = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  let day = gd;
  for (gm = 1; gm <= 12 && day > salA[gm]; gm++) {
    day -= salA[gm];
  }

  return { gy, gm, gd: day };
}

export function persianDateToTime(value: string) {
  const normalized = normalizePersianDate(value);
  const match = normalized.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return NaN;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return NaN;
  if (year < 1200 || year > 1500 || month < 1 || month > 12) return NaN;

  const maxDay = month <= 6 ? 31 : month <= 11 ? 30 : 29;
  if (day < 1 || day > maxDay) return NaN;

  const gregorian = jalaliToGregorian(year, month, day);
  return Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd);
}

export function isValidPastPersianDate(value: string) {
  const time = persianDateToTime(value);
  return Number.isFinite(time) && time <= Date.now();
}
