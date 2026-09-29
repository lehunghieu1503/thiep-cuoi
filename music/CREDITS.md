# Nhạc miễn phí dùng được trong thiệp

Các tệp trong thư mục này được phép đưa lên repo công khai và dùng trong thiệp. Cả hai đã được nén lại ở 96 kbps để thiệp nhẹ hơn; ngoài việc nén, nội dung giữ nguyên.

## canon-in-d-kevin-macleod.mp3

- **Tác phẩm:** Canon in D Major (Johann Pachelbel), 3 violin và đàn hạc
- **Trình bày:** Kevin MacLeod ([incompetech.com](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100301))
- **Giấy phép:** [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/). Được dùng miễn phí, **bắt buộc ghi tên tác giả**. Thiệp tự hiện dòng ghi công ở cuối trang khi điền `musicCredit`.
- **Nguồn:** [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Canon_in_D_Major_(ISRC_USUAN1100301).mp3)
- **Độ dài:** 4:24

Ghi công mẫu:

> "Canon in D Major" – Kevin MacLeod (incompetech.com). Giấy phép CC BY 3.0.

## air-on-the-g-string-usaf.mp3

- **Tác phẩm:** Air on the G String, Orchestral Suite No. 3, BWV 1068 (Johann Sebastian Bach)
- **Trình bày:** Air Force Strings, United States Air Force Band
- **Giấy phép:** Phạm vi công cộng (tác phẩm của chính phủ Hoa Kỳ). Không cần ghi tên, dù ghi thì vẫn tốt.
- **Nguồn:** [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Air_-_Air_Force_Strings_-_United_States_Air_Force_Band.mp3), gốc từ [USAF Band – Public Domain Music](https://www.music.af.mil/Multimedia/Music/Public-Domain-Music/)
- **Độ dài:** 3:03

## Cách dùng

Trong `couples/<ten-cap-doi>/data.json` (đường dẫn tính từ thư mục cặp đôi):

```json
"music": "../../music/canon-in-d-kevin-macleod.mp3",
"musicCredit": {
  "text": "Nhạc nền: \"Canon in D Major\" – Kevin MacLeod (incompetech.com) · CC BY 3.0",
  "url": "https://creativecommons.org/licenses/by/3.0/"
}
```

Muốn thêm bài khác vào đây, chỉ dùng bài có giấy phép cho phép chia sẻ công khai (phạm vi công cộng, CC0, CC BY…), và ghi nguồn vào tệp này.
