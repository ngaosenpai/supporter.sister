# supporter.sister
gửi file excel lên và xuất về file excel cho client


cái project này hoạt động theo kiểu: user truy cập vào web, web hiện bảng giá của cty (lưu data ở mongodb), có thể cập nhật giá bằng cách gửi 1 file excel mới lên. User gửi 1 file excel thông tin về hóa đơn của khách hàng đặt hàng, sau khi gửi xong server sẽ lấy file đó, tính toán với dữ liệu giá tiền mỗi loại và xuất kết quả thống kê về 1 file mới cho khách hàng tải về.
Cách làm:
- ở client, lên trang chủ để lấy những cdn cần thiết. Vào mục demo in browser -> f12 -> tab source, copy hết code script phần nhúng cdn ở phần body và paste về cái file html của mình :v
- khi click nút gửi file excel thì gửi bằng ajax bth với data nằm trong formData và set content-type trong header là multipart/form-data
- ở server dùng multer đê lấy file, sau khi xử lí và có data mới thì bỏ data đó vào 1 worksheet mới, bỏ worksheet đo vào 1 cái workbook và write cái workbook với type: array hoặc buffer.
- set lại header của response : content-type : sheet, và content-disposition : attachment. Sau đó send cái workbook lên.
- ở client, khi nhận đc response thì dùng method writeFile của XLSX là nó tự động tải về luôn cho mình
