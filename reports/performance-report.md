# Báo cáo tối ưu hiệu năng

## Cấu hình đo

- Lighthouse CLI, chỉ số Performance, chế độ Mobile.
- Đo bản production trên Chrome tại `http://127.0.0.1:4173/`.
- Baseline stress và bản sau tối ưu dùng cùng trang danh sách 10.000 sản phẩm.
- Báo cáo Lighthouse đầy đủ: [trước tối ưu](./lighthouse-before.report.html) · [sau tối ưu](./lighthouse-after.report.html). JSON tương ứng nằm cùng thư mục.

## Kết quả so sánh

| Chỉ số | Trước tối ưu: render đủ 10.000 dòng | Sau tối ưu: virtual scrolling | Thay đổi |
|---|---:|---:|---:|
| Performance | 42 | 100 | +58 điểm |
| FCP | 1,3 giây | 1,3 giây | Không đổi |
| LCP | 5,3 giây | 1,4 giây | Giảm 3,9 giây (74%) |
| TBT | 11.050 ms | 10 ms | Giảm 11.040 ms (99,9%) |
| CLS | 0 | 0 | Không đổi |

Baseline 10.000 dòng xuất hiện trong [lighthouse-before.report.json](./lighthouse-before.report.json). Baseline stress tắt virtualization và gắn cả 10.000 hàng vào DOM; đây là phép đo cô lập tác động của virtualization. Kết quả đo ban đầu trước khi áp dụng các tối ưu (phiên bản phân trang 20 dòng) là 89 điểm; FCP 1,6 giây, LCP 1,8 giây, TBT 100 ms và CLS 0. Báo cáo chính dùng baseline stress vì nó phản ánh tải của danh sách 10.000 dòng.

## Giải pháp đã áp dụng

1. **Virtual scrolling:** bảng chỉ tạo khoảng 20 hàng gần vùng nhìn thấy; thanh cuộn vẫn đại diện cho toàn bộ kết quả. Thao tác này giảm số node DOM từ 10.000 xuống khoảng 20 và cắt thời gian layout/render.
2. **Memo hóa lọc và sắp xếp:** `useMemo` giữ kết quả đến khi từ khóa, danh mục hoặc kiểu sắp xếp thay đổi. Trường hợp mặc định dùng thứ tự dữ liệu có sẵn, tránh sort 10.000 phần tử lúc mở trang.
3. **Memo hóa hàng:** `React.memo` tránh render lại các hàng không đổi khi vị trí cuộn cập nhật.

## Cách đo lại

```powershell
npm run build
npm run preview -- --host 127.0.0.1
npx lighthouse http://127.0.0.1:4173/ --chrome-path="C:\Program Files\Google\Chrome\Application\chrome.exe" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --output=json --output=html --output-path=reports/lighthouse-after
```

Lighthouse có thể dao động theo tải máy và môi trường chạy. Các số trong bảng là kết quả đo được của phiên này.
