# 🫀 HEARHEALTH - HỆ THỐNG QUẢN LÝ & THEO DÕI SỨC KHỎE TIM MẠCH

> **HearHealth** là ứng dụng di động kết hợp hệ thống Backend chuyên sâu giúp quản lý, theo dõi chỉ số sức khỏe tim mạch hàng ngày, phân loại nguy cơ y tế (Triage), lập lịch nhắc nhở uống thuốc/tái khám và trực quan hóa biểu đồ diễn tiến sức khỏe cho bệnh nhân.

---

## 📋 MỤC LỤC
1. [Tổng Quan Kiến Trúc Dự Án](#-tổng-quan-kiến-trúc-dự-án)
2. [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
3. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
4. [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
5. [Đặc Tả Danh Sách 20 Màn Hình Frontend](#-đặc-tả-danh-sách-20-màn-hình-frontend)
6. [Đặc Tả Hệ Thống API Backend](#-đặc-tả-hệ-thống-api-backend)
7. [Cơ Sở Dữ Liệu & Hibernate DDL](#-cơ-sở-dữ-liệu--hibernate-ddl)
8. [Đa Ngôn Ngữ & Bảo Mật](#-đa-ngôn-ngữ--bảo-mật)

---

## 🏗️ TỔNG QUAN KIẾN TRÚC DỰ ÁN

Hệ thống được thiết kế theo mô hình **Client - Server (RESTful Architecture)**:
- **Client (Frontend Mobile):** Ứng dụng di động xây dựng bằng React Native, hỗ trợ cả 2 nền tảng Android & iOS. Giao diện thiết kế theo phong cách y tế hiện đại (Pink Rose Theme), hỗ trợ chuyển đổi đa ngôn ngữ (Tiếng Việt & Tiếng Anh).
- **Server (Backend Service):** Hệ thống REST API viết bằng Spring Boot (Java 17) kết hợp Spring Data JPA / Hibernate ORM quản lý cơ sở dữ liệu MySQL, tích hợp dịch vụ gửi mã OTP tự động qua Google SMTP Mail Server.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### 📱 Frontend (Mobile App)
- **Framework:** React Native (v0.74+)
- **Điều hướng (Navigation):** `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`
- **Quản lý bộ nhớ local:** `@react-native-async-storage/async-storage`
- **Giao tiếp HTTP:** `axios` (với cấu hình tự động xử lý IP Emulator `10.0.2.2:8080`)
- **Icon & UI:** `react-native-vector-icons` (MaterialCommunityIcons, MaterialIcons)
- **Đa ngôn ngữ:** Custom Language Context (VN / EN)

### ⚙️ Backend (REST API Service)
- **Core Framework:** Spring Boot 4.1.0 / 3.x (Java 17)
- **ORM / Database Access:** Spring Data JPA / Hibernate ORM
- **Database Engine:** MySQL 8.0+
- **Xác thực Mail OTP:** Spring Boot Starter Mail (Gmail SMTP)
- **Công cụ Build:** Apache Maven (`mvnw`)
- **Boilerplate Reduction:** Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`)

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
ProjectMobile/
├── HearHealthFrontEnd/             # Nguồn mã nguồn Ứng dụng Di động (React Native)
│   ├── android/                    # Mã nguồn Native Android
│   ├── ios/                        # Mã nguồn Native iOS
│   ├── src/
│   │   ├── Components/             # Các component dùng chung (Header, TabBar, Reminders...)
│   │   ├── Constants/              # Cấu hình màu sắc Theme & từ điển đa ngôn ngữ (LanguageConfig)
│   │   ├── Context/                # Language Context quản lý trạng thái ngôn ngữ toàn app
│   │   ├── Navigation/             # AppNavigator điều hướng các màn hình
│   │   ├── Screens/                # 20 Màn hình giao diện người dùng
│   │   └── Services/               # Axios API client cấu hình kết nối Backend
│   ├── package.json
│   └── .gitignore
│
├── HeartHealthBackEnd/             # Nguồn mã nguồn Backend REST Service (Spring Boot)
│   ├── hibernate/                  # 12+ File kịch bản DDL SQL khởi tạo & cập nhật Database
│   ├── src/main/java/com/hearthealth/backend/
│   │   ├── controller/             # REST Controllers (Auth, Health, Goal, Admin, Ping)
│   │   ├── dto/                    # Data Transfer Objects (Requests & Responses)
│   │   ├── entity/                 # JPA Entities (User, HealthRecord, DailyMetric, Goal...)
│   │   ├── exception/              # Global Exception Handler & Custom Exceptions
│   │   ├── repository/             # Spring Data JPA Repositories
│   │   └── service/                # Business Logic Services & Implementations
│   ├── src/main/resources/
│   │   └── application.properties  # Cấu hình Database Connection & Gmail SMTP
│   ├── pom.xml
│   ├── .env                        # Chứa biến môi trường mật khẩu Mail & DB
│   └── .gitignore
│
├── .gitignore                      # Gitignore tổng quát cho toàn bộ dự án
└── README.md                       # Tài liệu hướng dẫn & đặc tả hệ thống
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY

### 1. Yêu Cầu Môi Trường (Prerequisites)
- **Node.js**: `v18.x` trở lên
- **Java Development Kit (JDK)**: `JDK 17`
- **Android Studio / Android SDK**: Android Emulator (API 30+)
- **MySQL Database Server**: `v8.0` trở lên (Port mặc định: 3306)

---

### 2. Khởi Chạy Backend (Spring Boot Service)

1. **Khởi tạo Database MySQL:**
   - Tạo cơ sở dữ liệu MySQL tên: `heart_health_db`
   - Nhập các file DDL SQL trong thư mục `HeartHealthBackEnd/hibernate/` theo thứ tự từ `001` đến `012`.

2. **Cấu hình file `application.properties` hoặc `.env`:**
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/heart_health_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=123456
   
   # Cấu hình Gửi Gmail OTP
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   ```

3. **Chạy lệnh khởi động Backend:**
   ```bash
   cd HeartHealthBackEnd
   ./mvnw spring-boot:run
   ```
   *Backend sẽ lắng nghe tại cổng `http://localhost:8080`.*

---

### 3. Khởi Chạy Frontend (React Native Mobile App)

1. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   cd HearHealthFrontEnd
   npm install
   ```

2. **Khởi chạy ứng dụng trên Android Emulator:**
   ```bash
   # Mở sẵn Android Emulator từ Android Studio
   npx react-native run-android
   ```

---

## 📱 ĐẶC TẢ DANH SÁCH 20 MÀN HÌNH FRONTEND

| STT | Tên Screen | Đường dẫn File | Chức năng chính |
| :--- | :--- | :--- | :--- |
| 1 | **LoginScreen** | `Screens/LoginScreen.js` | Đăng nhập Email/Password hoặc Đăng nhập nhanh qua mã OTP Gmail. Có nút chuyển đổi ngôn ngữ VN/EN. |
| 2 | **RegisterScreen** | `Screens/RegisterScreen.js` | Đăng ký tài khoản người bệnh mới, kiểm tra trùng lặp email và gửi mã OTP xác thực. |
| 3 | **OTPScreen** | `Screens/OTPScreen.js` | Nhập mã OTP 6 chữ số xác thực từ Gmail (phục vụ Đăng ký & Đăng nhập Gmail). |
| 4 | **ForgotPasswordScreen** | `Screens/ForgotPasswordScreen.js` | Nhập Email yêu cầu khôi phục mật khẩu tài khoản bị quên. |
| 5 | **SetPasswordScreen** | `Screens/SetPasswordScreen.js` | Đặt mật khẩu mới sau khi xác thực OTP thành công. |
| 6 | **ScreeningScreen** | `Screens/ScreeningScreen.js` | Khảo sát Sàng lọc sức khỏe ban đầu (Huyết áp, Nhịp tim, Tiền sử bệnh, Triệu chứng, Thuốc đang dùng...). |
| 7 | **TriageScreen** | `Screens/TriageScreen.js` | Hiển thị kết quả Phân loại Nguy cơ sức khỏe (Bình thường / Trung bình / Cao / Khẩn cấp) kèm khuyến cáo y tế. |
| 8 | **HomeScreen** | `Screens/HomeScreen.js` | Màn hình Tổng quan (Overview) - Hiển thị chỉ số đo mới nhất, trạng thái sức khỏe và danh sách nhắc nhở trong ngày. |
| 9 | **StatisticsScreen** | `Screens/StatisticsScreen.js` | Màn hình Biểu đồ (Charts) - Thẻ tóm tắt chỉ số gần nhất + Biểu đồ diễn tiến 7 ngày / 30 ngày (Huyết áp, Nhịp tim, Đường huyết, Cân nặng). |
| 10 | **MetricsScreen** | `Screens/MetricsScreen.js` | Danh mục chọn loại chỉ số cần cập nhật (Huyết áp & Nhịp tim, Chuyển hóa & Cân nặng, Triệu chứng). |
| 11 | **MetricBPScreen** | `Screens/MetricBPScreen.js` | Form nhập đo chỉ số Huyết áp (Tâm thu/Tâm trương), Nhịp tim (bpm) và nồng độ SpO2 (%). |
| 12 | **MetricMetabolicScreen**| `Screens/MetricMetabolicScreen.js` | Form nhập đo chỉ số Đường huyết (mg/dL), Cholesterol (mg/dL) và Cân nặng (kg). |
| 13 | **MetricSymptomScreen** | `Screens/MetricSymptomScreen.js` | Form ghi nhận các triệu chứng tim mạch bất thường (Đau ngực, Khó thở, Vẫn ổn...). |
| 14 | **GoalsScreen** | `Screens/GoalsScreen.js` | Trung tâm Quản lý Mục tiêu sức khỏe & Lập lịch nhắc nhở (Thuốc & Lịch khám bác sĩ). |
| 15 | **GoalBPScreen** | `Screens/GoalBPScreen.js` | Thiết lập mức Huyết áp & Nhịp tim mục tiêu người bệnh cần duy trì. |
| 16 | **GoalNutritionScreen** | `Screens/GoalNutritionScreen.js` | Thiết lập mục tiêu Dinh dưỡng, Uống nước (ml) và Số bước đi bộ hàng ngày (steps). |
| 17 | **ScheduleMedicationScreen**| `Screens/ScheduleMedicationScreen.js` | Lập lịch nhắc nhở uống thuốc định kỳ (Tên thuốc, liều lượng, giờ uống). |
| 18 | **ScheduleDoctorScreen**| `Screens/ScheduleDoctorScreen.js` | Lập lịch hẹn tái khám với Bác sĩ / Bệnh viện chuyên khoa. |
| 19 | **ProfileScreen** | `Screens/ProfileScreen.js` | Hiển thị thông tin Hồ sơ bệnh nhân, Tuổi, Giới tính, Tiền sử bệnh, Đơn thuốc, Cài đặt & Nút Đăng xuất. |
| 20 | **EditProfileScreen** | `Screens/EditProfileScreen.js` | Chỉnh sửa Họ tên, Tuổi, Giới tính và Cập nhật Ảnh đại diện avatar. |

---

## 📡 ĐẶC TẢ HỆ THỐNG API BACKEND

Tất cả các API đều có tiền tố chuẩn: `http://<HOST>:8080/api`

### 1. Authentication Controller (`/api/auth`)
- `POST /api/auth/register` - Đăng ký tài khoản người dùng mới.
- `POST /api/auth/login` - Đăng nhập tài khoản bằng Email & Mật khẩu.
- `POST /api/auth/send-otp` - Gửi mã OTP xác thực qua Email Gmail.
- `POST /api/auth/verify-otp` - Xác thực mã OTP 6 chữ số.
- `POST /api/auth/reset-password` - Đặt lại mật khẩu mới sau khi quên.

### 2. Health Assessment & Metrics Controller (`/api/health`)
- `POST /api/health/assess` - Xử lý thông tin bài Sàng lọc ban đầu & trả về kết quả Triage y tế.
- `GET /api/health/overview?email={email}` - Lấy thông tin tổng quan chỉ số mới nhất hiển thị trang Home.
- `POST /api/health/daily-metrics` - Lưu / Cập nhật chỉ số sức khỏe hàng ngày vào bảng `daily_metrics` (Tự động gộp dữ liệu theo ngày).
- `GET /api/health/metrics-history?email={email}&days={7|30}` - Truy vấn lịch sử chỉ số sức khỏe phục vụ vẽ Biểu đồ trang Charts.
- `GET /api/health/profile?email={email}` - Lấy thông tin chi tiết hồ sơ bệnh nhân.
- `POST /api/health/profile/update` - Cập nhật thông tin Hồ sơ cá nhân.

### 3. Goal & Schedule Controller (`/api/goals`, `/api/schedules`)
- `GET /api/goals/reminders?email={email}` - Lấy danh sách nhắc nhở uống thuốc và lịch khám trong ngày.
- `POST /api/goals/bp` - Lưu cấu hình mục tiêu Huyết áp.
- `POST /api/goals/nutrition` - Lưu cấu hình mục tiêu Dinh dưỡng / Vận động.
- `POST /api/schedules/medication` - Thêm mới lịch nhắc uống thuốc.
- `POST /api/schedules/medication/toggle?id={id}` - Đánh dấu hoàn thành / bật tắt lịch uống thuốc.
- `POST /api/schedules/doctor` - Tạo mới lịch hẹn tái khám bác sĩ.

### 4. Admin Controller (`/api/admin`)
- `GET /api/admin/users` - Danh sách tất cả tài khoản người dùng hệ thống.
- `POST /api/admin/users/status` - Cập nhật trạng thái tài khoản (Khóa / Kích hoạt).
- `DELETE /api/admin/users/{id}` - Xóa tài khoản người dùng.

### 5. Utility Controller (`/api/ping`)
- `GET /api/ping` - Kiểm tra kết nối dịch vụ Backend (Health Check).

---

## 🗄️ CƠ SỞ DỮ LIỆU & HIBERNATE DDL

Hệ thống cơ sở dữ liệu bao gồm các bảng chính:
1. `users`: Quản lý thông tin tài khoản người dùng, vai trò (ROLE_USER / ROLE_ADMIN) và trạng thái sàng lọc.
2. `otp_tokens`: Quản lý các mã xác thực OTP 6 chữ số gửi qua Gmail kèm thời gian hết hạn (5 phút).
3. `health_records`: Quản lý hồ sơ bệnh án, tiền sử bệnh nền, đơn thuốc và danh hiệu đánh giá nguy cơ y tế.
4. `daily_metrics`: Quản lý nhật ký chỉ số sức khỏe theo từng ngày (Huyết áp Tâm thu/Tâm trương, Nhịp tim, SpO2, Đường huyết, Cholesterol, Cân nặng).
5. `goals`: Lưu trữ chỉ số mục tiêu sức khỏe tùy chỉnh của từng bệnh nhân.
6. `medication_schedules`: Lưu trữ danh sách thuốc và giờ uống thuốc hàng ngày.
7. `doctor_schedules`: Lưu trữ lịch hẹn tái khám tại bệnh viện / cơ sở y tế.

*Các kịch bản khởi tạo DDL chi tiết được lưu trong thư mục `HeartHealthBackEnd/hibernate/`.*

---

## 🌐 ĐA NGÔN NGỮ & BẢO MẬT

- **Hệ thống Đa ngôn ngữ (Localization):**
  - Hỗ trợ đầy đủ song ngữ **Tiếng Việt (VN)** và **Tiếng Anh (EN)**.
  - Quản lý tập trung qua `LanguageContext.js` và `LanguageConfig.js`. Người dùng có thể chuyển đổi ngôn ngữ trực tiếp ngay tại thanh Header của ứng dụng mà không cần khởi động lại.
- **Bảo mật & Chuẩn Logic Backend:**
  - Logic nghiệp vụ quan trọng (Tính toán chỉ số nguy cơ Triage, Lưu trữ dữ liệu tim mạch, Gởi OTP qua SMTP Mail, Xác thực tài khoản) BẮT BUỘC xử lý ở Backend.
  - Loại bỏ hoàn toàn các phụ thuộc AI bên ngoài (Groq API), đảm bảo tốc độ phản hồi tức thì và không bị phụ thuộc dịch vụ bên thứ ba.
  - Tự động lọc bỏ các file cấu hình nhạy cảm (`.env`) qua kịch bản `.gitignore` chuẩn.

---

*Hệ thống được phát triển và tối ưu hóa hoàn chỉnh phục vụ theo dõi và bảo vệ sức khỏe tim mạch cho người bệnh di động.*
