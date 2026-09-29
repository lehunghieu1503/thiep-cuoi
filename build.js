#!/usr/bin/env node
/*
 * Tạo thiệp cưới từ template.html + couples/<ten-cap-doi>/data.json
 *
 *   node build.js                 build tất cả cặp đôi trong couples/
 *   node build.js khoi-ha         build một (hoặc vài) cặp đôi
 *   node build.js --new ten-moi   tạo thư mục cặp đôi mới từ mẫu couples/mau
 *
 * Kết quả: dist/<ten-cap-doi>/index.html — một file duy nhất, ảnh/nhạc/QR đã nhúng sẵn.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const COUPLES = path.join(ROOT, "couples");
const DIST = path.join(ROOT, "dist");
const SAMPLE = "mau";
const PALETTES = ["do-son", "xanh-reu", "hong-phan", "xanh-navy"];
const MIME = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav",
};
const COVER_STYLES = ["arch", "circle", "full"];
const ALBUM_LAYOUTS = ["grid", "mosaic", "masonry", "carousel"];
const PHOTO_SIZES = ["big", "wide", "tall"];
const INTERLUDE_AFTER = ["loi-moi", "ngay-cuoi", "su-kien", "chuyen-tinh", "album", "xac-nhan", "mung-cuoi"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?$/;

class BuildError extends Error {}

function embed(dir, ref, field) {
  if (!ref) return ref;
  if (/^(https?:|data:)/.test(ref)) return ref;
  const file = path.resolve(dir, ref);
  if (!fs.existsSync(file)) throw new BuildError(`${field}: không tìm thấy tệp "${ref}"`);
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) throw new BuildError(`${field}: không hỗ trợ định dạng "${path.extname(file)}"`);
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

function validate(d) {
  const errs = [];
  if (!d.groom?.name) errs.push("thiếu groom.name (tên chú rể)");
  if (!d.bride?.name) errs.push("thiếu bride.name (tên cô dâu)");
  if (!DATE_RE.test(d.mainDate || "")) errs.push(`mainDate phải có dạng "2026-12-20T09:00" (đang là: ${JSON.stringify(d.mainDate)})`);
  if (d.theme && !PALETTES.includes(d.theme)) errs.push(`theme "${d.theme}" không có; chọn một trong: ${PALETTES.join(", ")}`);
  if (d.coverStyle && !COVER_STYLES.includes(d.coverStyle)) errs.push(`coverStyle "${d.coverStyle}" không có; chọn một trong: ${COVER_STYLES.join(", ")}`);
  if (d.albumLayout && !ALBUM_LAYOUTS.includes(d.albumLayout)) errs.push(`albumLayout "${d.albumLayout}" không có; chọn một trong: ${ALBUM_LAYOUTS.join(", ")}`);
  (d.photos || []).forEach((p, i) => {
    if (typeof p === "object" && p.size && !PHOTO_SIZES.includes(p.size)) errs.push(`photos[${i}].size "${p.size}" không có; chọn một trong: ${PHOTO_SIZES.join(", ")}`);
  });
  (d.interludes || []).forEach((it, i) => {
    if (it.after && !INTERLUDE_AFTER.includes(it.after)) errs.push(`interludes[${i}].after "${it.after}" không có; chọn một trong: ${INTERLUDE_AFTER.join(", ")}`);
  });
  (d.events || []).forEach((e, i) => {
    if (!e.title) errs.push(`events[${i}] thiếu title`);
    if (!DATE_RE.test(e.datetime || "")) errs.push(`events[${i}].datetime phải có dạng "2026-12-20T11:00"`);
  });
  if (errs.length) throw new BuildError(errs.map((e) => "  - " + e).join("\n"));
}

const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// JSON an toàn khi đặt trong thẻ <script>
const safeJson = (o) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

function build(slug) {
  const dir = path.join(COUPLES, slug);
  const dataFile = path.join(dir, "data.json");
  if (!fs.existsSync(dataFile)) throw new BuildError(`không có tệp ${path.relative(ROOT, dataFile)}`);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (e) {
    throw new BuildError(`data.json sai cú pháp JSON: ${e.message}`);
  }
  validate(data);

  // Chưa có tệp nhạc thì cảnh báo và dùng giai điệu dựng sẵn, không dừng build
  if (data.music && !/^(https?:|data:)/.test(data.music) && !fs.existsSync(path.resolve(dir, data.music))) {
    console.warn(`  ⚠ ${slug}: chưa có tệp nhạc "${data.music}", tạm dùng giai điệu Canon in D dựng sẵn`);
    data.music = "";
  }
  data.cover = embed(dir, data.cover, "cover");
  data.music = embed(dir, data.music, "music");
  data.footerPhoto = embed(dir, data.footerPhoto, "footerPhoto");
  data.groom = { ...data.groom, photo: embed(dir, data.groom.photo, "groom.photo") };
  data.bride = { ...data.bride, photo: embed(dir, data.bride.photo, "bride.photo") };
  data.photos = (data.photos || []).map((p, i) => typeof p === "string"
    ? { src: embed(dir, p, `photos[${i}]`) }
    : { ...p, src: embed(dir, p.src, `photos[${i}].src`) });
  data.events = (data.events || []).map((e, i) => ({ ...e, photo: embed(dir, e.photo, `events[${i}].photo`) }));
  data.story = (data.story || []).map((s, i) => ({ ...s, photo: embed(dir, s.photo, `story[${i}].photo`) }));
  data.interludes = (data.interludes || []).map((it, i) => ({ ...it, photo: embed(dir, it.photo, `interludes[${i}].photo`) }));
  data.gifts = (data.gifts || []).map((g, i) => ({ ...g, qr: embed(dir, g.qr, `gifts[${i}].qr`) }));
  if (data.gift) data.gift = { ...data.gift, qr: embed(dir, data.gift.qr, "gift.qr") };

  const [y, m, d] = data.mainDate.slice(0, 10).split("-");
  const title = `Thiệp cưới ${data.groom.name} & ${data.bride.name}`;
  const description = `Trân trọng kính mời bạn đến dự lễ thành hôn của ${data.groom.name} và ${data.bride.name} ngày ${d}/${m}/${y}.`;
  const amlich = fs.readFileSync(path.join(ROOT, "lib", "amlich.js"), "utf8");

  // Dùng hàm thay thế để ký tự "$" trong dữ liệu không bị hiểu nhầm là mẫu thay thế
  const html = fs.readFileSync(path.join(ROOT, "template.html"), "utf8")
    .replaceAll("{{TITLE}}", () => escHtml(title))
    .replaceAll("{{DESCRIPTION}}", () => escHtml(description))
    .replace("{{PALETTE}}", () => data.theme || "do-son")
    .replace("/*@include lib/amlich.js*/", () => amlich)
    .replace("/*@data*/null", () => safeJson(data));

  const outDir = path.join(DIST, slug);
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, "index.html");
  fs.writeFileSync(out, html);

  const mb = Buffer.byteLength(html) / 1024 / 1024;
  const warn = mb > 15 ? "  ⚠ tệp lớn, nên nén ảnh/nhạc nhỏ lại" : "";
  console.log(`✓ ${slug} → ${path.relative(ROOT, out)} (${mb.toFixed(2)} MB)${warn}`);
}

function scaffold(slug) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new BuildError("tên thư mục chỉ dùng chữ thường không dấu, số và dấu gạch ngang, ví dụ: toan-linh");
  const dir = path.join(COUPLES, slug);
  if (fs.existsSync(dir)) throw new BuildError(`thư mục couples/${slug} đã tồn tại`);
  fs.mkdirSync(path.join(dir, "photos"), { recursive: true });
  const sample = JSON.parse(fs.readFileSync(path.join(COUPLES, SAMPLE, "data.json"), "utf8"));
  // Bỏ các tệp của cặp mẫu, giữ lại cấu trúc để điền
  sample.cover = "";
  sample.footerPhoto = "";
  sample.groom = { ...sample.groom, photo: "" };
  sample.bride = { ...sample.bride, photo: "" };
  sample.events = (sample.events || []).map((e) => ({ ...e, photo: "" }));
  sample.story = (sample.story || []).map((s) => ({ ...s, photo: "" }));
  sample.interludes = (sample.interludes || []).map((it) => ({ ...it, photo: "" }));
  sample.photos = [];
  sample.music = "";
  sample.gifts = (sample.gifts || []).map((g) => ({ ...g, qr: "" }));
  if (sample.gift) sample.gift = { ...sample.gift, qr: "" };
  fs.writeFileSync(path.join(dir, "data.json"), JSON.stringify(sample, null, 2) + "\n");
  console.log(`✓ Đã tạo couples/${slug}/data.json và couples/${slug}/photos/`);
  console.log(`  Sửa data.json, bỏ ảnh vào photos/, rồi chạy: node build.js ${slug}`);
}

// Tệp dùng chung cho mọi nơi đăng thiệp (GitHub Pages, Cloudflare Pages…)
function writeSiteFiles() {
  if (!fs.existsSync(DIST)) return;
  // Trang chủ: chuyển tới thiệp mẫu, không liệt kê các cặp đôi khác
  fs.writeFileSync(path.join(DIST, "index.html"), `<!doctype html>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${SAMPLE}/">
<title>Thiệp cưới</title>
<a href="${SAMPLE}/">Xem thiệp mẫu</a>
`);
  // Cloudflare Pages: không cho công cụ tìm kiếm lập chỉ mục thiệp
  fs.writeFileSync(path.join(DIST, "_headers"), "/*\n  X-Robots-Tag: noindex, nofollow\n");
}

function main() {
  const args = process.argv.slice(2);
  try {
    if (args[0] === "--new") {
      if (!args[1]) throw new BuildError("cần tên thư mục, ví dụ: node build.js --new toan-linh");
      return scaffold(args[1]);
    }
    const slugs = args.length ? args : fs.readdirSync(COUPLES).filter((f) => fs.existsSync(path.join(COUPLES, f, "data.json")));
    let failed = 0;
    for (const slug of slugs) {
      try {
        build(slug);
      } catch (e) {
        if (!(e instanceof BuildError)) throw e;
        failed++;
        console.error(`✗ ${slug}:\n${e.message.startsWith("  -") ? e.message : "  " + e.message}`);
      }
    }
    writeSiteFiles();
    process.exitCode = failed ? 1 : 0;
  } catch (e) {
    if (!(e instanceof BuildError)) throw e;
    console.error("✗ " + e.message);
    process.exitCode = 1;
  }
}

main();
