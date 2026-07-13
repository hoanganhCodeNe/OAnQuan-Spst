# CÁC SƠ ĐỒ THIẾT KẾ HỆ THỐNG (SYSTEM DIAGRAMS)

Tài liệu này cung cấp các sơ đồ thiết kế hệ thống bao gồm: **Sơ đồ thực thể quan hệ (ERD)**, **Sơ đồ ca sử dụng (Use Case Diagram)** và **Sơ đồ lớp (Class Diagram)** của dự án **Hành Trình Độc Lập**.

---

## 1. Sơ đồ Thực thể Quan hệ (Entity Relationship Diagram - ERD)

Sơ đồ ERD thể hiện mối quan hệ giữa các bảng trong cơ sở dữ liệu PostgreSQL.

```mermaid
erDiagram
    USERS {
        uuid id PK "Khóa chính tự sinh (UUID)"
        string name "Họ và tên người dùng"
        string email UK "Email đăng nhập duy nhất"
        string password "Mật khẩu đã được mã hóa bcrypt"
        int total_score "Tổng điểm tích lũy xếp hạng"
        string avatar "Tên avatar (mặc định: default)"
        timestamp created_at "Ngày giờ khởi tạo"
    }

    ROOMS {
        uuid id PK "Khóa chính"
        string room_code UK "Mã phòng 6 ký tự viết hoa"
        string status "waiting | playing | finished"
        uuid host_id FK "Chủ phòng (liên kết USERS)"
        uuid guest_id FK "Người chơi thứ 2 (liên kết USERS)"
    }

    MATCHES {
        uuid id PK "Khóa chính trận đấu"
        uuid player1_id FK "Người chơi 1 (liên kết USERS)"
        uuid player2_id FK "Người chơi 2 (liên kết USERS - Null nếu là AI)"
        string player1_name "Tên hiển thị người chơi 1"
        string player2_name "Tên hiển thị người chơi 2"
        uuid winner_id FK "ID người chiến thắng (Null nếu hòa)"
        string winner_name "Tên hiển thị người chiến thắng"
        string mode "pvp | ai_easy | ai_medium | ai_hard"
        int p1_score "Điểm số cuối cùng của người chơi 1"
        int p2_score "Điểm số cuối cùng của người chơi 2"
        timestamp created_at "Ngày giờ kết thúc trận"
    }

    QUESTIONS {
        int id PK "Khóa chính tự tăng"
        int chapter "Chương lịch sử (1 đến 11)"
        text content "Nội dung câu hỏi trắc nghiệm"
        string option_a "Lựa chọn A"
        string option_b "Lựa chọn B"
        string option_c "Lựa chọn C"
        string option_d "Lựa chọn D"
        char correct_answer "Đáp án đúng (A | B | C | D)"
        text explanation "Lời giải thích sự kiện lịch sử chi tiết"
        string image_url "Đường dẫn ảnh minh họa (nếu có)"
    }

    ACHIEVEMENTS {
        int id PK "Khóa chính danh hiệu"
        string title "Tên danh hiệu"
        string description "Mô tả điều kiện đạt danh hiệu"
        string badge_icon "Tên icon hiển thị (shield | award | flag | crown)"
    }

    USER_ACHIEVEMENTS {
        uuid user_id PK,FK "Liên kết người dùng"
        int achievement_id PK,FK "Liên kết danh hiệu"
        timestamp unlocked_at "Ngày giờ mở khóa"
    }

    USERS ||--o{ MATCHES : "chơi"
    USERS ||--o{ ROOMS : "tạo/vào"
    USERS ||--o{ USER_ACHIEVEMENTS : "đạt được"
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : "trao cho"
```

---

## 2. Sơ đồ Ca sử dụng (Use Case Diagram)

Sơ đồ ca sử dụng mô tả các chức năng mà người học viên (Player) và hệ thống máy (AI Agent) tương tác với hệ thống.

```mermaid
usecaseDiagram
    actor Player as "Học viên (Người chơi)"
    actor AI as "Hệ thống AI (Máy)"

    rectangle "Hành Trình Độc Lập - Ô Ăn Quan Lịch Sử Đảng" {
        usecase UC_Auth as "Đăng nhập / Đăng ký tài khoản"
        usecase UC_Lobby as "Quản lý sảnh chờ (Lobby)"
        usecase UC_PlayAI as "Chơi với Máy (AI Easy/Medium/Hard)"
        usecase UC_PlayPVP as "Chơi Online với bạn bè (Tạo/Nhập mã phòng)"
        usecase UC_Board as "Tương tác bàn cờ Ô ăn quan (Gieo sỏi)"
        usecase UC_Answer as "Trả lời đố vui lịch sử"
        usecase UC_Chat as "Trò chuyện realtime"
        usecase UC_Leaderboard as "Xem bảng xếp hạng học tập"
        usecase UC_Study as "Tra cứu tư liệu Lịch sử Đảng"
        usecase UC_Profile as "Xem hồ sơ & Tiến trình thành tích"
    }

    Player --> UC_Auth
    Player --> UC_Lobby
    Player --> UC_PlayAI
    Player --> UC_PlayPVP
    Player --> UC_Board
    Player --> UC_Answer
    Player --> UC_Chat
    Player --> UC_Leaderboard
    Player --> UC_Study
    Player --> UC_Profile

    UC_PlayAI --> AI : "Tương tác mô phỏng lượt"
```

---

## 3. Sơ đồ Lớp (Class Diagram - Game State & Engine)

Sơ đồ lớp mô tả cấu trúc dữ liệu và các phương thức xử lý logic bàn cờ, gieo sỏi, tính điểm và AI trong Game Engine ở phía Backend.

```mermaid
classDiagram
    class MatchEngine {
        +string matchId
        +string mode
        +Player player1
        +Player player2
        +BoardState board
        +string currentTurn
        +PendingQuiz pendingQuiz
        +List~string~ gameLog
        +initializeBoard()
        +makeMove(string playerKey, int holeIndex, string direction) Promise~boolean~
        +processQuizAnswer(string answer) QuizResult
        +handleOutOfStones()
        +checkGameOver() boolean
        -triggerQuiz(int playerIndex, int chapter, int stonesCount, List~CapturedHoleInfo~ holes)
        -switchTurn()
    }

    class BoardState {
        +List~Hole~ holes
        +isGameOver() boolean
        +collectRemainingStones()
    }

    class Hole {
        +int stones
        +boolean isMandarin
    }

    class Player {
        +string id
        +string name
        +int stonesCaptured
        +int quizPoints
        +List~int~ unlockedChapters
    }

    class PendingQuiz {
        +int playerIndex
        +int chapter
        +int questionId
        +string questionContent
        +string correctAnswer
        +int capturedStones
        +List~CapturedHoleInfo~ capturedHoles
    }

    class AIEngine {
        +calculateMove(MatchState state) AIMove
        +simulateQuizAnswer(string mode) boolean
        -minimax(Board board, int depth, boolean isMax, int alpha, int beta) int
        -evaluateBoard(Board board) int
    }

    MatchEngine *-- BoardState : "quản lý"
    BoardState *-- Hole : "chứa 12 ô cờ"
    MatchEngine *-- Player : "chứa 2 người chơi"
    MatchEngine *-- PendingQuiz : "có thể có"
    MatchEngine --> AIEngine : "truy vấn bước đi của máy"
```
