# VNU-IS Portal: Student Management & Algorithm Visualizer

Một hệ thống quản lý sinh viên hiện đại tích hợp môi trường mô phỏng trực quan thuật toán Dual-Stack Sort, được phát triển trên nền tảng Flask (Python) và Vanilla JS/CSS.

## Tính năng nổi bật

### 1. Trang Quản trị (Admin Dashboard)

- Giao diện Glassmorphism hiện đại, tối giản.
- Phân quyền đăng nhập bảo mật bằng Session.
- Thực hiện các nghiệp vụ CRUD (Thêm, Sửa, Xóa) trực tiếp trên file `students.csv`.
- Thanh tìm kiếm Real-time theo Mã sinh viên (ID).
- Thanh cuộn dữ liệu mượt mà với Sticky Header.

### 2. Trang Mô phỏng (Algorithm Simulation)

- Trực quan hóa cấu trúc dữ liệu Stack (Ngăn xếp) với hiệu ứng 3D.
- Khai thác vùng nhớ đệm (Buffer/Temp Stack) để lách luật "Pop & Discard" phần tử ở giữa ngăn xếp.
- Minh họa trực tiếp thuật toán **Dual-Stack Insertion Sort** với độ phức tạp $O(N^2)$.
- Dashboard viễn trắc đo lường tổng số bản ghi và số lượt thao tác bộ nhớ (Memory Operations).

## Công nghệ sử dụng

- **Backend:** Python 3, Flask
- **Frontend:** HTML5, CSS3, JavaScript (ES6)
- **Database:** CSV File Storage
- **Design Pattern:** MVC (Model-View-Controller)
