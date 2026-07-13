-- DDL for "Hành Trình Độc Lập - Ô Ăn Quan Lịch Sử Đảng"

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    total_score INT DEFAULT 0,
    avatar VARCHAR(255) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    chapter INT NOT NULL, -- 1 to 11 (1-10 for Citizen holes, 11 for Mandarin holes)
    content TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
    explanation TEXT NOT NULL,
    image_url VARCHAR(255)
);

-- Achievements Table
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    badge_icon VARCHAR(50) NOT NULL
);

-- User Achievements Table
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INT REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- Matches Table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player1_id UUID REFERENCES users(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES users(id) ON DELETE SET NULL,
    player1_name VARCHAR(100) NOT NULL,
    player2_name VARCHAR(100) NOT NULL,
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    winner_name VARCHAR(100),
    mode VARCHAR(20) NOT NULL, -- 'pvp', 'ai_easy', 'ai_medium', 'ai_hard'
    p1_score INT DEFAULT 0,
    p2_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Achievements
INSERT INTO achievements (title, description, badge_icon) VALUES
('Tân Binh Lịch Sử', 'Hoàn thành trận đấu đầu tiên chống lại Máy hoặc Người chơi khác.', 'shield'),
('Nhà Cách Mạng', 'Đạt tổng số điểm 100 trong hệ thống xếp hạng.', 'award'),
('Anh Hùng Dân Tộc', 'Chiến thắng 10 trận đấu ở bất kỳ chế độ nào.', 'flag'),
('Huyền Thoại Lịch Sử', 'Chiến thắng Máy ở cấp độ Khó (Hard AI).', 'crown');

-- Seed Questions (4 questions per chapter for 11 chapters = 44 questions)
-- Chapter 1: Bối cảnh Việt Nam trước năm 1930
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(1, 'Thực dân Pháp nổ súng xâm lược Việt Nam vào năm nào và ở đâu?', '1858 tại Đà Nẵng', '1873 tại Hà Nội', '1867 tại Nam Kỳ', '1884 tại Huế', 'A', 'Thực dân Pháp nổ súng xâm lược Việt Nam ngày 1/9/1858 tại bán đảo Sơn Trà, Đà Nẵng, mở đầu quá trình xâm lược nước ta.'),
(1, 'Chính sách khai thác thuộc địa lần thứ nhất của thực dân Pháp tập trung chủ yếu vào ngành nào?', 'Phát triển công nghiệp nặng và chế tạo', 'Khai thác mỏ (đặc biệt là than đá) và cướp đoạt ruộng đất', 'Xuất khẩu thủ công mỹ nghệ', 'Phát triển công nghệ thông tin', 'B', 'Cuộc khai thác thuộc địa lần thứ nhất (1897-1914) tập trung vào khai thác khoáng sản (đặc biệt là than đá tại Quảng Ninh) và cướp đoạt ruộng đất lập đồn điền.'),
(1, 'Dưới tác động của cuộc khai thác thuộc địa của Pháp, giai cấp mới nào được hình thành ở Việt Nam?', 'Giai cấp Nông dân và Địa chủ', 'Giai cấp Công nhân và Tiểu tư sản', 'Giai cấp Phong kiến và Quý tộc', 'Giai cấp Tăng lữ và Thần học', 'B', 'Cơ cấu xã hội Việt Nam biến đổi sâu sắc với sự xuất hiện của các giai cấp mới là giai cấp Công nhân, Tiểu tư sản và Tư sản dân tộc.'),
(1, 'Tổ chức cách mạng "Việt Nam Quang phục Hội" gắn liền với nhà yêu nước nào?', 'Phan Bội Châu', 'Phan Châu Trinh', 'Nguyễn Thái Học', 'Hoàng Hoa Thám', 'A', 'Phan Bội Châu thành lập Việt Nam Quang phục Hội năm 1912 tại Quảng Châu (Trung Quốc) với tôn chỉ đánh đuổi thực dân Pháp, khôi phục nước Việt Nam.');

-- Chapter 2: Nguyễn Ái Quốc tìm đường cứu nước
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(2, 'Nguyễn Ái Quốc ra đi tìm đường cứu nước vào ngày tháng năm nào, từ bến cảng nào?', '05/06/1911 tại Cảng Nhà Rồng', '19/05/1890 tại Cảng Hải Phòng', '02/09/1945 tại Quảng trường Ba Đình', '03/02/1930 tại Cảng Đà Nẵng', 'A', 'Ngày 5/6/1911, từ Cảng Nhà Rồng (Sài Gòn), Nguyễn Tất Thành lấy tên là Văn Ba lên tàu Đô đốc Latouche-Tréville ra đi tìm đường cứu nước.'),
(2, 'Sự kiện nào đánh dấu bước ngoặt quyết định trong cuộc đời hoạt động của Nguyễn Ái Quốc từ chủ nghĩa yêu nước đến chủ nghĩa cộng sản?', 'Gửi Bản yêu sách của nhân dân An Nam đến Hội nghị Versailles (1919)', 'Đọc Luận cương của Lênin về vấn đề dân tộc và thuộc địa (7/1920) và biểu quyết tán thành Quốc tế III tại Đại hội Tua (12/1920)', 'Thành lập Hội Việt Nam Cách mạng Thanh niên (1925)', 'Viết tác phẩm Đường Kách Mệnh (1927)', 'B', 'Việc đọc Luận cương của Lênin và biểu quyết tán thành Quốc tế thứ ba, tham gia sáng lập Đảng Cộng sản Pháp vào tháng 12/1920 đánh dấu việc Người tìm ra con đường giải phóng dân tộc.'),
(2, 'Tác phẩm nào của Nguyễn Ái Quốc xuất bản năm 1927 đóng vai trò chuẩn bị lý luận quan trọng cho sự ra đời của Đảng?', 'Bản án chế độ thực dân Pháp', 'Đường Kách mệnh', 'Nhật ký trong tù', 'Tuyên ngôn Độc lập', 'B', 'Tác phẩm "Đường Kách mệnh" (1927) là cuốn sách tập hợp các bài giảng của Nguyễn Ái Quốc tại các lớp huấn luyện chính trị ở Quảng Châu, đóng vai trò truyền bá chủ nghĩa Mác-Lênin vào Việt Nam.'),
(2, 'Tổ chức tiền thân của Đảng Cộng sản Việt Nam do Nguyễn Ái Quốc thành lập vào tháng 6/1925 là gì?', 'Tân Việt Cách mạng Đảng', 'Việt Nam Quốc dân Đảng', 'Hội Việt Nam Cách mạng Thanh niên', 'Đông Dương Cộng sản Đảng', 'C', 'Tháng 6/1925, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên tại Quảng Châu (Trung Quốc) để chuẩn bị về tổ chức và nhân sự cho Đảng.');

-- Chapter 3: Thành lập Đảng Cộng sản Việt Nam
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(3, 'Hội nghị thành lập Đảng Cộng sản Việt Nam diễn ra tại đâu, bắt đầu từ ngày nào?', 'Hương Cảng (Hồng Kông) từ ngày 06/01/1930', 'Hà Nội từ ngày 03/02/1930', 'Quảng Châu từ ngày 19/05/1930', 'Cao Bằng từ ngày 28/01/1941', 'A', 'Hội nghị hợp nhất các tổ chức cộng sản diễn ra từ ngày 6/1/1930 đến ngày 7/2/1930 tại bán đảo Cửu Long, Hương Cảng (Hồng Kông) dưới sự chủ trì của Nguyễn Ái Quốc.'),
(3, 'Tại Hội nghị thành lập Đảng (1930), các tổ chức cộng sản nào đã hợp nhất để lập nên Đảng Cộng sản Việt Nam?', 'Đông Dương Cộng sản Đảng, An Nam Cộng sản Đảng và Đông Dương Cộng sản Liên đoàn', 'Việt Nam Quốc dân Đảng và Hội Việt Nam Cách mạng Thanh niên', 'Tân Việt Cách mạng Đảng và Đông Dương Cộng sản Liên đoàn', 'Đông Dương Cộng sản Đảng và An Nam Cộng sản Đảng', 'A', 'Ba tổ chức cộng sản được hợp nhất gồm: Đông Dương Cộng sản Đảng, An Nam Cộng sản Đảng và sau đó là Đông Dương Cộng sản Liên đoàn.'),
(3, 'Văn kiện nào được coi là Cương lĩnh chính trị đầu tiên của Đảng do Nguyễn Ái Quốc soạn thảo?', 'Luận cương chính trị của Trần Phú', 'Chính cương vắn tắt, Sách lược vắn tắt của Đảng', 'Đường Kách mệnh', 'Tuyên ngôn của Đảng Cộng sản', 'B', 'Chính cương vắn tắt, Sách lược vắn tắt, Chương trình tóm tắt và Thể lệ vắn tắt do Nguyễn Ái Quốc soạn thảo chính là Cương lĩnh chính trị đầu tiên của Đảng.'),
(3, 'Hội nghị Trung ương Đảng lần thứ nhất (10/1930) đã quyết định đổi tên Đảng Cộng sản Việt Nam thành gì và cử ai làm Tổng Bí thư đầu tiên?', 'Đảng Cộng sản Đông Dương, Tổng Bí thư Trần Phú', 'Đảng Lao động Việt Nam, Tổng Bí thư Trường Chinh', 'Đảng Cộng sản Việt Nam, Tổng Bí thư Nguyễn Văn Cừ', 'Đảng Cộng sản Đông Dương, Tổng Bí thư Lê Hồng Phong', 'A', 'Hội nghị tháng 10/1930 tại Hương Cảng đã thông qua Luận cương chính trị, quyết định đổi tên Đảng thành Đảng Cộng sản Đông Dương và bầu đồng chí Trần Phú làm Tổng Bí thư đầu tiên.');

-- Chapter 4: Phong trào Xô Viết Nghệ Tĩnh
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(4, 'Đỉnh cao của phong trào cách mạng 1930-1931 là sự kiện nào?', 'Cuộc bãi công của công nhân Ba Son', 'Sự thành lập chính quyền Xô viết ở Nghệ An và Hà Tĩnh', 'Cuộc khởi nghĩa Bắc Sơn', 'Chiến dịch Biên giới Thu Đông', 'B', 'Đỉnh cao của phong trào 1930-1931 là phong trào đấu tranh của quần chúng nông dân ở Nghệ An và Hà Tĩnh, thiết lập nên chính quyền tự quản kiểu Xô viết tại các xã thôn.'),
(4, 'Chính quyền Xô viết Nghệ Tĩnh đã thực hiện chính sách tiến bộ nào về ruộng đất cho nhân dân?', 'Bán ruộng đất cho địa chủ', 'Tịch thu ruộng đất của thực dân, địa chủ phản động chia cho dân cày nghèo', 'Cho thuê ruộng đất với giá rẻ', 'Quản lý toàn bộ ruộng đất tập trung không chia cho ai', 'B', 'Chính quyền Xô viết đã thực hiện xóa bỏ thuế thân, tịch thu ruộng đất của địa chủ phản động và ruộng đất công chia cho dân cày nghèo, thực hiện quyền tự do dân chủ.'),
(4, 'Sự kiện lịch sử nào vào ngày 12/9/1930 được coi là đỉnh cao đấu tranh bạo lực cách mạng của nông dân Hưng Nguyên (Nghệ An)?', 'Cuộc biểu tình của 8.000 nông dân bị thực dân Pháp cho máy bay ném bom thảm sát', 'Cuộc chiếm đồn lính Pháp ở Vinh', 'Cuộc bãi công của nhà máy Trường Thi', 'Thành lập Chi bộ Đảng đầu tiên', 'A', 'Ngày 12/9/1930, cuộc biểu tình khổng lồ của nông dân huyện Hưng Nguyên đã bị Pháp cho máy bay ném bom tàn sát dã man, làm chết 217 người, thổi bùng lên ngọn lửa đấu tranh quyết liệt.'),
(4, 'Phong trào Xô viết Nghệ Tĩnh mang ý nghĩa lịch sử gì đối với Cách mạng tháng Tám?', 'Là cuộc tổng diễn tập đầu tiên chuẩn bị cho Cách mạng tháng Tám 1945', 'Là bước kết thúc thắng lợi cuộc kháng chiến chống Pháp', 'Là mốc đánh dấu sự ra đời của Mặt trận Việt Minh', 'Là chiến dịch quân sự lớn nhất trước 1945', 'A', 'Phong trào cách mạng 1930-1931 mà đỉnh cao là Xô viết Nghệ Tĩnh được khẳng định là cuộc tổng diễn tập đầu tiên của Đảng và nhân dân ta chuẩn bị cho thắng lợi của Cách mạng tháng Tám.');

-- Chapter 5: Mặt trận Việt Minh
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(5, 'Nguyễn Ái Quốc trở về nước trực tiếp chỉ đạo cách mạng sau 30 năm bôn ba vào ngày tháng năm nào?', '28/01/1941 tại cột mốc 108 (Cao Bằng)', '03/02/1930 tại Hồng Kông', '19/08/1945 tại Hà Nội', '02/09/1945 tại Quảng trường Ba Đình', 'A', 'Ngày 28/01/1941 (tức mùng 2 Tết Tân Tỵ), Nguyễn Ái Quốc vượt biên giới Việt - Trung tại cột mốc 108 (nay là mốc 108 cũ tại Hà Quảng, Cao Bằng) để trở về nước trực tiếp lãnh đạo cách mạng.'),
(5, 'Hội nghị Trung ương lần thứ 8 của Đảng (5/1941) chủ trì bởi Nguyễn Ái Quốc đã quyết định thành lập tổ chức mặt trận nào?', 'Mặt trận Liên Việt', 'Mặt trận Dân chủ Đông Dương', 'Việt Nam Độc lập Đồng minh (Việt Minh)', 'Mặt trận Tổ quốc Việt Nam', 'C', 'Hội nghị lần thứ 8 Ban Chấp hành Trung ương Đảng họp tại Pác Bó (Cao Bằng) vào tháng 5/1941 đã quyết định thành lập Mặt trận Việt Nam Độc lập Đồng minh, gọi tắt là Mặt trận Việt Minh.'),
(5, 'Chủ trương chiến lược hàng đầu của Đảng tại Hội nghị Trung ương 8 (5/1941) là gì?', 'Thực hiện cải cách ruộng đất triệt để', 'Đặt nhiệm vụ giải phóng dân tộc lên trên hết, trước hết', 'Tập trung phát triển kinh tế tư bản tư nhân', 'Liên minh toàn diện với chính quyền thực dân Pháp', 'B', 'Hội nghị Trung ương 8 khẳng định nhiệm vụ trước hết của cách mạng Đông Dương lúc này là giải phóng dân tộc, đặt quyền lợi của dân tộc lên trên hết.'),
(5, 'Đội Việt Nam Tuyên truyền Giải phóng quân (tiền thân của Quân đội nhân dân Việt Nam) được thành lập vào ngày nào và do ai chỉ huy?', '22/12/1944 do Võ Nguyên Giáp chỉ huy', '15/05/1941 do Phùng Chí Kiên chỉ huy', '19/08/1945 do Văn Tiến Dũng chỉ huy', '02/09/1945 do Hồ Chí Minh chỉ huy', 'A', 'Ngày 22/12/1944, Đội Việt Nam Tuyên truyền Giải phóng quân được thành lập tại một khu rừng ở huyện Nguyên Bình (Cao Bằng), gồm 34 chiến sĩ, do đồng chí Võ Nguyên Giáp trực tiếp chỉ huy.');

-- Chapter 6: Cách mạng tháng Tám 1945
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(6, 'Chỉ thị nổi tiếng nào của Ban Thường vụ Trung ương Đảng ra đời ngay sau khi Nhật đảo chính Pháp (3/1945)?', 'Sửa đổi lối làm việc', 'Nhật - Pháp bắn nhau và hành động của chúng ta', 'Toàn dân kháng chiến', 'Kháng chiến kiến quốc', 'B', 'Ngày 12/3/1945, Ban Thường vụ Trung ương Đảng ra chỉ thị "Nhật - Pháp bắn nhau và hành động của chúng ta", xác định kẻ thù duy nhất và trước mắt của nhân dân Đông Dương lúc này là phát xít Nhật.'),
(6, 'Ủy ban Khởi nghĩa toàn quốc đã phát đi Quân lệnh số 1 phát lệnh Tổng khởi nghĩa vào thời gian nào?', 'Đêm 13/08/1945', 'Sáng 19/08/1945', 'Trưa 25/08/1945', 'Chiều 02/09/1945', 'A', 'Ngay sau khi nghe tin Nhật đầu hàng Đồng minh, Ủy ban Khởi nghĩa toàn quốc họp tại Tân Trào và phát đi Quân lệnh số 1 phát lệnh Tổng khởi nghĩa trong cả nước vào đêm 13/8/1945.'),
(6, 'Cách mạng tháng Tám giành thắng lợi ở thủ đô Hà Nội vào ngày nào?', '19/08/1945', '23/08/1945', '25/08/1945', '30/08/1945', 'A', 'Ngày 19/08/1945, hàng vạn người dân Hà Nội mít tinh tại Quảng trường Nhà hát Lớn chuyển thành biểu tình vũ trang chiếm các công sở chính quyền bù nhìn, giành thắng lợi hoàn toàn ở Hà Nội.'),
(6, 'Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa tại đâu, vào ngày nào?', 'Quảng trường Ba Đình, Hà Nội ngày 02/09/1945', 'Nhà hát Lớn, Hà Nội ngày 19/08/1945', 'Cung đình Huế ngày 30/08/1945', 'Dinh Độc Lập, Sài Gòn ngày 30/04/1975', 'A', 'Chiều ngày 2/9/1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc Tuyên ngôn Độc lập, tuyên bố nước Việt Nam độc lập và thành lập nước VNDCCH.');

-- Chapter 7: Kháng chiến chống Pháp
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(7, 'Lời kêu gọi Toàn quốc kháng chiến của Chủ tịch Hồ Chí Minh được phát đi vào ngày tháng năm nào?', '19/12/1946', '23/09/1945', '19/12/1947', '02/09/1946', 'A', 'Đêm 19/12/1946, Chủ tịch Hồ Chí Minh ra Lời kêu gọi Toàn quốc kháng chiến sau khi Pháp gửi tối hậu thư đòi ta giao nộp vũ khí.'),
(7, 'Đường lối kháng chiến chống thực dân Pháp của Đảng ta được xác định là gì?', 'Đánh nhanh thắng nhanh, dựa vào viện trợ quốc tế', 'Toàn dân, toàn diện, trường kỳ và tự lực cánh sinh', 'Kháng chiến đi đôi với đàm phán hòa bình ngay từ đầu', 'Tập trung đấu tranh ngoại giao tại Liên Hợp Quốc', 'B', 'Đường lối kháng chiến chống Pháp được nêu rõ trong tác phẩm "Kháng chiến nhất định thắng lợi" của Trường Chinh là: Toàn dân, toàn diện, trường kỳ và tự lực cánh sinh.'),
(7, 'Chiến dịch quân sự nào trong kháng chiến chống Pháp được ta chủ động mở nhằm khai thông biên giới Việt - Trung và phá thế bao vây?', 'Chiến dịch Việt Bắc Thu Đông 1947', 'Chiến dịch Biên giới Thu Đông 1950', 'Chiến dịch Hòa Bình 1951', 'Chiến dịch Điện Biên Phủ 1954', 'B', 'Chiến dịch Biên giới Thu Đông 1950 là chiến dịch ta chủ động mở nhằm tiêu diệt một bộ phận sinh lực địch, khai thông biên giới Việt - Trung để nhận viện trợ quốc tế, mở rộng căn cứ địa Việt Bắc.'),
(7, 'Chiến thắng vang dội nào đã "lừng lẫy năm châu, chấn động địa cầu", buộc Pháp phải ký Hiệp định Giơ-ne-vơ năm 1954?', 'Chiến dịch Điện Biên Phủ', 'Trận đèo Bông Lau', 'Chiến dịch Tây Bắc', 'Trận Điện Biên Phủ trên không', 'A', 'Chiến thắng Điện Biên Phủ lịch sử (kết thúc ngày 7/5/1954 sau 56 ngày đêm khoét núi ngủ hầm) đã đập tan tập đoàn cứ điểm mạnh nhất của Pháp ở Đông Dương.');

-- Chapter 8: Kháng chiến chống Mỹ
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(8, 'Nghị quyết Trung ương lần thứ 15 (1959) có vai trò lịch sử quan trọng thế nào đối với miền Nam?', 'Chỉ đạo đàm phán Hiệp định Paris', 'Cho phép nhân dân miền Nam sử dụng bạo lực cách mạng để tự giải phóng', 'Quyết định thực hiện chiến dịch tiến công đường bộ lớn', 'Khai thông tuyến đường vận tải Hồ Chí Minh trên biển', 'B', 'Hội nghị Trung ương 15 (khóa II) đầu năm 1959 xác định con đường phát triển của cách mạng miền Nam là khởi nghĩa giành chính quyền về tay nhân dân bằng con đường bạo lực cách mạng.'),
(8, 'Phong trào đấu tranh tiêu biểu nào bùng nổ ở Bến Tre vào năm 1960 rồi lan rộng khắp miền Nam?', 'Phong trào Đồng khởi', 'Phong trào Ba sẵn sàng', 'Phong trào Phá ấp chiến lược', 'Phong trào đấu tranh Phật giáo', 'A', 'Phong trào "Đồng khởi" bắt đầu từ các xã của huyện Mỏ Cày (Bến Tre) tháng 1/1960 đã nhanh chóng lan tỏa mạnh mẽ, phá vỡ hệ thống kìm kẹp của Mỹ - Diệm ở nông thôn.'),
(8, 'Chiến dịch oanh liệt nào vào cuối năm 1972 tại Hà Nội và Hải Phòng được ví như trận "Điện Biên Phủ trên không"?', 'Chiến dịch Quảng Trị', 'Đấu tranh đánh bại cuộc tập kích bằng B-52 của Mỹ trong 12 ngày đêm', 'Chiến dịch Đường 9 - Khe Sanh', 'Chiến dịch Mậu Thân 1968', 'B', 'Cuộc chiến đấu chống tập kích chiến lược bằng máy bay B-52 của Mỹ vào Hà Nội và Hải Phòng cuối tháng 12/1972 đã đập tan uy thế không quân Mỹ, buộc Mỹ ký Hiệp định Paris ngày 27/1/1973.'),
(8, 'Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết vào ngày tháng năm nào?', '27/01/1973', '30/04/1975', '21/07/1954', '02/09/1973', 'A', 'Hiệp định Paris được ký kết ngày 27/1/1973 tại Paris (Pháp) sau gần 5 năm đàm phán gay gắt, buộc quân đội Mỹ và đồng minh phải rút khỏi miền Nam Việt Nam.');

-- Chapter 9: Đại thắng mùa Xuân 1975
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(9, 'Địa bàn nào được Bộ Chính trị chọn làm hướng tiến công chiến lược mở màn cho Tổng tiến công và nổi dậy mùa Xuân 1975?', 'Tây Nguyên (trọng điểm Buôn Ma Thuột)', 'Trị Thiên - Huế', 'Sài Gòn - Gia Định', 'Đà Nẵng', 'A', 'Tây Nguyên được chọn làm hướng tiến công chiến lược chủ yếu trong năm 1975. Trận mở màn Buôn Ma Thuột (10/3/1975) giành thắng lợi giòn giã, tạo thế chẻ tre cho quân ta.'),
(9, 'Chiến dịch giải phóng Sài Gòn - Gia Định được Bộ Chính trị quyết định đổi tên thành "Chiến dịch Hồ Chí Minh" vào ngày nào?', '14/04/1975', '26/04/1975', '30/04/1975', '10/03/1975', 'A', 'Ngày 14/4/1975, Bộ Chính trị gửi bức điện mật đồng ý đặt tên cho chiến dịch giải phóng Sài Gòn - Gia Định là Chiến dịch Hồ Chí Minh.'),
(9, 'Vào lúc mấy giờ ngày 30/4/1975, lá cờ cách mạng được cắm trên nóc Dinh Độc Lập, đánh dấu Chiến dịch Hồ Chí Minh toàn thắng?', '11 giờ 30 phút', '09 giờ 00 phút', '17 giờ 30 phút', '24 giờ 00 phút', 'A', 'Vào lúc 11 giờ 30 phút ngày 30/4/1975, xe tăng của quân giải phóng húc đổ cổng Dinh Độc Lập, cắm cờ giải phóng lên nóc dinh, Tổng thống Dương Văn Minh tuyên bố đầu hàng không điều kiện.'),
(9, 'Ý nghĩa lớn nhất của cuộc Đại thắng mùa Xuân 1975 là gì?', 'Giải phóng hoàn toàn miền Nam, thống nhất đất nước, đưa cả nước đi lên CNXH', 'Hoàn thành cuộc cách mạng ruộng đất trên phạm vi cả nước', 'Thiết lập mối quan hệ ngoại giao với Mỹ', 'Giúp đỡ nước bạn Lào và Campuchia giành độc lập', 'A', 'Đại thắng mùa Xuân 1975 đã chấm dứt vĩnh viễn ách thống trị của chủ nghĩa thực dân, đế quốc ở nước ta, giải phóng hoàn toàn miền Nam, thống nhất non sông đất nước.');

-- Chapter 10: Công cuộc Đổi mới 1986
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(10, 'Đại hội đại biểu toàn quốc lần thứ mấy của Đảng (12/1986) đã khởi xướng đường lối Đổi mới toàn diện đất nước?', 'Đại hội VI', 'Đại hội V', 'Đại hội VII', 'Đại hội VIII', 'A', 'Đại hội đại biểu toàn quốc lần thứ VI của Đảng họp tại Hà Nội từ ngày 15 đến 18/12/1986 đã đề ra đường lối đổi mới toàn diện, mở ra bước ngoặt lịch sử cho đất nước.'),
(10, 'Nội dung cốt lõi của đường lối đổi mới về kinh tế do Đại hội VI (1986) đề ra là gì?', 'Xây dựng kinh tế kế hoạch hóa tập trung, quan liêu, bao cấp', 'Phát triển nền kinh tế hàng hóa nhiều thành phần vận động theo cơ chế thị trường có sự quản lý của Nhà nước', 'Tập trung toàn lực phát triển công nghiệp nặng', 'Cấm hoàn toàn các hoạt động thương mại tư nhân', 'B', 'Nội dung cốt lõi về đổi mới kinh tế là chuyển từ mô hình kinh tế kế hoạch hóa tập trung bao cấp sang nền kinh tế hàng hóa nhiều thành phần (kinh tế thị trường định hướng XHCN).'),
(10, 'Chính sách phát triển kinh tế nào được xác định là khâu đột phá thiết thực nhất trong những năm đầu Đổi mới (Nghị quyết số 10 của Bộ Chính trị khóa VI)?', 'Khoán sản phẩm đến nhóm và người lao động trong nông nghiệp (Khoán 10)', 'Thành lập các đặc khu kinh tế ven biển', 'Cơ chế giá - lương - tiền', 'Phát triển thị trường chứng khoán', 'A', 'Nghị quyết số 10-NQ/TW của Bộ Chính trị ngày 5/4/1988 về đổi mới quản lý kinh tế nông nghiệp (Khoán 10) đã thừa nhận hộ nông dân là đơn vị kinh tế tự chủ, tạo động lực cực lớn cho sản xuất lương thực.'),
(10, 'Khẩu hiệu nổi tiếng thể hiện tinh thần nhìn thẳng vào sự thật của Đại hội VI (1986) là gì?', 'Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật', 'Không có gì quý hơn độc lập tự do', 'Đổi mới hay là chết', 'Đoàn kết, đoàn kết, đại đoàn kết', 'A', 'Đại hội VI thể hiện tinh thần phê bình nghiêm túc: "Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật", chỉ ra những sai lầm chủ quan, duy ý chí trước đổi mới.');

-- Chapter 11 (Mandarin Holes): Việt Nam thời kỳ hội nhập và phát triển
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(11, 'Việt Nam chính thức gia nhập Tổ chức Thương mại Thế giới (WTO) vào năm nào?', '2007', '1995', '2000', '2015', 'A', 'Việt Nam chính thức trở thành thành viên thứ 150 của Tổ chức Thương mại Thế giới (WTO) vào ngày 11/01/2007 sau 11 năm đàm phán.'),
(11, 'Sự kiện ngoại giao nổi bật nào diễn ra vào năm 1995 đánh dấu bước chuyển lớn trong quan hệ quốc tế của Việt Nam?', 'Bình thường hóa quan hệ ngoại giao Việt - Mỹ và gia nhập Hiệp hội các quốc gia Đông Nam Á (ASEAN)', 'Việt Nam gia nhập Liên Hợp Quốc', 'Ký kết Hiệp định Đối tác Toàn diện với Liên minh Châu Âu', 'Tham gia lực lượng giữ gìn hòa bình Liên Hợp Quốc', 'A', 'Tháng 7/1995, Việt Nam chính thức bình thường hóa quan hệ ngoại giao với Mỹ và gia nhập ASEAN, mở ra chương mới trong hội nhập khu vực và toàn cầu.'),
(11, 'Tại Đại hội XIII (2021), Đảng Cộng sản Việt Nam đặt mục tiêu đưa nước ta trở thành nước phát triển, thu nhập cao vào mốc thời gian nào?', 'Năm 2045', 'Năm 2030', 'Năm 2050', 'Năm 2035', 'A', 'Đại hội XIII đề ra mục tiêu: Đến năm 2030 (kỷ niệm 100 năm thành lập Đảng) là nước đang phát triển có công nghiệp hiện đại, thu nhập trung bình cao; Đến năm 2045 (kỷ niệm 100 năm thành lập nước) trở thành nước phát triển, thu nhập cao.'),
(11, 'Đại hội XI (2011) của Đảng đã thông qua văn kiện nền tảng cực kỳ quan trọng nào bổ sung và phát triển từ năm 1991?', 'Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên chủ nghĩa xã hội (bổ sung, phát triển năm 2011)', 'Báo cáo chính trị về xây dựng chủ nghĩa xã hội', 'Luận cương về con đường đổi mới toàn diện', 'Hiến pháp sửa đổi năm 2013', 'A', 'Đại hội XI đã thông qua Cương lĩnh xây dựng đất nước trong thời kỳ quá độ lên chủ nghĩa xã hội (bổ sung, phát triển năm 2011), định hướng con đường phát triển lâu dài của đất nước.');

-- Additional questions to reach 55 (5 per chapter)
-- Chapter 1
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(1, 'Dưới chính sách thống trị của thực dân Pháp, xã hội Việt Nam tồn tại hai mâu thuẫn cơ bản nào?', 'Mâu thuẫn giữa nhân dân Việt Nam với thực dân Pháp; và mâu thuẫn giữa nông dân với địa chủ phong kiến', 'Mâu thuẫn giữa giai cấp tư sản với vô sản', 'Mâu thuẫn giữa nông dân và công nhân', 'Mâu thuẫn giữa giới trí thức và thực dân Pháp', 'A', 'Hai mâu thuẫn cơ bản trong xã hội Việt Nam thời thuộc Pháp là mâu thuẫn dân tộc (giữa toàn thể nhân dân Việt Nam với thực dân Pháp) và mâu thuẫn giai cấp (giữa nông dân với địa chủ phong kiến).');

-- Chapter 2
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(2, 'Tại Đại hội lần thứ XVIII của Đảng Xã hội Pháp ở Tua (12/1920), Nguyễn Ái Quốc đã lựa chọn bỏ phiếu tán thành gia nhập tổ chức quốc tế nào?', 'Quốc tế Cộng sản (Quốc tế III)', 'Quốc tế Thứ hai', 'Quốc tế Thứ nhất', 'Hội Liên hiệp các dân tộc thuộc địa', 'A', 'Tháng 12/1920, tại Đại hội Tua, Nguyễn Ái Quốc đã bỏ phiếu tán thành tham gia Quốc tế thứ ba (Quốc tế Cộng sản) và tham gia thành lập Đảng Cộng sản Pháp, đánh dấu bước ngoặt chuyển sang chủ nghĩa cộng sản.');

-- Chapter 3
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(3, 'Hội nghị hợp nhất thành lập Đảng Cộng sản Việt Nam (1930) đã cử ai làm đại diện lâm thời của Ban Chấp hành Trung ương?', 'Trịnh Đình Cửu', 'Trần Phú', 'Nguyễn Ái Quốc', 'Lê Hồng Phong', 'A', 'Hội nghị hợp nhất đã bầu ra Ban Chấp hành Trung ương lâm thời và cử đồng chí Trịnh Đình Cửu làm đại diện lâm thời phụ trách Ban Chấp hành Trung ương.');

-- Chapter 4
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(4, 'Khẩu hiệu đấu tranh tiêu biểu nào thể hiện tinh thần cách mạng của nhân dân trong phong trào Xô Viết Nghệ Tĩnh 1930-1931?', 'Đả đảo đế quốc! Đả đảo phong kiến!', 'Tất cả cho tiền tuyến!', 'Quyết tử cho Tổ quốc quyết sinh!', 'Không có gì quý hơn độc lập tự do!', 'A', 'Trong phong trào 1930-1931, khẩu hiệu đấu tranh chính trị chính của quần chúng nhân dân là "Đả đảo chủ nghĩa đế quốc! Đả đảo phong kiến!" nhằm đòi ruộng đất và độc lập.');

-- Chapter 5
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(5, 'Tờ báo nào được chọn làm cơ quan ngôn luận trung ương của Mặt trận Việt Minh từ khi thành lập?', 'Báo Cứu Quốc', 'Báo Thanh Niên', 'Báo Nhân Dân', 'Báo Sự Thật', 'A', 'Báo "Cứu Quốc" ra đời năm 1942 là cơ quan tuyên truyền chính thống và ngôn luận trung ương của Tổng bộ Việt Nam Độc lập Đồng minh (Việt Minh).');

-- Chapter 6
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(6, 'Ngày Tổng khởi nghĩa giành chính quyền thắng lợi ở cố đô Huế trong Cách mạng tháng Tám 1945 là ngày nào?', '23/08/1945', '19/08/1945', '25/08/1945', '02/09/1945', 'A', 'Cách mạng tháng Tám giành thắng lợi rực rỡ ở cố đô Huế vào ngày 23/08/1945, buộc chính quyền phong kiến nhà Nguyễn (vua Bảo Đại) phải tuyên bố thoái vị.');

-- Chapter 7
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(7, 'Kế hoạch quân sự nào của thực dân Pháp đề ra năm 1953 với sự giúp đỡ tài chính của Mỹ hòng xoay chuyển cục diện chiến tranh Đông Dương?', 'Kế hoạch Nava', 'Kế hoạch Rơ-ve', 'Kế hoạch Đờ Lát đơ Tát-xi-nyi', 'Kế hoạch Bô-la-e', 'A', 'Kế hoạch quân sự Nava (1953) là nỗ lực cuối cùng của Pháp có Mỹ hậu thuẫn tài chính mạnh mẽ nhằm giành lại thế chủ động quân sự trên chiến trường Đông Dương trong 18 tháng.');

-- Chapter 8
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(8, 'Thường trực Ban Bí thư Trung ương Đảng đã quyết định thành lập tuyến đường vận tải chiến lược bộ dọc dãy Trường Sơn (Đoàn 559) vào năm nào?', '1959', '1954', '1965', '1973', 'A', 'Tháng 5/1959, Thường trực Ban Bí thư Trung ương Đảng quyết định lập Đoàn 559 mở tuyến chi viện chiến lược trên bộ dọc dãy Trường Sơn (Đường Hồ Chí Minh) để chi viện miền Nam.');

-- Chapter 9
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(9, 'Chiến thắng oanh liệt nào diễn ra từ ngày 26 đến 29/03/1975 giải phóng thành phố miền Trung lớn thứ hai và phá tan căn cứ liên hợp của đối phương?', 'Chiến dịch giải phóng Đà Nẵng', 'Trận Buôn Ma Thuột', 'Chiến dịch giải phóng Huế', 'Chiến dịch giải phóng Xuân Lộc', 'A', 'Chiến dịch giải phóng Đà Nẵng diễn ra thần tốc từ ngày 26 đến 29/03/1975, giải phóng hoàn toàn thành phố Đà Nẵng và đập tan cụm căn cứ quân sự mạnh của chính quyền Sài Gòn.');

-- Chapter 10
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(10, 'Chủ trương phát triển nền kinh tế nhiều thành phần trong thời kỳ Đổi mới (Đại hội VI) thừa nhận sự tồn tại hợp pháp của các thành phần nào?', 'Kinh tế nhà nước, tập thể, cá thể tiểu chủ, tư bản tư nhân và tư bản nhà nước', 'Chỉ kinh tế nhà nước và tập thể', 'Chỉ kinh tế tư bản quốc tế', 'Chỉ kinh tế hộ gia đình tự cấp tự túc', 'A', 'Chính sách đổi mới kinh tế thừa nhận cơ cấu kinh tế nhiều thành phần, bao gồm kinh tế nhà nước, kinh tế tập thể, cá thể, tư bản tư nhân và tư bản nhà nước cùng cạnh tranh lành mạnh.');

-- Chapter 11
INSERT INTO questions (chapter, content, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(11, 'Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam chính thức gia nhập và trở thành thành viên thứ 149 của Liên Hợp Quốc vào năm nào?', '1977', '1995', '1986', '2007', 'A', 'Việt Nam chính thức gia nhập và trở thành thành viên thứ 149 của Liên Hợp Quốc vào ngày 20/09/1977, khẳng định vị thế chủ quyền độc lập trên trường quốc tế.');

