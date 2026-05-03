// app/api/convert/route.ts
import { NextResponse } from "next/server";
import { toJalaali, toGregorian } from "jalaali-js";
import { toHijri, toGregorian as hijriToGregorian } from "hijri-converter";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 0x30))
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30));
}

export async function POST(req: Request) {
  const { date, from, to } = await req.json();
  
  console.log("=== DEBUG ===");
  console.log("Received date:", date);
  console.log("From:", from);
  console.log("To:", to);

  const formatDateValue = (value: unknown) => {
    if (value && typeof value === "object") {
      const typed = value as { year?: number | string; month?: number | string; day?: number | string };
      const year = typed.year !== undefined ? String(typed.year).trim() : undefined;
      const month = typed.month !== undefined ? String(typed.month).trim() : undefined;
      const day = typed.day !== undefined ? String(typed.day).trim() : undefined;

      if (year && month && day) {
        return `${normalizeDigits(year).padStart(4, "0")}-${normalizeDigits(month).padStart(2, "0")}-${normalizeDigits(day).padStart(2, "0")}`;
      }
    }

    return normalizeDigits(String(value));
  };

  // جدا کردن سال ماه روز
  let normalizedDate = formatDateValue(date);
  normalizedDate = normalizedDate.replace(/[\u200c\u200f\u200e]/g, "");
  normalizedDate = normalizedDate.replace(/[\u2212–—−]/g, "-");
  normalizedDate = normalizedDate.replace(/[^0-9\-/]/g, "-");
  normalizedDate = normalizedDate.replace(/[\/]+/g, "-");
  normalizedDate = normalizedDate.replace(/-+/g, "-").replace(/^-|-$/g, "");
  console.log("Normalized date:", normalizedDate);

  const matchedDate = normalizedDate.match(/(\d{2,4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!matchedDate) {
    return NextResponse.json({ error: "فرمت تاریخ نامعتبر است" }, { status: 400 });
  }

  const year = Number(matchedDate[1]);
  const month = Number(matchedDate[2]);
  const day = Number(matchedDate[3]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return NextResponse.json({ error: "فرمت تاریخ نامعتبر است" }, { status: 400 });
  }

  console.log("Parsed:", { year, month, day });

  let result = "";

  try {
    if (from === to) {
      result = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    // 1. میلادی به شمسی
    else if (from === "gregorian" && to === "persian") {
      const jalaali = toJalaali(year, month, day);
      result = `${jalaali.jy}-${String(jalaali.jm).padStart(2, '0')}-${String(jalaali.jd).padStart(2, '0')}`;
    }
    
    // 2. شمسی به میلادی
    else if (from === "persian" && to === "gregorian") {
      const gregorian = toGregorian(year, month, day);
      result = `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}`;
    }
    
    // 3. میلادی به قمری
    else if (from === "gregorian" && to === "arabic") {
      const hijri = toHijri(year, month, day);
      result = `${hijri.hy}-${String(hijri.hm).padStart(2, '0')}-${String(hijri.hd).padStart(2, '0')}`;
    }
    
    // 4. قمری به میلادی
    else if (from === "arabic" && to === "gregorian") {
      const gregorian = hijriToGregorian(year, month, day);
      result = `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}`;
    }
    
    // 5. شمسی به قمری
    else if (from === "persian" && to === "arabic") {
      const gregorian = toGregorian(year, month, day);
      console.log("Persian to Gregorian intermediate:", gregorian);
      const hijri = toHijri(gregorian.gy, gregorian.gm, gregorian.gd);
      result = `${hijri.hy}-${String(hijri.hm).padStart(2, '0')}-${String(hijri.hd).padStart(2, '0')}`;
      console.log("Gregorian to Hijri:", result);
    }
    
    // 6. قمری به شمسی
    else if (from === "arabic" && to === "persian") {
      const gregorian = hijriToGregorian(year, month, day);
      const jalaali = toJalaali(gregorian.gy, gregorian.gm, gregorian.gd);
      result = `${jalaali.jy}-${String(jalaali.jm).padStart(2, '0')}-${String(jalaali.jd).padStart(2, '0')}`;
    }
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json({ error: "خطا در تبدیل تاریخ" }, { status: 400 });
  }

  console.log("Result:", result);
  
  if (!result) {
    return NextResponse.json({ error: "تبدیل انجام نشد" }, { status: 400 });
  }
  
  return NextResponse.json({ result });
}
