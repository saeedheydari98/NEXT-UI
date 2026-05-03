const normalizeDigits = value => value
  .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x06f0))
  .replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660));

const samples = ['۱۴۰۱-۱۰-۱۱','۱۴۰۱/۱۰/۱۱','1401-10-11','1401/10/11','۱۴۰۱۱۰۱۱'];
for (const s of samples) {
  let normalized = normalizeDigits(String(s));
  normalized = normalized.replace(/[\u200c\u200f\u200e]/g, '');
  normalized = normalized.replace(/[\u2212–—−]/g, '-');
  normalized = normalized.replace(/[^0-9\-/]/g, '-');
  normalized = normalized.replace(/[\/]+/g, '-');
  normalized = normalized.replace(/-+/g, '-').replace(/^-|-$/g, '');
  console.log(s, '=>', normalized, normalized.split('-'));
}
