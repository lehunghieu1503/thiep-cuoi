# Template thiệp cưới online

Một giao diện dùng chung cho nhiều cặp đôi. Mỗi cặp chỉ cần một tệp `data.json` và thư mục ảnh; script build sẽ ghép lại thành **một tệp HTML duy nhất** (ảnh, QR, nhạc đã nhúng sẵn), mở trực tiếp hoặc đưa lên hosting nào cũng được.

Chỉ cần cài [Node.js](https://nodejs.org) (bản 16 trở lên), không cần cài thêm thư viện.

**Xem thiệp mẫu:** https://lehunghieu1503.github.io/thiep-cuoi/

## Cấu trúc

```
thiep-cuoi/
├── template.html        giao diện chung (sửa ở đây sẽ áp dụng cho mọi cặp)
├── build.js             script tạo thiệp
├── lib/amlich.js        đổi ngày dương sang âm lịch
├── apps-script/rsvp.gs  code dán vào Google Sheet để nhận xác nhận tham dự
├── couples/
│   └── mau/             cặp đôi mẫu
│       ├── data.json
│       └── photos/
└── dist/                thiệp đã tạo (sinh ra khi build)
    └── mau/index.html
```

## Làm thiệp cho một cặp mới

```bash
# 1. Tạo thư mục mới từ mẫu (tên chữ thường không dấu, nối bằng gạch ngang)
node build.js --new toan-linh

# 2. Sửa couples/toan-linh/data.json, bỏ ảnh vào couples/toan-linh/photos/

# 3. Tạo thiệp
node build.js toan-linh

# 4. Mở dist/toan-linh/index.html bằng trình duyệt để xem
```

Build lại tất cả cặp một lúc: `node build.js`

Nếu `data.json` điền sai (thiếu tên, sai định dạng ngày, tên ảnh không tồn tại…), build sẽ báo rõ lỗi ở trường nào.

## Các trường trong data.json

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `theme` | | Bảng màu: `do-son` (đỏ son, mặc định), `xanh-reu`, `hong-phan`, `xanh-navy` |
| `groom.name`, `bride.name` | ✓ | Tên chú rể, cô dâu |
| `groom.desc`, `bride.desc` | | Một dòng giới thiệu |
| `groom.photo`, `bride.photo` | | Ảnh chân dung (khung vòm) cạnh tên cô dâu, chú rể |
| `mainDate` | ✓ | Giờ lễ chính, dạng `"2026-12-20T09:00"`. Dùng cho trang bìa, lịch và đếm ngược |
| `cover` | | Ảnh bìa, ví dụ `"photos/cover.jpg"`. Không có thì hiện chữ Hỷ |
| `coverStyle` | | Kiểu ảnh bìa: `arch` (khung vòm, mặc định), `circle` (khung tròn), `full` (ảnh tràn toàn bộ nền trang bìa) |
| `seal` | | Ký tự trên con dấu khi không có ảnh bìa (mặc định `囍`) |
| `message` | | Lời mời dưới tiêu đề |
| `families.groom`, `families.bride` | | `father`, `mother`, `address` |
| `events[]` | | `title`, `datetime` (`"2026-12-19T11:00"`), `place`, `address`, `mapUrl` (tuỳ chọn, mặc định tìm theo địa chỉ trên Google Maps), `photo` (ảnh địa điểm, hiện ở đầu thẻ) |
| `story[]` | | `date`, `title`, `text`, `photo` (ảnh kỷ niệm kiểu ảnh lấy liền), `caption` (dòng chữ viết tay dưới ảnh) |
| `interludes[]` | | Dải ảnh tràn viền xen giữa các phần: `photo`, `text` (câu trích), `cite` (tên người nói), `after` (đặt sau phần nào, xem bên dưới) |
| `albumLayout` | | Kiểu album: `mosaic` (ghép mảng, mặc định), `grid` (lưới đều), `masonry` (xếp gạch, giữ tỉ lệ ảnh), `carousel` (trượt ngang) |
| `photos[]` | | Mỗi ảnh là đường dẫn `"photos/1.jpg"` hoặc `{ "src": "...", "caption": "...", "size": "big" \| "wide" \| "tall" }`. `size` chỉ dùng cho `mosaic` |
| `rsvp.deadline` | | Hạn xác nhận, ví dụ `"10/12/2026"` |
| `rsvp.endpoint` | | Link Apps Script (`https://script.google.com/macros/s/.../exec`) để lưu xác nhận vào Google Sheet. `"demo"`: form chạy thử, không lưu |
| `rsvp.showWishes` | | `true` (mặc định): hiện sổ lưu bút với các lời chúc khách đã gửi |
| `rsvp.link` | | Link Google Form (hoặc form khác). Chỉ dùng khi không có `endpoint` |
| `rsvp.contacts[]` | | `label`, `phone` |
| `gift` | | Một mã mừng cưới chung: `title` (mặc định "Quét mã để gửi quà mừng"), `bank`, `account`, `holder`, `qr` (ảnh mã QR ngân hàng) |
| `music` | | Tệp nhạc nền `.mp3`. Để trống `""` thì phát giai điệu hộp nhạc Canon in D dựng sẵn; `false` để tắt nhạc. Bản dựng sẵn có tiếng đàn hạc lướt lúc mở thiệp, dàn dây vào dần, tiếng vang như hội trường |
| `intro` | | `true` (mặc định): hiện phong bì, khách chạm con dấu để mở thiệp và bật nhạc. `false`: vào thẳng thiệp |
| `curtain` | | `true` (mặc định): sau phong bì là màn rèm nhung kéo ra, pháo giấy và pháo hoa. `false` để bỏ rèm |
| `petals` | | `true` (mặc định): cánh hoa rơi nhẹ. `false` để tắt |
| `thanks` | | Lời cảm ơn cuối thiệp |
| `footerPhoto` | | Ảnh nền phía sau lời cảm ơn |

## Chỗ đặt ảnh

Ngoài album, ảnh có thể đặt ở 7 chỗ, chỗ nào để trống thì thiệp tự bỏ qua:

1. **Bìa** (`cover` + `coverStyle`): khung vòm, khung tròn hoặc tràn nền (ảnh zoom chậm).
2. **Chân dung** (`groom.photo`, `bride.photo`): hai khung vòm cạnh nhau ở phần lời mời.
3. **Địa điểm** (`events[].photo`): ảnh nhà hàng/sảnh ở đầu thẻ sự kiện.
4. **Kỷ niệm** (`story[].photo`): ảnh lấy liền nghiêng nhẹ, dán băng keo, có chữ viết tay.
5. **Dải tràn viền** (`interludes[]`): ảnh rộng hết khung kèm câu trích, trôi chậm khi cuộn. `after` nhận: `loi-moi`, `ngay-cuoi`, `su-kien`, `chuyen-tinh`, `album`, `xac-nhan`, `mung-cuoi`.
6. **Album** (`photos` + `albumLayout`): 4 kiểu bố cục, ảnh có thể kèm chú thích.
7. **Cuối thiệp** (`footerPhoto`): ảnh nền phía sau lời cảm ơn.

Mọi ảnh đều bấm vào để xem lớn. Trong album có thể vuốt hoặc bấm mũi tên để chuyển ảnh.

**Tự động:** thứ trong tuần và ngày âm lịch (có can chi, tháng nhuận) được tính từ ngày dương, không cần điền tay.

**Hiệu ứng:** phong bì mở thiệp → rèm nhung kéo ra → pháo giấy bắn từ hai góc → pháo hoa. Trang bìa có tên ánh nhũ vàng hiện dần như viết tay, tia sáng xoay, vòng chữ "Trăm năm hạnh phúc" quay quanh ảnh bìa, hạt kim tuyến bay lên. Cánh hoa rơi, các phần hiện lên khi cuộn, số đếm ngược lật, chạm vào tên thì tim bay lên, cuối thiệp có nút bắn pháo hoa (và tự bắn khi khách cuộn tới). Máy khách bật chế độ "giảm chuyển động" thì các hiệu ứng tự tắt.

**Nhạc nền:** trình duyệt không cho web tự phát tiếng khi khách chưa chạm vào trang, nên nhạc bắt đầu đúng lúc khách chạm mở phong bì. Nhạc tự dừng khi khách chuyển tab và phát tiếp khi quay lại.

**Gửi đích danh từng khách:** thêm `?khach=` vào cuối link, ví dụ `https://.../index.html?khach=Anh%20Nam%20và%20gia%20đình`, phong bì sẽ hiện "Kính gửi Anh Nam và gia đình".

**Tự ẩn:** phần nào để trống (không có sự kiện, chuyện tình, ảnh, xác nhận, mừng cưới) sẽ tự ẩn khỏi thiệp.

## Lưu xác nhận tham dự vào Google Sheets

Khách điền form ngay trong thiệp (họ tên, có đến không, số người, khách của nhà nào, lời chúc). Mỗi phản hồi thành một dòng trong Google Sheet của cặp đôi. Làm một lần cho mỗi cặp, khoảng 5 phút:

1. Mở [sheets.new](https://sheets.new) để tạo Google Sheet mới, đặt tên ví dụ "Khách mời A & B".
2. Menu **Tiện ích mở rộng → Apps Script** (Extensions → Apps Script). Xoá code có sẵn, dán toàn bộ nội dung `apps-script/rsvp.gs`, bấm **Lưu**.
3. Bấm **Triển khai → Tùy chọn triển khai mới** (Deploy → New deployment), chọn loại **Ứng dụng web** (Web app):
   - Thực thi với tư cách (Execute as): **Tôi**
   - Người có quyền truy cập (Who has access): **Bất kỳ ai** (Anyone)
4. Bấm **Triển khai**, cấp quyền cho tài khoản Google của bạn (Google sẽ cảnh báo "ứng dụng chưa được xác minh" vì script do bạn tự viết: chọn Nâng cao → Đi tới...).
5. Sao chép **URL ứng dụng web** (kết thúc bằng `/exec`), dán vào `rsvp.endpoint` trong `data.json`, chạy `node build.js`.

Phản hồi đầu tiên sẽ tự tạo trang tính "Phản hồi" với các cột: Thời gian, Họ tên, Tham dự, Số người, Khách của, Lời chúc, Link mời (lấy từ `?khach=`).

- **Đếm tổng khách sẽ đến:** thêm một ô `=SUMIF(C:C;"Có";D:D)` (dòng "5+" cần sửa tay thành số).
- **Sửa code Apps Script sau khi đã triển khai:** Triển khai → Quản lý bản triển khai → biểu tượng bút → Phiên bản: Mới. Làm vậy thì URL giữ nguyên.
- **Riêng tư:** sổ lưu bút chỉ hiện công khai tên và lời chúc. Thông tin có đến hay không, số người và link mời chỉ nằm trong Sheet.
- **Chống spam:** form có một ô ẩn mà người thật không thấy; phản hồi nào điền vào ô đó sẽ bị bỏ qua.
- **Khách gửi lại:** trên cùng một máy, thiệp nhớ là khách đã gửi và hiện lời cảm ơn, kèm nút "Sửa phản hồi". Mỗi lần gửi lại là một dòng mới, dòng mới nhất là phản hồi cuối cùng.

## GitHub và GitHub Pages

Mỗi lần push lên nhánh `main`, GitHub Actions (`.github/workflows/pages.yml`) sẽ chạy `node build.js` và đăng các thiệp trong `couples/` lên GitHub Pages, tại `https://lehunghieu1503.github.io/thiep-cuoi/<ten-cap-doi>/`.

Repo để công khai, nên `.gitignore` giữ những thứ sau ở lại trên máy:

- `dist/`: thiệp đã build, luôn tạo lại được.
- `couples/*/nhac/`: nhạc có bản quyền. Trên GitHub Pages, thiệp mẫu tự dùng giai điệu Canon dựng sẵn.
- Mọi thư mục cặp đôi, trừ `couples/mau/`: dữ liệu thật (tên, địa chỉ, số tài khoản, ảnh) không lên repo.

Xác nhận tham dự của khách không nằm trong repo mà lưu trong Google Sheet của từng cặp (xem mục trên).

**Đăng thiệp của một cặp thật:** build trên máy (`node build.js ten-cap-doi`), rồi tải `dist/ten-cap-doi/index.html` lên Netlify Drop hoặc hosting bất kỳ. Nếu muốn đăng lên chính GitHub Pages này, thêm dòng `!couples/ten-cap-doi/` vào `.gitignore` rồi push. Làm vậy thì toàn bộ dữ liệu của cặp đó sẽ công khai trong repo.

## Lưu ý

- **Nhạc riêng:** bỏ tệp `.mp3` vào thư mục của cặp đôi (ví dụ `couples/mau/nhac/beautiful-in-white.mp3`) và điền đường dẫn vào `music`. Chưa có tệp thì build chỉ cảnh báo và tạm dùng giai điệu dựng sẵn. Bài hát có bản quyền nên dùng tệp bạn đã mua hoặc được phép sử dụng.
- **Dung lượng:** ảnh và nhạc được nhúng thẳng vào HTML. Nên nén ảnh về khoảng 1600px, dưới 300 KB mỗi ảnh (ví dụ bằng squoosh.app). Build sẽ cảnh báo khi tệp vượt 15 MB.
- **Xác nhận tham dự:** thiệp là trang tĩnh nên không tự lưu phản hồi. Cách đơn giản nhất là tạo một Google Form và dán link vào `rsvp.link`.
- **Đưa lên mạng:** tải `dist/<ten-cap-doi>/index.html` lên Netlify Drop (app.netlify.com/drop), GitHub Pages, Vercel… rồi gửi link cho khách.
- **Đổi giao diện chung:** sửa `template.html`, sau đó chạy lại `node build.js` để cập nhật mọi thiệp.
