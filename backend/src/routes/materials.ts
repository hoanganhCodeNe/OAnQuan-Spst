import { Router, Request, Response } from 'express';

const router = Router();

export interface Material {
  chapter: number;
  title: string;
  period: string;
  summary: string;
  details: string[];
  quotes: string;
}

const HISTORICAL_MATERIALS: Material[] = [
  {
    chapter: 1,
    title: 'Bối cảnh Việt Nam trước năm 1930',
    period: 'Trước năm 1930',
    summary: 'Dưới ách thống trị tàn bạo của thực dân Pháp, xã hội Việt Nam bị phân hóa sâu sắc và bùng nổ nhiều phong trào yêu nước theo các khuynh hướng khác nhau nhưng đều thất bại do thiếu đường lối đúng đắn.',
    details: [
      'Năm 1858, Pháp nổ súng xâm lược Việt Nam tại Đà Nẵng, triều đình nhà Nguyễn nhu nhược từng bước đầu hàng.',
      'Pháp thiết lập chế độ cai trị nửa phong kiến thực dân, đẩy mạnh hai cuộc khai thác thuộc địa quy mô lớn.',
      'Các phong trào yêu nước nổi lên mạnh mẽ: phong trào Cần Vương, phong trào Đông Du (Phan Bội Châu), Duy Tân (Phan Châu Trinh), Khởi nghĩa Yên Thế (Hoàng Hoa Thám).',
      'Sự thất bại của các phong trào này chứng tỏ sự khủng hoảng sâu sắc về đường lối cứu nước cứu dân tộc.'
    ],
    quotes: '"Dân tộc ta như trong đêm tối không có đường ra." - Đánh giá về bối cảnh cách mạng Việt Nam trước khi có Đảng.'
  },
  {
    chapter: 2,
    title: 'Nguyễn Ái Quốc tìm đường cứu nước',
    period: '1911 - 1929',
    summary: 'Nguyễn Tất Thành ra đi tìm đường cứu nước, tiếp cận chủ nghĩa Mác-Lênin, xác định con đường giải phóng dân tộc theo khuynh hướng vô sản và chuẩn bị tích cực về lý luận lẫn tổ chức cho sự thành lập Đảng.',
    details: [
      'Ngày 5/6/1911, Nguyễn Tất Thành rời bến cảng Nhà Rồng ra đi tìm đường cứu nước trên tàu Latouche-Tréville.',
      'Tháng 7/1920, Người đọc sơ thảo Luận cương của Lênin về vấn đề dân tộc và thuộc địa, tìm thấy con đường giải phóng đúng đắn.',
      'Tháng 12/1920, tại Đại hội Tua (Pháp), Người biểu quyết tán thành Quốc tế 3, tham gia thành lập Đảng Cộng sản Pháp, trở thành người cộng sản Việt Nam đầu tiên.',
      'Tháng 6/1925, Người thành lập Hội Việt Nam Cách mạng Thanh niên tại Quảng Châu, xuất bản báo Thanh Niên và cuốn "Đường Kách mệnh" (1927).'
    ],
    quotes: '"Muốn cứu nước và giải phóng dân tộc không có con đường nào khác con đường cách mạng vô sản."'
  },
  {
    chapter: 3,
    title: 'Thành lập Đảng Cộng sản Việt Nam',
    period: 'Đầu năm 1930',
    summary: 'Hội nghị hợp nhất các tổ chức cộng sản tại Hương Cảng dưới sự chủ trì của Nguyễn Ái Quốc đã khai sinh ra Đảng Cộng sản Việt Nam, mở ra kỷ nguyên mới cho lịch sử dân tộc.',
    details: [
      'Ba tổ chức cộng sản hoạt động riêng rẽ gây chia rẽ: Đông Dương Cộng sản Đảng, An Nam Cộng sản Đảng, Đông Dương Cộng sản Liên đoàn.',
      'Từ ngày 6/1 đến 7/2/1930, Nguyễn Ái Quốc chủ trì Hội nghị hợp nhất tại Cửu Long, Hương Cảng (Hồng Kông).',
      'Hội nghị thông qua Cương lĩnh chính trị đầu tiên: Chính cương vắn tắt, Sách lược vắn tắt của Đảng.',
      'Tháng 10/1930, Hội nghị Trung ương 1 quyết định đổi tên Đảng thành Đảng Cộng sản Đông Dương và bầu Trần Phú làm Tổng Bí thư.'
    ],
    quotes: '"Đảng Cộng sản Việt Nam ra đời là bước ngoặt vĩ đại trong lịch sử cách mạng Việt Nam."'
  },
  {
    chapter: 4,
    title: 'Phong trào Xô Viết Nghệ Tĩnh',
    period: '1930 - 1931',
    summary: 'Phong trào cách mạng đầu tiên do Đảng lãnh đạo đạt đỉnh cao tại Nghệ An - Hà Tĩnh, thiết lập nên chính quyền Xô viết tự quản của nhân dân lao động.',
    details: [
      'Bùng nổ mạnh mẽ từ Ngày Quốc tế Lao động 1/5/1930 với khẩu hiệu đòi tăng lương, giảm giờ làm, chia ruộng đất.',
      'Ngày 12/9/1930, cuộc biểu tình lớn của nông dân Hưng Nguyên bị máy bay Pháp ném bom tàn sát, thổi bùng bạo lực cách mạng.',
      'Chính quyền thực dân tan rã tại các thôn xã Nghệ-Tĩnh; các Ban Chấp hành Nông hội đỏ (Xô viết) được thành lập.',
      'Chính quyền Xô viết thực hiện các chính sách tiến bộ: chia ruộng đất công, xóa nợ thuế, dạy chữ Quốc ngữ, bài trừ hủ tục.'
    ],
    quotes: '"Xô viết Nghệ Tĩnh là cuộc tổng diễn tập đầu tiên của Cách mạng tháng Tám thắng lợi sau này."'
  },
  {
    chapter: 5,
    title: 'Mặt trận Việt Minh',
    period: '1941 - 1945',
    summary: 'Nguyễn Ái Quốc về nước thành lập Mặt trận Việt Minh, chuyển hướng chiến lược đặt nhiệm vụ giải phóng dân tộc lên hàng đầu, tích cực chuẩn bị lực lượng vũ trang cứu quốc.',
    details: [
      'Ngày 28/1/1941, lãnh tụ Nguyễn Ái Quốc trở về nước sau 30 năm bôn ba, chọn Pác Bó (Cao Bằng) làm căn cứ chỉ đạo cách mạng.',
      'Tháng 5/1941, Hội nghị Trung ương 8 quyết định thành lập Việt Nam Độc lập Đồng minh (Việt Minh).',
      'Đại hội thành lập Mặt trận tập hợp đông đảo các tầng lớp yêu nước không phân biệt giai cấp, tôn giáo vào các hội Cứu quốc.',
      'Ngày 22/12/1944, thành lập Đội Việt Nam Tuyên truyền Giải phóng quân (tiền thân Quân đội Nhân dân Việt Nam) tại Cao Bằng.'
    ],
    quotes: '"Liên hiệp hết thảy các giới đồng bào yêu nước, không phân biệt giàu nghèo, già trẻ, gái trai để cùng nhau mưu cuộc giải phóng."'
  },
  {
    chapter: 6,
    title: 'Cách mạng tháng Tám 1945',
    period: 'Năm 1945',
    summary: 'Tận dụng thời cơ ngàn năm có một khi Nhật đầu hàng Đồng minh, Đảng phát lệnh Tổng khởi nghĩa toàn quốc, giành chính quyền về tay nhân dân và tuyên bố độc lập.',
    details: [
      'Ngày 9/3/1945, Nhật đảo chính Pháp. Đảng ra chỉ thị "Nhật - Pháp bắn nhau và hành động của chúng ta", xác định Nhật là kẻ thù chính.',
      'Đêm 13/8/1945, Ủy ban Khởi nghĩa toàn quốc ban bố Quân lệnh số 1 phát lệnh Tổng khởi nghĩa trên toàn quốc.',
      'Quần chúng khởi nghĩa giành thắng lợi rực rỡ tại các đô thị lớn: Hà Nội (19/8), Huế (23/8), Sài Gòn (25/8). Vua Bảo Đại thoái vị.',
      'Ngày 2/9/1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình, khai sinh nước Việt Nam Dân chủ Cộng hòa.'
    ],
    quotes: '"Dù có phải đốt cháy cả dãy Trường Sơn cũng phải kiên quyết giành cho được độc lập!" - Lời căn dặn của Bác Hồ tại Tân Trào.'
  },
  {
    chapter: 7,
    title: 'Kháng chiến chống Pháp',
    period: '1945 - 1954',
    summary: 'Tiến hành cuộc chiến đấu ngoan cường bảo vệ độc lập non trẻ với đường lối "toàn dân, toàn diện, trường kỳ, tự lực cánh sinh", kết thúc bằng chiến thắng Điện Biên Phủ chấn động địa cầu.',
    details: [
      'Sau Cách mạng tháng Tám, nước ta rơi vào thế nghìn cân treo sợi tóc (giặc đói, giặc dốt, giặc ngoại xâm).',
      'Đêm 19/12/1946, Chủ tịch Hồ Chí Minh phát động Lời kêu gọi Toàn quốc kháng chiến: "Chúng ta thà hy sinh tất cả, chứ nhất định không chịu mất nước, nhất định không chịu làm nô lệ".',
      'Chiến thắng Biên giới Thu Đông 1950 đập tan vòng vây của Pháp, khai thông con đường liên lạc quốc tế.',
      'Chiến dịch Điện Biên Phủ lừng lẫy năm châu kết thúc thắng lợi ngày 7/5/1954, buộc Pháp ký Hiệp định Giơ-ne-vơ lập lại hòa bình.'
    ],
    quotes: '"Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do độc lập."'
  },
  {
    chapter: 8,
    title: 'Kháng chiến chống Mỹ',
    period: '1954 - 1973',
    summary: 'Đồng thời thực hiện hai nhiệm vụ chiến lược: Xây dựng CNXH ở miền Bắc làm hậu phương lớn và Tiến hành cách mạng dân tộc dân chủ ở miền Nam đánh bại các chiến lược chiến tranh của đế quốc Mỹ.',
    details: [
      'Nghị quyết Trung ương 15 (1959) soi sáng con đường bạo lực cách mạng tại miền Nam, châm ngòi phong trào Đồng khởi (1960) oanh liệt.',
      'Đánh bại liên tiếp các chiến lược của Mỹ: Chiến tranh đặc biệt, Chiến tranh cục bộ, Việt Nam hóa chiến tranh.',
      'Miền Bắc kiên cường bắn rơi máy bay Mỹ, đỉnh cao là đập tan cuộc tập kích B-52 trong 12 ngày đêm cuối năm 1972 ("Điện Biên Phủ trên không").',
      'Ký kết Hiệp định Paris (27/1/1973) buộc Mỹ rút quân hoàn toàn khỏi Việt Nam.'
    ],
    quotes: '"Không có gì quý hơn độc lập, tự do!" - Ý chí sắt đá của toàn dân tộc Việt Nam.'
  },
  {
    chapter: 9,
    title: 'Đại thắng mùa Xuân 1975',
    period: 'Năm 1975',
    summary: 'Tổng tiến công và nổi dậy thần tốc giành thắng lợi hoàn toàn, giải phóng hoàn toàn miền Nam, thống nhất non sông đất nước về một mối.',
    details: [
      'Đầu năm 1975, Bộ Chính trị thông qua kế hoạch giải phóng miền Nam trong hai năm 1975-1976, nếu thời cơ đến sẽ giải phóng ngay trong năm 1975.',
      'Chiến dịch Tây Nguyên mở màn oanh liệt (10/3/1975) giải phóng Buôn Ma Thuột, tạo bước ngoặt chiến lược.',
      'Chiến dịch Hồ Chí Minh lịch sử bắt đầu ngày 26/4 nhằm giải phóng Sài Gòn.',
      '11 giờ 30 phút ngày 30/4/1975, xe tăng húc đổ cổng Dinh Độc Lập, cắm cờ giải phóng, giành thắng lợi trọn vẹn.'
    ],
    quotes: '"Thần tốc, thần tốc hơn nữa, táo bạo, táo bạo hơn nữa, tranh thủ từng phút, từng giờ, xốc tới mặt trận, giải phóng miền Nam!" - Mệnh lệnh của Đại tướng Võ Nguyên Giáp.'
  },
  {
    chapter: 10,
    title: 'Công cuộc Đổi mới 1986',
    period: '1986 - Nay',
    summary: 'Đại hội VI khởi xướng công cuộc Đổi mới toàn diện đất nước, chuyển đổi từ kinh tế kế hoạch bao cấp sang kinh tế thị trường định hướng XHCN, cứu đất nước khỏi khủng hoảng kinh tế - xã hội.',
    details: [
      'Giai đoạn 1975-1985 đất nước gặp nhiều khó khăn khủng hoảng trầm trọng do cơ chế bao cấp lỗi thời và sự bao vây cấm vận.',
      'Đại hội VI (12/1986) phê bình thẳng thắn sai lầm duy ý chí, đề ra đường lối đổi mới toàn diện mở cửa kinh tế.',
      'Thừa nhận nền kinh tế nhiều thành phần, bãi bỏ ngăn sông cấm chợ, ra đời Nghị quyết Khoán 10 trong nông nghiệp.',
      'Chuyển đổi cơ cấu giúp Việt Nam thoát khỏi nạn đói, trở thành nước xuất khẩu gạo hàng đầu thế giới.'
    ],
    quotes: '"Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật."'
  },
  {
    chapter: 11,
    title: 'Việt Nam hội nhập và phát triển',
    period: 'Thời kỳ Hội nhập',
    summary: 'Việt Nam thực hiện đường lối đối ngoại độc lập, tự chủ, đa phương hóa, đa dạng hóa, trở thành thành viên tích cực của cộng đồng quốc tế và nâng cao vị thế trên trường quốc tế.',
    details: [
      'Năm 1995: Bình thường hóa quan hệ ngoại giao với Mỹ và chính thức gia nhập ASEAN.',
      'Năm 2007: Trở thành thành viên thứ 150 của Tổ chức Thương mại Thế giới (WTO).',
      'Ký kết hàng loạt hiệp định thương mại tự do thế hệ mới (CPTPP, EVFTA), tham gia tích cực vào các hoạt động gìn giữ hòa bình Liên Hợp Quốc.',
      'Đại hội XIII (2021) xác định khát vọng phát triển đất nước phồn vinh, phấn đấu trở thành nước phát triển có thu nhập cao vào năm 2045.'
    ],
    quotes: '"Đất nước ta chưa bao giờ có được cơ đồ, tiềm lực, vị thế và uy tín quốc tế như ngày nay." - Tổng Bí thư Nguyễn Phú Trọng.'
  }
];

router.get('/', (req: Request, res: Response) => {
  res.status(200).json(HISTORICAL_MATERIALS);
});

router.get('/:chapter', (req: Request, res: Response) => {
  const chapterNum = parseInt(req.params.chapter, 10);
  const material = HISTORICAL_MATERIALS.find(m => m.chapter === chapterNum);
  if (!material) {
    return res.status(404).json({ message: 'Không tìm thấy tư liệu cho chương này.' });
  }
  res.status(200).json(material);
});

export default router;
