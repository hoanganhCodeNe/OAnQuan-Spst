# HÀNH TRÌNH ĐỘC LẬP - Ô ĂN QUAN LỊCH SỬ ĐẢNG

Website game giáo dục trực tuyến kết hợp giữa trò chơi dân gian **Ô Ăn Quan** và các mốc son chói lọi trong giáo trình môn **Lịch sử Đảng Cộng sản Việt Nam**.

---

## 📖 Ý Tưởng & Cách Chơi

Trò chơi lấy cảm hứng từ bàn cờ Ô Ăn Quan gồm **10 ô dân** và **2 ô quan**. Khi gieo sỏi và "ăn" được một ô trên bàn cờ, người chơi sẽ kích hoạt câu hỏi trắc nghiệm lịch sử tương ứng với ô sự kiện đó:

* **Ô Dân 1 đến 5** (Hàng dưới - Người chơi 1 kiểm soát):
  * **Ô 1**: Bối cảnh Việt Nam trước năm 1930.
  * **Ô 2**: Nguyễn Ái Quốc tìm đường cứu nước.
  * **Ô 3**: Thành lập Đảng Cộng sản Việt Nam.
  * **Ô 4**: Phong trào Xô Viết Nghệ Tĩnh.
  * **Ô 5**: Mặt trận Việt Minh.
* **Ô Dân 6 đến 10** (Hàng trên - Máy hoặc Người chơi 2 kiểm soát):
  * **Ô 6**: Cách mạng tháng Tám 1945.
  * **Ô 7**: Kháng chiến chống Pháp.
  * **Ô 8**: Kháng chiến chống Mỹ.
  * **Ô 9**: Đại thắng mùa Xuân 1975.
  * **Ô 10**: Công cuộc Đổi mới 1986.
* **Ô Quan Trái / Phải**:
  * Việt Nam thời kỳ hội nhập và phát triển.

### Luật Chơi Tích Hợp Đố Vui
1. Khi tới lượt, người chơi bốc sỏi ở một ô dân của mình gieo theo chiều xuôi hoặc ngược.
2. Nếu kết thúc ở ô trống và ô tiếp theo có sỏi, người chơi được ăn ô đó và kích hoạt **Câu hỏi Trắc nghiệm**:
   * **Trả lời ĐÚNG (trong 25 giây)**: Nhận điểm số của quân (+10 điểm cho ô thường, +20 điểm cho ô quan), cộng **10 điểm đố vui**, và được **nhận thêm lượt đi**.
   * **Trả lời SAI**: Bị **trừ 5 điểm đố vui**, các quân cờ vừa ăn được **trả về lại bàn cờ**, và người chơi **bị mất lượt** (lượt chuyển sang đối thủ).
3. Trận đấu kết thúc khi cả 2 ô quan đều trống. Kỳ thủ có tổng điểm cao nhất (Sỏi ăn được + Điểm đố vui) giành chiến thắng chung cuộc.

---

## 🛠️ Công Nghệ Sử Dụng

* **Frontend**: ReactJS (Vite), TypeScript, TailwindCSS, Framer Motion, Lucide Icons, Canvas Confetti.
* **Backend**: NodeJS, ExpressJS, Socket.IO.
* **Database**: PostgreSQL (SQL Driver `pg`).
* **Deployment**: Docker, Docker Compose.

---

## 📁 Cấu Trúc Thư Mục Monorepo

```
o-an-quan-history/
├── docker-compose.yml       # Cấu hình khởi chạy Docker toàn bộ hệ thống
├── .env.example             # Biến môi trường mẫu
├── README.md                # Tài liệu hướng dẫn sử dụng và deploy
├── backend/                 # Mã nguồn server NodeJS, Express & Socket.IO
│   ├── database/            # File khởi tạo database và dữ liệu mẫu (init.sql)
│   ├── src/
│   │   ├── config/          # Cấu hình database kết nối
│   │   ├── controllers/     # Controller xử lý auth, xếp hạng, lịch sử đấu
│   │   ├── middleware/      # Auth middleware xác thực JWT
│   │   ├── routes/          # Express Router endpoints
│   │   ├── services/        # Logic Game Engine & Thuật toán AI
│   │   ├── sockets/         # Lắng nghe socket.io phòng đấu & chat
│   │   └── index.ts         # Khởi động server API
│   ├── Dockerfile
│   └── package.json
└── frontend/                # Mã nguồn client React & Tailwind
    ├── src/
    │   ├── components/      # Bàn cờ Ô ăn quan, Sảnh chat, Modal Câu hỏi
    │   ├── context/         # AuthContext & SocketContext quản lý state
    │   ├── pages/           # Login, Register, Lobby, GameRoom, Profile, Leaderboard, StudyDocs
    │   ├── App.tsx          # Router và bảo vệ tuyến đường đăng nhập
    │   └── main.tsx
    ├── nginx.conf           # Cấu hình Nginx phục vụ SPA React Router
    ├── Dockerfile
    └── package.json
```

---

## 🐳 Hướng Dẫn Deploy Bằng Docker Compose (Chạy Ngay)

Yêu cầu máy chủ đã cài đặt **Docker** và **Docker Compose**.

### Các bước thực hiện:

1. **Clone repository này về máy chủ hoặc máy cá nhân**.
2. **Khởi chạy Docker Compose**:
   ```bash
   docker compose up -d
   ```
3. **Truy cập ứng dụng**:
   * Mở trình duyệt và truy cập: `http://localhost:3000` để chơi game.
   * API Server chạy tại: `http://localhost:5000`
   * Cơ sở dữ liệu Postgres khởi chạy tự động trên cổng `5432` và tự động chạy file `init.sql` để tạo bảng cũng như seed sẵn **44 câu hỏi trắc nghiệm Lịch sử Đảng** chất lượng cao.

Để dừng hệ thống:
```bash
docker compose down
```

---

## 🌐 Hướng Dẫn Deploy Lên Internet (Cloud Hosting)

Nếu không muốn chạy local, sinh viên có thể deploy trực tiếp lên các nền tảng đám mây miễn phí:

### Bước 1: Khởi Tạo Cơ Sở Dữ Liệu Trên Supabase (PostgreSQL)
1. Truy cập [Supabase](https://supabase.com/) và đăng ký tài khoản miễn phí.
2. Tạo một Project mới. Vào mục **SQL Editor** trong Dashboard.
3. Mở file [init.sql](file:///c:/FPT%20University/FPT_SU26/VNR202/OAnQuan_Spst/backend/database/init.sql), copy toàn bộ nội dung DDL và paste vào SQL Editor của Supabase rồi click **Run**.
4. Vào mục **Project Settings -> Database**, sao chép đường dẫn **Connection String** (URI format) để làm biến môi trường `DATABASE_URL`.

### Bước 2: Deploy Backend Lên Render (NodeJS & Socket.IO)
1. Đăng ký tài khoản trên [Render](https://render.com/).
2. Tạo mới một **Web Service**, liên kết với Github chứa repo của dự án.
3. Cấu hình thông tin build:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
4. Vào mục **Environment Variables** và nhập các biến sau:
   * `DATABASE_URL`: *Đường dẫn kết nối Supabase lấy ở Bước 1*
   * `JWT_SECRET`: *Một chuỗi ký tự bảo mật bất kỳ (VD: sinhvienfpt2026)*
   * `FRONTEND_URL`: `*` *(Hoặc đường dẫn Vercel của Frontend sau khi deploy)*
5. Click **Deploy**. Sao chép URL của Web Service (VD: `https://o-an-quan-backend.onrender.com`).

### Bước 3: Deploy Frontend Lên Vercel (ReactJS)
1. Đăng ký tài khoản trên [Vercel](https://vercel.com/).
2. Click **Add New -> Project**, chọn Github chứa repo dự án.
3. Cấu hình thông tin build:
   * **Root Directory**: `frontend`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Vào mục **Environment Variables** (Biến môi trường) và thêm:
   * `VITE_API_URL`: *URL của Backend Render lấy ở Bước 2*
5. Click **Deploy**. Nhận link sản phẩm để gửi cho thầy cô và bạn bè chơi ngay!

---

## 📡 Tài Liệu API (API Documentation)

### 1. Xác thực (Authentication)
* **Đăng ký tài khoản**: `POST /api/auth/register`
  * Payload: `{ "name": "...", "email": "...", "password": "..." }`
* **Đăng nhập**: `POST /api/auth/login`
  * Payload: `{ "email": "...", "password": "..." }`
* **Lấy thông tin cá nhân & Thành tích**: `GET /api/auth/me` (Yêu cầu Header `Authorization: Bearer <TOKEN>`)

### 2. Xếp hạng (Leaderboards)
* **Lấy danh sách bảng xếp hạng**: `GET /api/leaderboard`
  * Trả về: Bảng xếp hạng Điểm số, Bảng xếp hạng Trận thắng, Bảng xếp hạng Thành tích.
* **Lấy danh mục danh hiệu**: `GET /api/leaderboard/achievements-list`

### 3. Lịch sử đấu (Matches)
* **Lấy lịch sử đấu cá nhân**: `GET /api/matches/history` (Yêu cầu Header `Authorization: Bearer <TOKEN>`)

### 4. Tư liệu học tập (Study Materials)
* **Lấy toàn bộ tư liệu 11 chương**: `GET /api/materials`
* **Lấy chi tiết 1 chương cụ thể**: `GET /api/materials/:chapter`
