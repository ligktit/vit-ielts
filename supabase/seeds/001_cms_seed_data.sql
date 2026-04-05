-- ===========================================================================
-- CMS Seed Data — Initial config for all CMS sections
-- Chạy sau khi đã có bảng cms_configs
-- ===========================================================================

-- Helper: upsert on section_name conflict
-- Schema: cms_configs(id, section_name, data jsonb, updated_at)

-- ─── HOME: Hero Banner ────────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'hero-banner',
  '{
    "trustpilot": {
      "image": "/img-admin/o-trustpilot.png",
      "rating": "Excellent 4.9 out of 5"
    },
    "headline": {
      "line1": "Education Is The Best",
      "line2": "Key",
      "line3": "Success",
      "line4": "In Life"
    },
    "description": {
      "text": "Luyện tập và thi thử IELTS Online trên máy tính miễn phí.",
      "highlightText": "Start now!"
    },
    "buttons": {
      "primary": { "text": "Start Practicing", "link": "/ielts-practice-library" },
      "secondary": { "text": "Take a Test", "link": "/ielts-exam-library" }
    },
    "backgroundImage": "",
    "bannerImage": "/img-admin/o-banner.png",
    "featureCards": [
      { "icon": "📝", "value": "10K+", "subtitle": "Practice Tests", "avatars": [] },
      { "icon": "🎯", "value": "98%", "subtitle": "Accuracy Rate", "avatars": [] },
      { "icon": "👥", "value": "50K+", "subtitle": "Active Users", "avatars": [] }
    ],
    "decorativeShape": {
      "image": "/img-admin/o-shape-1.png"
    }
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── HOME: Test Platform Intro ────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'test-platform-intro',
  '{
    "badge": { "text": "IELTS TEST PLATFORM" },
    "backgroundGradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "title": {
      "line1": "Nền tảng luyện thi",
      "line2": "IELTS",
      "line3": "hàng đầu",
      "line4": "Việt Nam"
    },
    "categories": [
      { "name": "Listening", "href": "/ielts-practice-library?skill=listening", "icon": "🎧" },
      { "name": "Reading", "href": "/ielts-practice-library?skill=reading", "icon": "📖" },
      { "name": "Writing", "href": "/sample-writing", "icon": "✍️" },
      { "name": "Speaking", "href": "/sample-speaking", "icon": "🎤" }
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── HOME: Why Choose Us ──────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'why-choose-us',
  '{
    "badge": { "text": "WHY CHOOSE US" },
    "title": "Tại sao chọn IELTS Prediction?",
    "description": "Chúng tôi cung cấp nền tảng luyện thi IELTS toàn diện với công nghệ AI tiên tiến.",
    "statistics": [
      { "icon": "📚", "value": "10,000+", "label": "Bài tập" },
      { "icon": "👤", "value": "50,000+", "label": "Học viên" },
      { "icon": "⭐", "value": "4.9/5", "label": "Đánh giá" },
      { "icon": "🏆", "value": "98%", "label": "Hài lòng" }
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── HOME: Testimonials ───────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'testimonials',
  '{
    "title": "Testimonials",
    "description": "Họ nói gì về chúng tôi?",
    "button": { "text": "Đăng ký ngay", "link": "/subscription" },
    "testimonials": [
      {
        "name": "Nguyễn Văn A",
        "title": "IELTS 7.5",
        "company": "Đại học Bách Khoa",
        "quote": "Nền tảng rất hữu ích, giúp tôi cải thiện điểm IELTS đáng kể chỉ sau 2 tháng luyện tập.",
        "avatar": ""
      },
      {
        "name": "Trần Thị B",
        "title": "IELTS 8.0",
        "company": "FPT Software",
        "quote": "Giao diện thân thiện, bài tập đa dạng và sát đề thi thật. Highly recommended!",
        "avatar": ""
      }
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── HOME: Practice Section ───────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'practice-section',
  '{
    "backgroundGradient": "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── FOOTER: CTA Banner ──────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'footer/cta-banner',
  '{
    "title": "Bắt đầu luyện thi IELTS ngay hôm nay!",
    "description": "Tham gia cùng hàng nghìn học viên đã đạt band điểm mơ ước.",
    "backgroundGradient": "linear-gradient(135deg, #D94A56 0%, #E86B75 100%)",
    "button": { "text": "Bắt đầu miễn phí", "link": "/subscription" }
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── HEADER: Top Bar ──────────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'header/top-bar',
  '{
    "text": "🎉 Đăng ký ngay để nhận ưu đãi 50% cho tất cả gói học!",
    "link": "/subscription",
    "visible": true
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── SUBSCRIPTION: Banner ─────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'subscription/banner',
  '{
    "backgroundImage": "",
    "subtitle": { "text": "PRICING" },
    "title": "Chọn gói học phù hợp với bạn",
    "description": "Đa dạng gói học với mức giá hợp lý, phù hợp với mọi nhu cầu."
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── SUBSCRIPTION: Course Packages ────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'subscription/course-packages',
  '{
    "currencySuffix": "đ",
    "popularBadgeText": "Phổ biến nhất",
    "priceSuffix": "/tháng",
    "monthText": { "singular": "tháng", "plural": "tháng" },
    "accessText": "Truy cập toàn bộ",
    "dealNoteTemplate": "Tiết kiệm {percent}%",
    "features": {
      "included": ["Truy cập tất cả bài tập", "AI chấm bài tự động", "Hỗ trợ 24/7"],
      "excluded": ["Gia sư riêng", "Workshop offline"]
    },
    "skillLabels": { "listening": "Listening", "reading": "Reading" },
    "combo": {
      "title": "Combo Listening + Reading",
      "ctaText": "Đăng ký ngay",
      "basePrice": 199000,
      "monthlyIncrementPrice": 100000,
      "plans": [
        { "name": "1 tháng", "months": 1, "price": 199000 },
        { "name": "3 tháng", "months": 3, "price": 499000, "popular": true },
        { "name": "6 tháng", "months": 6, "price": 899000, "featuredDeal": true, "dealNote": "Tiết kiệm 25%" }
      ]
    },
    "single": {
      "title": "Listening hoặc Reading",
      "ctaText": "Đăng ký ngay",
      "basePrice": 129000,
      "monthlyIncrementPrice": 80000,
      "skills": ["listening", "reading"],
      "plans": [
        { "name": "1 tháng", "months": 1, "price": 129000 },
        { "name": "3 tháng", "months": 3, "price": 329000, "popular": true },
        { "name": "6 tháng", "months": 6, "price": 599000 }
      ]
    }
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── SUBSCRIPTION: FAQ ────────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'subscription/faq',
  '{
    "badge": { "text": "FAQ" },
    "title": "Câu hỏi thường gặp",
    "description": "Tìm hiểu thêm về dịch vụ của chúng tôi.",
    "items": [
      { "question": "Tôi có thể dùng thử miễn phí không?", "answer": "Có! Bạn có thể dùng thử miễn phí với một số bài tập cơ bản trước khi quyết định đăng ký gói học." },
      { "question": "Tôi có thể hủy đăng ký bất cứ lúc nào không?", "answer": "Có, bạn có thể hủy đăng ký bất cứ lúc nào. Gói học sẽ tiếp tục hoạt động cho đến hết thời hạn đã thanh toán." },
      { "question": "Phương thức thanh toán nào được chấp nhận?", "answer": "Chúng tôi chấp nhận thanh toán qua chuyển khoản ngân hàng, ví điện tử MoMo, ZaloPay." }
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── IELTS Exam Library: Hero Banner ──────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'ielts-exam-library/hero-banner',
  '{
    "title": "IELTS Exam Library",
    "backgroundColor": "#D94A56",
    "breadcrumb": {
      "homeLabel": "Trang chủ",
      "currentLabel": "IELTS Exam Library"
    }
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── IELTS Practice Library: Banner ───────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'ielts-practice-library/banner',
  '{
    "listening": {
      "title": "IELTS Listening Practice",
      "description": {
        "line1": "Luyện tập IELTS Listening với hàng trăm bài tập",
        "line2": "từ dễ đến khó, sát đề thi thật nhất.",
        "line3": ""
      },
      "backgroundColor": "#D94A56",
      "button": { "text": "Bắt đầu luyện tập", "link": "/ielts-practice-library?skill=listening" }
    },
    "reading": {
      "title": "IELTS Reading Practice",
      "description": {
        "line1": "Luyện tập IELTS Reading với hàng trăm bài tập",
        "line2": "từ Academic đến General Training.",
        "line3": ""
      },
      "backgroundColor": "#2D3142",
      "button": { "text": "Bắt đầu luyện tập", "link": "/ielts-practice-library?skill=reading" }
    }
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── ACCOUNT: Login ───────────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'account/login',
  '{ "backgroundColor": "#FAF7EB" }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── ACCOUNT: Register ────────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'account/register',
  '{ "backgroundColor": "#FAF7EB" }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── LEGAL: Terms of Use ──────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'terms-of-use',
  '{
    "banner": {
      "title": "Điều khoản sử dụng",
      "subtitle": "Vui lòng đọc kỹ trước khi sử dụng dịch vụ",
      "backgroundImage": ""
    },
    "heroImage": "",
    "content": {
      "introTitle": "Điều khoản sử dụng IELTS Prediction",
      "introParagraphs": ["Chào mừng bạn đến với IELTS Prediction. Bằng việc sử dụng dịch vụ, bạn đồng ý với các điều khoản sau."],
      "sections": [
        { "title": "1. Chấp nhận điều khoản", "content": "Bằng việc truy cập và sử dụng website, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này." },
        { "title": "2. Tài khoản người dùng", "content": "Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu của mình. Mọi hoạt động trên tài khoản là trách nhiệm của bạn." }
      ]
    }
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── LEGAL: Privacy Policy ────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'privacy-policy',
  '{
    "banner": {
      "title": "Chính sách bảo mật",
      "subtitle": "Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn",
      "backgroundImage": ""
    },
    "heroImage": "",
    "content": {
      "introTitle": "Chính sách bảo mật IELTS Prediction",
      "introParagraphs": ["Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ dữ liệu cá nhân."],
      "sections": [
        { "title": "1. Thông tin chúng tôi thu thập", "content": "Chúng tôi thu thập thông tin bạn cung cấp khi đăng ký tài khoản, bao gồm tên, email, và thông tin thanh toán." },
        { "title": "2. Cách chúng tôi sử dụng thông tin", "content": "Thông tin được sử dụng để cung cấp và cải thiện dịch vụ, xử lý thanh toán, và giao tiếp với bạn." }
      ]
    }
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── SAMPLE ESSAY: Banner ─────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'sample-essay/banner',
  '{
    "writing": {
      "title": "IELTS Writing Samples",
      "description": {
        "line1": "Tham khảo hàng trăm bài mẫu Writing Task 1 & Task 2",
        "line2": "được chấm chi tiết với band score."
      },
      "backgroundColor": "#D94A56"
    },
    "speaking": {
      "title": "IELTS Speaking Samples",
      "description": {
        "line1": "Tham khảo câu trả lời mẫu cho Part 1, 2, 3",
        "line2": "với phân tích chi tiết và từ vựng nâng cao."
      },
      "backgroundColor": "#2D3142"
    }
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ─── SEO: Global Config ───────────────────────────────────────────────────
INSERT INTO public.cms_configs (section_name, data, updated_at)
VALUES (
  'seo/global',
  '{
    "siteTitle": "IELTS Prediction — Luyện thi IELTS Online",
    "siteDescription": "Nền tảng luyện thi IELTS Online hàng đầu Việt Nam. Thi thử IELTS miễn phí trên máy tính với hàng nghìn bài tập Listening, Reading, Writing, Speaking.",
    "siteKeywords": "ielts, luyện thi ielts, thi thử ielts, ielts online, ielts prediction",
    "ogImage": "",
    "robots": "index, follow",
    "googleAnalyticsId": "",
    "facebookPixelId": ""
  }'::jsonb,
  now()
)
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ===========================================================================
-- ALIASES: home/ prefixed sections for frontend SSR compatibility
-- The homepage getServerSideProps reads "home/hero-banner" etc.
-- while admin APIs store as "hero-banner" etc.
-- Both need to exist until naming is unified.
-- ===========================================================================

-- home/hero-banner (alias of hero-banner)
INSERT INTO public.cms_configs (section_name, data, updated_at)
SELECT 'home/hero-banner', data, now()
FROM public.cms_configs WHERE section_name = 'hero-banner'
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- home/test-platform-intro
INSERT INTO public.cms_configs (section_name, data, updated_at)
SELECT 'home/test-platform-intro', data, now()
FROM public.cms_configs WHERE section_name = 'test-platform-intro'
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- home/why-choose-us
INSERT INTO public.cms_configs (section_name, data, updated_at)
SELECT 'home/why-choose-us', data, now()
FROM public.cms_configs WHERE section_name = 'why-choose-us'
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- home/testimonials
INSERT INTO public.cms_configs (section_name, data, updated_at)
SELECT 'home/testimonials', data, now()
FROM public.cms_configs WHERE section_name = 'testimonials'
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- home/practice-section
INSERT INTO public.cms_configs (section_name, data, updated_at)
SELECT 'home/practice-section', data, now()
FROM public.cms_configs WHERE section_name = 'practice-section'
ON CONFLICT (section_name) DO UPDATE SET data = EXCLUDED.data, updated_at = now();

-- ===========================================================================
-- Verification: List all seeded sections
-- ===========================================================================
SELECT section_name, updated_at FROM public.cms_configs ORDER BY section_name;
