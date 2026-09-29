/**
 * Nhận xác nhận tham dự từ thiệp cưới và lưu vào Google Sheet.
 * Cách cài: xem mục "Lưu xác nhận tham dự vào Google Sheets" trong README.md.
 *
 *   POST  (form trong thiệp)  → thêm một dòng vào trang "Phản hồi"
 *   GET   ?action=wishes      → trả về 50 lời chúc mới nhất cho sổ lưu bút
 */
const SHEET_NAME = "Phản hồi";
const HEADERS = ["Thời gian", "Họ tên", "Tham dự", "Số người", "Khách của", "Lời chúc", "Link mời"];

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Ô ẩn trong form: người thật không thấy, máy spam hay điền vào
  if (p.website) return json_({ ok: true });

  const name = clean_(p.name, 100);
  if (!name) return json_({ ok: false, error: "Thiếu họ tên" });
  const attending = p.attend !== "no";

  // Khóa để hai khách gửi cùng lúc không ghi đè dòng của nhau
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([
      new Date(),
      name,
      attending ? "Có" : "Không",
      attending ? clean_(p.count, 5) : 0,
      clean_(p.side, 20),
      clean_(p.msg, 500),
      clean_(p.khach, 100),
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== "wishes") return json_({ ok: true });
  // Chỉ trả tên và lời chúc, không trả thông tin tham dự hay link mời
  const rows = sheet_().getDataRange().getValues().slice(1);
  const wishes = rows
    .filter((r) => String(r[5]).trim())
    .slice(-50)
    .reverse()
    .map((r) => ({ name: String(r[1]), msg: String(r[5]) }));
  return json_({ ok: true, wishes });
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Cắt độ dài và chặn nội dung bắt đầu bằng = + - @ để Sheet không hiểu nhầm thành công thức
function clean_(v, max) {
  const s = String(v == null ? "" : v).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
