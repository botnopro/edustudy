Website học trực tuyến, kích hoạt khóa học và luyện thi THPT Quốc Gia toàn diện. Giao diện hiện đại, trang quản trị Admin điều khiển **100% dữ liệu hiển thị**.

---

## 📑 Mục lục

1. [Tính năng nổi bật](#-tính-năng-nổi-bật)
2. [Kiến trúc & công nghệ](#-kiến-trúc--công-nghệ)
3. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
4. [Chạy thử trên máy local](#-chạy-thử-trên-máy-local)
5. [Cấu hình biến môi trường](#-cấu-hình-biến-môi-trường)
6. [Sơ đồ điều hướng](#-sơ-đồ-điều-hướng)
7. [Triển khai lên VPS chạy 24/7](#-triển-khai-lên-vps-chạy-247)
8. [Mua và trỏ tên miền](#-mua-và-trỏ-tên-miền)
9. [Cài HTTPS miễn phí](#-cài-https-miễn-phí-lets-encrypt)
10. [Cập nhật code, backup, giám sát](#-cập-nhật-code-backup-giám-sát)
11. [Checklist bảo mật trước khi public](#-checklist-bảo-mật-trước-khi-public)

---

## 🌟 Tính năng nổi bật

### 1. Phân hệ kích hoạt khóa học (`/active-course`)
- **Kiểm tra mã theo thời gian thực**: báo ngay trạng thái mã (hợp lệ, đã dùng hết, bị khóa, hết hạn).
- **Quy trình 3 bước**: Đăng nhập → Nhập mã bản quyền / thẻ cào → Vào học ngay.
- **Mã mẫu trải nghiệm nhanh (Demo Chips)**: thử kích hoạt chỉ với 1 click.
- **Danh mục khóa học đa dạng**: theo khối (Lớp 10, 11, 12, ĐGNL HSA/TSA) và môn (Toán, Lý, Hóa, Anh, Sử, Địa…).
- **Đội ngũ giáo viên**: hồ sơ, danh hiệu, kinh nghiệm từng giáo viên.
- **Gương mặt Thủ khoa & Điểm 9+**: vinh danh thành tích và cảm nhận học viên.
- **FAQ**: hướng dẫn kích hoạt thẻ cào, bảo mật tài khoản, đổi trả mã.

### 2. Phân hệ quản trị Admin (`/admin`)

| Module | Chức năng chính |
| :--- | :--- |
| **Dashboard** (`/admin`) | Biểu đồ doanh thu, số học sinh, số khóa học, tổng mã và tỷ lệ sử dụng |
| **Đơn hàng** (`/admin/orders`) | Theo dõi đơn mua online, thanh toán tự động **VietQR / SePay Webhook** |
| **Học sinh** (`/admin/students`) | Lọc theo khối, trường, tiến độ; cấp / thu hồi quyền khóa học; khóa / mở khóa tài khoản; cấp lại mật khẩu |
| **Khóa học** (`/admin/courses`) | CRUD khóa học, học phí, giá niêm yết, giảng viên, ảnh bìa |
| **Course Studio** (`/admin/courses/:id/studio`) | Quản lý giáo trình, video YouTube / Cloud player, thời lượng, Leaderboard, danh sách học viên |
| **Mã kích hoạt** (`/admin/codes`) | KPI, bộ lọc kết hợp, sửa / khóa / mở khóa mã, sinh mã hàng loạt, xuất mã chưa dùng |
| **Khối lớp & Môn** (`/admin/categories`) | Thêm, sửa, xóa khối lớp và môn học |
| **Giáo viên** (`/admin/teachers`) | Hồ sơ, danh hiệu, `sortOrder`, bật / ẩn, lọc theo môn |
| **Banner** (`/admin/banners`) | Điều khiển slide banner hero trang chủ |
| **FAQ & Đánh giá 9+** (`/admin/faqs`) | CRUD, lọc theo chuyên mục, bật / tắt hiển thị |

#### Quản lý mã kích hoạt nâng cao
- 4 thẻ KPI: Tổng mã · Khả dụng · Đã kích hoạt · Tạm khóa / Hết hạn.
- Lọc theo **Khóa học** + **Trạng thái** (Tất cả / Khả dụng / Đã dùng / Tạm khóa / Hết hạn).
- Sửa thông tin mã: gia hạn ngày hết hạn, số lượt dùng tối đa, ghi chú nguồn phát hành.
- Khóa / mở khóa mã 1 click.
- Click email người kích hoạt để nhảy sang hồ sơ học sinh.
- Sinh mã hàng loạt ngẫu nhiên, chống trùng, **loại bỏ ký tự dễ nhầm `0, 1, I, O`**.
- Xuất danh sách mã chưa dùng vào Clipboard để dán Excel hoặc gửi nhà in thẻ cào.

#### Hệ thống tạo Quiz & Đề thi (`AdminQuizModal`)
- **4 dạng câu hỏi**: Trắc nghiệm 4 lựa chọn (MCQ) · Đúng/Sai 4 ý (chuẩn đề tốt nghiệp THPT 2025) · Trả lời ngắn · Tự luận.
- **Soạn công thức KaTeX**: `MathToolbar` hỗ trợ phân số, tích phân, căn bậc n, hệ phương trình, ma trận, ký hiệu Hy Lạp.
- **Vẽ đồ thị Oxy** (`ChartPlotter` & `ChartEditorModal`): hàm bậc 3, bậc 4 trùng phương, phân thức, lượng giác và biểu đồ thống kê dạng SVG.
- **Dán ảnh nhanh** (`ImagePasteZone`): `Ctrl + V` để dán ảnh vào câu hỏi / đáp án.
- **Nhập đề từ Word / Azota** (`AzotaWordParserModal`): tự phân tích định dạng `Câu 1: ... A. ... B. ...` thành đề thi hoàn chỉnh.

### 3. Góc học tập của học sinh (`/my-courses`)
- Trình phát video bài giảng Full HD (YouTube Embed).
- **Trình làm bài `StudentQuizRunner`**:
  - Hiển thị KaTeX và đồ thị hàm số.
  - Đếm ngược thời gian, bảng điều hướng câu hỏi, đánh dấu câu cần xem lại.
  - **Chấm điểm tự động theo barem Bộ GD&ĐT 2025**:

    | Dạng | Quy tắc |
    | :--- | :--- |
    | Đúng/Sai 4 ý | Đúng 1 ý = 10% · 2 ý = 25% · 3 ý = 50% · 4 ý = 100% |
    | Trả lời ngắn | Tự chuẩn hóa tương đương: `1/2` = `0.5` = `0,5` |

  - Lời giải chi tiết kèm bước làm và barem sau khi nộp bài.

---

## 🛠 Kiến trúc & công nghệ

```
┌──────────────┐  HTTPS   ┌─────────────────────────────┐        ┌────────────────────┐
│   Trình      │ ───────▶ │  Nginx (VPS)                │        │  Supabase          │
│   duyệt      │          │  ├─ /      → React (static) │        │  PostgreSQL Pooler │
└──────────────┘          │  └─ /api/* → Spring Boot ───┼──────▶ │  (port 6543, SSL)  │
                          │              :8080 (systemd)│        └────────────────────┘
                          └─────────────────────────────┘
                                      ▲
                       SePay Webhook ─┘ (thanh toán tự động)
```

**Backend** (`/backend`)
- Java 21 LTS, Spring Boot 3.3.4
- Spring Security 6, JWT stateless, RBAC (`ROLE_ADMIN`, `ROLE_STUDENT`), BCrypt
- PostgreSQL (Supabase Pooler, SSL), JPA / Hibernate 6
- Thanh toán: VietQR + SePay Webhook
- API docs: SpringDoc OpenAPI 3 / Swagger UI

**Frontend** (`/frontend`)
- React 19, TypeScript, Vite 6
- TailwindCSS 3 (cam `#EF4401`, navy `#0F172A`), font Plus Jakarta Sans
- Lucide React, KaTeX, SVG Function Plotter
- Axios + Interceptor tự gắn Bearer Token và xử lý lỗi

---

## 📂 Cấu trúc thư mục

```
.
├── backend/            # Spring Boot (Maven Wrapper: mvnw / mvnw.cmd)
│   └── src/main/resources/application.yml
├── frontend/           # React + Vite
│   └── .env.example
├── deploy/             # (khuyến nghị) file cấu hình triển khai: nginx, systemd, ...
├── .gitignore
└── README.md
```

---

## 💻 Chạy thử trên máy local

**Yêu cầu:** JDK 21, Node.js 20+, Git.

### 1. Clone project
```bash
git clone https://github.com/<ten-ban>/<ten-repo>.git
cd <ten-repo>
```

### 2. Backend
```bash
cd backend

# Windows (PowerShell)
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Mở: **http://localhost:5173**

### Tài khoản mẫu (nạp tự động bởi `DataSeeder.java`)

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| Admin | `admin@edustudy.com` | `admin123` |
| Học sinh 1 | `hocsinh@edustudy.com` | `student123` |
| Học sinh 2 | `nguyenminhanh@gmail.com` | `student123` |

> ⚠️ **Chỉ dùng để phát triển.** Khi đưa lên server thật phải **đổi mật khẩu Admin ngay** (hoặc tắt seeder) – xem [Checklist bảo mật](#-checklist-bảo-mật-trước-khi-public).

---

## 🔐 Cấu hình biến môi trường

**Tuyệt đối không commit mật khẩu DB, JWT secret, API key lên GitHub.** Hãy đọc chúng từ biến môi trường.

### Backend
Spring Boot tự map biến môi trường sang property. Ví dụ:

| Biến | Ý nghĩa |
| :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<host>.pooler.supabase.com:6543/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | User Supabase |
| `SPRING_DATASOURCE_PASSWORD` | Mật khẩu Supabase |
| `JWT_SECRET` | Chuỗi bí mật ≥ 32 ký tự ngẫu nhiên |
| `SEPAY_API_KEY` | Khóa xác thực webhook SePay |
| `CORS_ALLOWED_ORIGINS` | `https://tenmiencuaban.com` |

> Tên các biến `JWT_SECRET`, `SEPAY_API_KEY`, `CORS_ALLOWED_ORIGINS` phải **khớp với `application.yml` của bạn** (dạng `${JWT_SECRET:...}`). Hãy sửa lại cho đúng nếu đặt tên khác.

Tạo JWT secret ngẫu nhiên:
```bash
openssl rand -base64 48
```

### Frontend
Tạo `frontend/.env.example` (commit) và `frontend/.env.production` (không commit):
```env
# Khi dùng Nginx proxy /api cùng domain, chỉ cần đường dẫn tương đối:
VITE_API_URL=/api
```

### `.gitignore` tối thiểu
```gitignore
# Secrets
.env
.env.*
!.env.example
application-local.yml
application-prod.yml

# Build
backend/target/
frontend/node_modules/
frontend/dist/

# IDE / OS
.idea/
.vscode/
*.iml
.DS_Store
```

### Push lên GitHub
```bash
git init
git add .
git commit -m "feat: initial commit EduStudy"
git branch -M main
git remote add origin https://github.com/<ten-ban>/<ten-repo>.git
git push -u origin main
```
> Nếu lỡ commit mật khẩu thật: **đổi mật khẩu ngay** (xóa file khỏi Git là chưa đủ vì lịch sử vẫn còn).

---

## 📱 Sơ đồ điều hướng

| Trang | Đường dẫn |
| :--- | :--- |
| Trang chủ | `/` |
| Kích hoạt khóa học | `/active-course` |
| Tất cả khóa học | `/courses` |
| Đội ngũ giáo viên | `/teachers` |
| Góc học tập | `/my-courses` |
| Admin – Dashboard | `/admin` |
| Admin – Đơn hàng | `/admin/orders` |
| Admin – Học sinh | `/admin/students` |
| Admin – Khóa học & Studio | `/admin/courses` |
| Admin – Khối lớp & Môn | `/admin/categories` |
| Admin – Mã kích hoạt | `/admin/codes` |
| Admin – Giáo viên | `/admin/teachers` |
| Admin – Banner | `/admin/banners` |
| Admin – FAQ & 9+ | `/admin/faqs` |

---

## 🚀 Triển khai lên VPS chạy 24/7

Hướng dẫn cho **Ubuntu 22.04 / 24.04**. Database dùng luôn Supabase nên VPS **không cần cài PostgreSQL**.

### Bước 0 – Chọn VPS

| Tiêu chí | Khuyến nghị |
| :--- | :--- |
| Hệ điều hành | Ubuntu 22.04 hoặc 24.04 LTS |
| RAM | **Tối thiểu 1 GB** (chạy được nếu thêm swap), **khuyến nghị 2 GB** |
| CPU / Ổ đĩa | 1–2 vCPU, 20 GB SSD trở lên |
| Vị trí máy chủ | Việt Nam (Viettel IDC, VNPT, BKNS, Nhân Hòa, Tenten…) nếu học sinh ở VN; hoặc Singapore (Vultr, DigitalOcean, Contabo…) nếu muốn giá rẻ |

Sau khi mua VPS bạn sẽ nhận được **IP**, **user (root)** và **mật khẩu / SSH key**.

### Bước 1 – Đăng nhập và chuẩn bị server
```bash
ssh root@<IP_VPS>

# Cập nhật hệ thống
apt update && apt upgrade -y

# Tạo user riêng (không chạy app bằng root)
adduser deploy
usermod -aG sudo deploy

# Thiết lập múi giờ
timedatectl set-timezone Asia/Ho_Chi_Minh
```

**Thêm swap 2 GB** (rất nên làm nếu RAM ≤ 2 GB, tránh Java bị kill):
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Tường lửa:**
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'   # chạy sau khi cài Nginx ở bước 2
ufw enable
```

Từ đây đăng nhập bằng user `deploy`:
```bash
su - deploy
```

### Bước 2 – Cài Java 21, Node.js, Nginx, Git
```bash
sudo apt install -y openjdk-21-jdk nginx git curl unzip

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

java -version && node -v && nginx -v
```
Mở tường lửa web nếu chưa: `sudo ufw allow 'Nginx Full'`

### Bước 3 – Lấy code về server
```bash
sudo mkdir -p /opt/edustudy && sudo chown deploy:deploy /opt/edustudy
cd /opt/edustudy
git clone https://github.com/<ten-ban>/<ten-repo>.git .
```
(Repo private: dùng [Deploy Key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) hoặc Personal Access Token.)

### Bước 4 – Build & chạy Backend bằng systemd

**4.1 Build file JAR**
```bash
cd /opt/edustudy/backend
chmod +x mvnw
./mvnw clean package -DskipTests
ls target/*.jar
```

**4.2 Tạo file biến môi trường** `/etc/edustudy.env` (chỉ root đọc được)
```bash
sudo nano /etc/edustudy.env
```
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>.pooler.supabase.com:6543/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.<project-ref>
SPRING_DATASOURCE_PASSWORD=<mat-khau-db>
JWT_SECRET=<chuoi-ngau-nhien-dai>
SEPAY_API_KEY=<api-key-sepay>
CORS_ALLOWED_ORIGINS=https://tenmiencuaban.com
SERVER_PORT=8080
```
```bash
sudo chmod 600 /etc/edustudy.env
```

**4.3 Tạo service** `/etc/systemd/system/edustudy.service`
```bash
sudo nano /etc/systemd/system/edustudy.service
```
```ini
[Unit]
Description=EduStudy Backend (Spring Boot)
After=network.target

[Service]
User=deploy
WorkingDirectory=/opt/edustudy/backend
EnvironmentFile=/etc/edustudy.env
# Giới hạn heap cho VPS nhỏ: 1GB RAM dùng -Xmx512m, 2GB RAM dùng -Xmx1g
ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/edustudy/backend/target/<ten-file>.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```
> Thay `<ten-file>.jar` bằng tên thật trong `target/`.

**4.4 Kích hoạt (tự chạy lại khi reboot hoặc crash → chạy 24/7)**
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now edustudy
sudo systemctl status edustudy

# Xem log realtime
journalctl -u edustudy -f
```

### Bước 5 – Build Frontend và cấu hình Nginx

**5.1 Build**
```bash
cd /opt/edustudy/frontend
npm ci
npm run build          # tạo thư mục dist/
```

**5.2 Cấu hình Nginx** `/etc/nginx/sites-available/edustudy`
```bash
sudo nano /etc/nginx/sites-available/edustudy
```
```nginx
server {
    listen 80;
    server_name tenmiencuaban.com www.tenmiencuaban.com;

    root /opt/edustudy/frontend/dist;
    index index.html;

    # Upload ảnh/đề lớn
    client_max_body_size 20M;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    # API → Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache file tĩnh
    location ~* \.(js|css|png|jpg|jpeg|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # React Router (SPA): mọi đường dẫn khác trả về index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
> Nếu API của bạn **không** có tiền tố `/api` thì sửa `location` cho khớp với đường dẫn thật của backend.

**5.3 Bật site**
```bash
sudo ln -s /etc/nginx/sites-available/edustudy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Lúc này truy cập `http://<IP_VPS>` đã thấy website. Bước tiếp theo là gắn tên miền.

### Cách thay thế: Docker Compose (tùy chọn)
Nếu bạn quen Docker, có thể đóng gói backend + Nginx thành container và dùng `restart: unless-stopped` để chạy 24/7. Khi đó hãy thêm thư mục `deploy/` chứa `Dockerfile` và `docker-compose.yml` vào repo.

---

## 🌐 Mua và trỏ tên miền

### Bước 1 – Chọn nơi mua tên miền

| Loại | Nhà đăng ký phổ biến | Ghi chú |
| :--- | :--- | :--- |
| Tên miền quốc tế (`.com`, `.net`, `.edu.vn` không áp dụng) | Namecheap, Cloudflare Registrar, GoDaddy, Porkbun | Thanh toán thẻ Visa / MasterCard; Cloudflare bán giá gốc, không phụ phí |
| Tên miền Việt Nam (`.vn`, `.com.vn`) | PA Vietnam, Mắt Bão, Nhân Hòa, Tenten, iNET | Thanh toán nội địa, hỗ trợ tiếng Việt |

**Lưu ý chọn tên miền**
- Ngắn, dễ nhớ, không dấu gạch ngang, ví dụ `edustudy.vn`, `luyenthi24h.com`.
- `.com` phổ biến nhất; `.vn` tạo uy tín với người dùng Việt Nam nhưng **cần giấy tờ định danh** (CCCD với cá nhân, giấy phép kinh doanh với tổ chức) và thủ tục kiểm tra lâu hơn.
- Bật **gia hạn tự động** và **khóa chuyển nhượng (Registrar Lock)** để tránh mất tên miền.
- Giá thay đổi theo thời điểm và khuyến mãi, hãy so sánh trên trang đăng ký trước khi thanh toán.

### Bước 2 – Trỏ tên miền về VPS (DNS)
Vào trang quản lý DNS của nhà đăng ký (hoặc Cloudflare) và tạo bản ghi:

| Type | Name / Host | Value | TTL |
| :--- | :--- | :--- | :--- |
| `A` | `@` | `<IP_VPS>` | 300 |
| `A` | `www` | `<IP_VPS>` | 300 |

Kiểm tra sau 5–30 phút (tối đa vài giờ):
```bash
nslookup tenmiencuaban.com
# hoặc
ping tenmiencuaban.com
```
Khi kết quả trả về đúng IP VPS là thành công.

> **Dùng Cloudflare (khuyến nghị):** đổi Nameserver của tên miền sang Cloudflare để có DNS nhanh, chống DDoS cơ bản và CDN miễn phí. Nếu bật proxy (đám mây cam), đặt SSL mode là **Full (strict)** sau khi đã cài chứng chỉ trên server.

---

## 🔒 Cài HTTPS miễn phí (Let's Encrypt)

HTTPS là **bắt buộc** để đăng nhập an toàn và để SePay gọi webhook về.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tenmiencuaban.com -d www.tenmiencuaban.com
```
- Chọn tự động chuyển HTTP → HTTPS khi được hỏi.
- Chứng chỉ **tự gia hạn**. Kiểm tra: `sudo certbot renew --dry-run`

Sau đó cập nhật:
1. `CORS_ALLOWED_ORIGINS=https://tenmiencuaban.com` trong `/etc/edustudy.env` rồi `sudo systemctl restart edustudy`.
2. **URL Webhook SePay**: `https://tenmiencuaban.com/<đường-dẫn-webhook-của-bạn>`.

---

## 🔄 Cập nhật code, backup, giám sát

### Script cập nhật nhanh `deploy.sh`
```bash
#!/usr/bin/env bash
set -e
cd /opt/edustudy
git pull origin main

# Backend
cd backend && ./mvnw clean package -DskipTests
sudo systemctl restart edustudy

# Frontend
cd ../frontend && npm ci && npm run build
sudo systemctl reload nginx

echo "✅ Deploy xong!"
```
```bash
chmod +x deploy.sh && ./deploy.sh
```

### Lệnh hữu ích
```bash
sudo systemctl status edustudy       # trạng thái backend
sudo systemctl restart edustudy      # khởi động lại
journalctl -u edustudy -n 100        # 100 dòng log gần nhất
sudo tail -f /var/log/nginx/error.log
free -h && df -h                     # kiểm tra RAM / ổ đĩa
```

### Backup
- **Database**: bật backup trong Supabase (xem mục Database → Backups, tùy gói) và định kỳ export bằng `pg_dump`.
- **VPS**: bật snapshot / backup tự động tại nhà cung cấp VPS.

### Giám sát uptime
Dùng dịch vụ miễn phí như **UptimeRobot** hoặc **Better Stack** để ping `https://tenmiencuaban.com` mỗi 5 phút và báo qua email / Telegram khi web sập.

---

## ✅ Checklist bảo mật trước khi public

- [ ] **Đổi mật khẩu** `admin@edustudy.com` (hoặc tắt `DataSeeder` tạo tài khoản mẫu ở môi trường production).
- [ ] `JWT_SECRET` là chuỗi ngẫu nhiên dài, **không** dùng giá trị mặc định.
- [ ] Không có mật khẩu DB / API key nào nằm trong code hoặc lịch sử Git.
- [ ] Đổi `ddl-auto: update` thành `validate` hoặc `none` ở production (dùng migration như Flyway nếu cần thay đổi schema).
- [ ] Tắt hoặc giới hạn Swagger UI ở production (`springdoc.swagger-ui.enabled=false`).
- [ ] Đăng nhập SSH bằng **SSH key**, tắt đăng nhập root bằng mật khẩu (`PermitRootLogin no`, `PasswordAuthentication no`).
- [ ] Cài `fail2ban`: `sudo apt install -y fail2ban`.
- [ ] Chỉ mở cổng **22, 80, 443** trên tường lửa (cổng 8080 chỉ nội bộ qua Nginx).
- [ ] Webhook SePay có xác thực API key, không nhận request lạ.
- [ ] Bật gia hạn tự động cho tên miền và chứng chỉ SSL.

---

## 📄 Giấy phép

Chọn giấy phép phù hợp (ví dụ MIT) và thêm file `LICENSE`, hoặc ghi rõ **"Bản quyền thuộc về chủ sở hữu, không sao chép khi chưa được phép"** nếu là dự án thương mại.

---

<div align="center">

**EduStudy** – Học thông minh, thi tự tin 🚀

</div>