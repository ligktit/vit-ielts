// Styles loaded globally via _app.tsx → ds-styles.css

import { DSButton } from '@/shared/ui/ds/atoms/ds-button';
import { DSInput } from '@/shared/ui/ds/atoms/ds-input';
import { DSBadge } from '@/shared/ui/ds/atoms/ds-badge';
import { DSAvatar } from '@/shared/ui/ds/atoms/ds-avatar';
import { DSTag } from '@/shared/ui/ds/atoms/ds-tag';
import { DSDivider } from '@/shared/ui/ds/atoms/ds-divider';
import { DSSpinner } from '@/shared/ui/ds/atoms/ds-spinner';
import { DSFormField } from '@/shared/ui/ds/molecules/ds-form-field';
import { DSNavLink } from '@/shared/ui/ds/molecules/ds-nav-link';
import { DSBreadcrumb } from '@/shared/ui/ds/molecules/ds-breadcrumb';
import { DSTestCard } from '@/shared/ui/ds/molecules/ds-test-card';
import { DSBlogCard } from '@/shared/ui/ds/molecules/ds-blog-card';
import { DSStatCard } from '@/shared/ui/ds/molecules/ds-stat-card';
import { DSPricingCard } from '@/shared/ui/ds/molecules/ds-pricing-card';
import { DSHeader } from '@/shared/ui/ds/organisms/ds-header';
import { DSFooter } from '@/shared/ui/ds/organisms/ds-footer';
import { DSCTABanner } from '@/shared/ui/ds/organisms/ds-cta-banner';

const s = {
  page: { fontFamily: "'Noto Sans', sans-serif", background: '#f5f5f5', minHeight: '100vh' } as React.CSSProperties,
  section: { maxWidth: 1200, margin: '0 auto', padding: '48px 24px' } as React.CSSProperties,
  title: { fontSize: 28, fontWeight: 700, color: '#171717', marginBottom: 8, borderBottom: '3px solid #D94A56', paddingBottom: 8, display: 'inline-block' } as React.CSSProperties,
  sub: { fontSize: 14, color: '#737373', marginBottom: 32 } as React.CSSProperties,
  group: { marginBottom: 40 } as React.CSSProperties,
  label: { fontSize: 16, fontWeight: 600, color: '#404040', marginBottom: 16, textTransform: 'uppercase' as const, letterSpacing: '0.05em' } as React.CSSProperties,
  row: { display: 'flex', flexWrap: 'wrap' as const, gap: 12, alignItems: 'center', marginBottom: 16 } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 } as React.CSSProperties,
  swatch: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, background: '#fff', border: '1px solid #e5e5e5', fontSize: 13 } as React.CSSProperties,
  circle: (c: string) => ({ width: 32, height: 32, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }),
  hero: { background: '#D94A56', padding: '60px 24px', textAlign: 'center' as const, color: '#fff' } as React.CSSProperties,
  box: { background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e5e5' } as React.CSSProperties,
};

const NAV = [
  { label: 'IELTS Online Test', href: '#', active: true, children: [{ label: 'Practice - Listening', href: '#' }, { label: 'Practice - Reading', href: '#' }] },
  { label: 'IELTS Sample', href: '#' },
  { label: 'IELTS Prediction', href: '#' },
  { label: 'Subscription', href: '#' },
];

const FOOTER_COLS = [
  { title: 'Useful Links', links: [{ label: 'Home', href: '#' }, { label: 'IELTS Exam Library', href: '#' }, { label: 'Practice - Listening', href: '#' }, { label: 'Practice - Reading', href: '#' }, { label: 'Blog', href: '#' }] },
  { title: 'Our Company', links: [{ label: 'About Us', href: '#' }, { label: 'Contact Us', href: '#' }, { label: 'My Dashboard', href: '#' }, { label: 'My Profile', href: '#' }] },
];

export default function DSPreview() {
  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: '0 0 8px' }}>🎨 Design System Preview</h1>
        <p style={{ fontSize: 16, opacity: 0.9, margin: 0 }}>IELTS Prediction Test — Components Library</p>
      </div>

      {/* Colors — Figma Palette (6 cols × 3 rows) */}
      <div style={s.section}>
        <h2 style={s.title}>1. Color Tokens — Figma Palette</h2>
        <p style={s.sub}>Extracted from Figma COLOR PALETTE (node 14-137)</p>

        <div style={s.group}>
          <div style={s.label}>Brand (Solid)</div>
          <div style={s.row}>
            <div style={s.swatch}><div style={s.circle('#D94A56')} /><span>#D94A56 — Brand Primary</span></div>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>Figma Palette — Row 1 (Saturated)</div>
          <div style={s.row}>
            <div style={s.swatch}><div style={s.circle('#D94A56')} /><span>#D94A56 Red</span></div>
            <div style={s.swatch}><div style={s.circle('#F2994A')} /><span>#F2994A Orange</span></div>
            <div style={s.swatch}><div style={s.circle('#F2C94C')} /><span>#F2C94C Yellow</span></div>
            <div style={s.swatch}><div style={s.circle('#27AE60')} /><span>#27AE60 Green</span></div>
            <div style={s.swatch}><div style={s.circle('#2F80ED')} /><span>#2F80ED Blue</span></div>
            <div style={s.swatch}><div style={s.circle('#242938')} /><span>#242938 Navy</span></div>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>Figma Palette — Row 2 (Pastel / Mid)</div>
          <div style={s.row}>
            <div style={s.swatch}><div style={s.circle('#E0828B')} /><span>#E0828B</span></div>
            <div style={s.swatch}><div style={s.circle('#F5B88A')} /><span>#F5B88A</span></div>
            <div style={s.swatch}><div style={s.circle('#F5DA82')} /><span>#F5DA82</span></div>
            <div style={s.swatch}><div style={s.circle('#6FCF97')} /><span>#6FCF97</span></div>
            <div style={s.swatch}><div style={s.circle('#7FB3F5')} /><span>#7FB3F5</span></div>
            <div style={s.swatch}><div style={s.circle('#616B7B')} /><span>#616B7B</span></div>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>Figma Palette — Row 3 (Light)</div>
          <div style={s.row}>
            <div style={s.swatch}><div style={s.circle('#F2C1C6')} /><span>#F2C1C6</span></div>
            <div style={s.swatch}><div style={s.circle('#FAD9BC')} /><span>#FAD9BC</span></div>
            <div style={s.swatch}><div style={s.circle('#FAE9B3')} /><span>#FAE9B3</span></div>
            <div style={s.swatch}><div style={s.circle('#C1F0D4')} /><span>#C1F0D4</span></div>
            <div style={s.swatch}><div style={s.circle('#C4DAF9')} /><span>#C4DAF9</span></div>
            <div style={s.swatch}><div style={s.circle('#DADDE3')} /><span>#DADDE3</span></div>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>Primary Scale (from #D94A56)</div>
          <div style={s.row}>
            {['#FDF2F3','#FCE4E6','#F9CCD0','#F2A0A8','#E6717C','#D94A56','#C33040','#A42535','#892231','#76202F','#410D15'].map((c,i) => (
              <div key={i} style={{ ...s.swatch, padding: '4px 10px', fontSize: 11 }}><div style={s.circle(c)} /><span>{c}</span></div>
            ))}
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>Neutrals</div>
          <div style={s.row}>
            {['#FFFFFF','#FAFAFA','#F5F5F5','#E5E5E5','#D4D4D4','#A3A3A3','#737373','#525252','#404040','#262626','#171717'].map((c,i) => (
              <div key={i} style={{ ...s.swatch, padding: '4px 10px', fontSize: 11 }}><div style={s.circle(c)} /><span>{c}</span></div>
            ))}
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>IELTS Skill Colors</div>
          <div style={s.row}>
            <div style={s.swatch}><div style={s.circle('#F2994A')} /><span>📖 Reading (Orange)</span></div>
            <div style={s.swatch}><div style={s.circle('#2F80ED')} /><span>🎧 Listening (Blue)</span></div>
            <div style={s.swatch}><div style={s.circle('#F2C94C')} /><span>🎤 Speaking (Yellow)</span></div>
            <div style={s.swatch}><div style={s.circle('#27AE60')} /><span>✍️ Writing (Green)</span></div>
          </div>
        </div>
      </div>

      <DSDivider />

      {/* Typography */}
      <div style={s.section}>
        <h2 style={s.title}>2. Typography</h2>
        <p style={s.sub}>Noto Sans — All sizes and weights</p>
        <div style={s.box}>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 48, fontWeight: 800, margin: '0 0 8px', color: '#171717' }}>Heading 5XL — 48px</p>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 36, fontWeight: 700, margin: '0 0 8px', color: '#171717' }}>Heading 4XL — 36px</p>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#171717' }}>Heading 3XL — 28px</p>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 24, fontWeight: 600, margin: '0 0 8px', color: '#262626' }}>Heading 2XL — 24px</p>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 20, fontWeight: 600, margin: '0 0 8px', color: '#262626' }}>Heading XL — 20px</p>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 18, fontWeight: 500, margin: '0 0 8px', color: '#404040' }}>Text LG — 18px</p>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 16, fontWeight: 400, margin: '0 0 8px', color: '#404040' }}>Text Base — 16px — Body text default</p>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 14, fontWeight: 400, margin: '0 0 8px', color: '#525252' }}>Text SM — 14px — Secondary</p>
          <p style={{ fontFamily: "'Noto Sans'", fontSize: 12, fontWeight: 400, margin: '0 0 4px', color: '#737373' }}>Text XS — 12px — Meta, captions</p>
        </div>
      </div>

      <DSDivider />

      {/* Atoms */}
      <div style={s.section}>
        <h2 style={s.title}>3. Atoms</h2>
        <p style={s.sub}>Smallest independent UI elements</p>

        <div style={s.group}>
          <div style={s.label}>DSButton — Variants</div>
          <div style={s.row}>
            <DSButton variant="primary">Primary</DSButton>
            <DSButton variant="secondary">Secondary</DSButton>
            <DSButton variant="ghost">Ghost</DSButton>
            <DSButton variant="link">Link</DSButton>
            <DSButton variant="danger">Danger</DSButton>
          </div>
          <div style={s.label}>DSButton — Sizes</div>
          <div style={s.row}>
            <DSButton size="sm">Small</DSButton>
            <DSButton size="md">Medium</DSButton>
            <DSButton size="lg">Large</DSButton>
          </div>
          <div style={s.label}>DSButton — States</div>
          <div style={s.row}>
            <DSButton loading>Loading</DSButton>
            <DSButton disabled>Disabled</DSButton>
          </div>
          <div style={{ maxWidth: 400 }}>
            <DSButton variant="primary" fullWidth>Full Width Primary</DSButton>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSInput</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
            <DSInput size="sm" placeholder="Small input" />
            <DSInput size="md" placeholder="Medium (default)" />
            <DSInput size="lg" placeholder="Large input" />
            <DSInput placeholder="Error state" error />
            <DSInput placeholder="Disabled" disabled />
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSBadge</div>
          <div style={s.row}>
            <DSBadge>Default</DSBadge>
            <DSBadge variant="primary">Primary</DSBadge>
            <DSBadge variant="success">Success</DSBadge>
            <DSBadge variant="warning">Warning</DSBadge>
            <DSBadge variant="error">Error</DSBadge>
            <DSBadge variant="info">Info</DSBadge>
          </div>
          <div style={s.row}>
            <DSBadge variant="reading">Reading</DSBadge>
            <DSBadge variant="listening">Listening</DSBadge>
            <DSBadge variant="speaking">Speaking</DSBadge>
            <DSBadge variant="writing">Writing</DSBadge>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSAvatar</div>
          <div style={s.row}>
            <DSAvatar size="xs" name="AB" />
            <DSAvatar size="sm" name="CD" />
            <DSAvatar size="md" name="Nguyen Van A" />
            <DSAvatar size="lg" name="Tran B" />
            <DSAvatar size="xl" name="User" />
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSTag</div>
          <div style={s.row}>
            <DSTag>Default</DSTag>
            <DSTag color="primary">Primary</DSTag>
            <DSTag color="reading">Reading</DSTag>
            <DSTag color="listening">Listening</DSTag>
            <DSTag color="speaking">Speaking</DSTag>
            <DSTag color="writing">Writing</DSTag>
          </div>
          <div style={s.row}>
            <DSTag variant="outlined">Outlined</DSTag>
            <DSTag color="primary" active>Active</DSTag>
            <DSTag removable>Removable</DSTag>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSSpinner</div>
          <div style={s.row}>
            <DSSpinner size="sm" />
            <DSSpinner size="md" />
            <DSSpinner size="lg" />
          </div>
        </div>
      </div>

      <DSDivider />

      {/* Molecules */}
      <div style={s.section}>
        <h2 style={s.title}>4. Molecules</h2>
        <p style={s.sub}>Composed from atoms</p>

        <div style={s.group}>
          <div style={s.label}>DSFormField (Login Form Example)</div>
          <div style={{ ...s.box, maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <DSFormField label="Số điện thoại" placeholder="Nhập số điện thoại" />
            <DSFormField label="Mật khẩu" type="password" placeholder="Nhập mật khẩu" required />
            <DSFormField label="Email" placeholder="example@email.com" errorMessage="Email không hợp lệ" error />
            <DSButton variant="primary" fullWidth>Đăng nhập</DSButton>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSNavLink</div>
          <div style={s.row}>
            <DSNavLink href="#" active>Active Link</DSNavLink>
            <DSNavLink href="#">Normal Link</DSNavLink>
            <DSNavLink href="#">Another Link</DSNavLink>
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSBreadcrumb</div>
          <DSBreadcrumb items={[{ label: 'Trang chủ', href: '#' }, { label: 'Đăng nhập & Đăng ký', href: '#' }, { label: 'Đăng nhập' }]} />
        </div>

        <div style={s.group}>
          <div style={s.label}>DSTestCard</div>
          <div style={s.grid}>
            <DSTestCard image="https://picsum.photos/400/250?random=1" title="[COM] Bridge to Brisbane Fun Run" subtitle="IELTS Reading Practice" skill="reading" author="Admin Tea" views={5200} />
            <DSTestCard image="https://picsum.photos/400/250?random=2" title="IELTS Listening Practice Test 1" subtitle="Full Listening Test" skill="listening" author="Admin Tea" views={3800} />
            <DSTestCard image="https://picsum.photos/400/250?random=3" title="IELTS Full Test — Academic" subtitle="Complete Practice" skill="writing" author="Admin Tea" views={7100} />
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSBlogCard</div>
          <div style={s.grid}>
            <DSBlogCard image="https://picsum.photos/400/250?random=4" title="Mastering IELTS Reading: Tips for Band 7+" excerpt="Proven strategies to improve your Reading score." category="IELTS Tips" date="25/03/2026" readTime="5 min" />
            <DSBlogCard image="https://picsum.photos/400/250?random=5" title="Listening Prediction March 2026" excerpt="Forecast bộ đề IELTS Listening dự đoán kỳ thi." category="Prediction" date="20/03/2026" readTime="3 min" />
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSStatCard</div>
          <div style={s.grid}>
            <DSStatCard icon="📝" value="128" label="Tests Completed" trend={{ value: '+12%', positive: true }} />
            <DSStatCard icon="⏱️" value="45h" label="Study Hours" trend={{ value: '+8%', positive: true }} />
            <DSStatCard icon="🎯" value="6.5" label="Avg Band Score" trend={{ value: '-0.5', positive: false }} />
          </div>
        </div>

        <div style={s.group}>
          <div style={s.label}>DSPricingCard</div>
          <div style={s.grid}>
            <DSPricingCard name="Basic" price="299,000đ" priceLabel="/tháng" features={['Truy cập đề thi Reading', 'Truy cập đề thi Listening', 'Giải thích đáp án chi tiết']} />
            <DSPricingCard name="Premium" price="499,000đ" priceLabel="/tháng" popular features={['Tất cả tính năng Basic', 'Prediction đề mới nhất', 'Hỗ trợ Speaking & Writing', 'Analytics & Progress']} />
            <DSPricingCard name="Enterprise" price="1,000,000đ" priceLabel="/tháng" features={['Tất cả tính năng Premium', 'Truy cập không giới hạn', 'Priority support']} />
          </div>
        </div>
      </div>

      <DSDivider />

      {/* Organisms */}
      <div style={s.section}>
        <h2 style={s.title}>5. Organisms</h2>
        <p style={s.sub}>Complex, self-contained sections</p>
      </div>

      <div style={{ marginBottom: 48 }}>
        <div style={{ ...s.section, paddingBottom: 8 }}><div style={s.label}>DSHeader</div></div>
        <DSHeader navItems={NAV} />
      </div>

      <div style={s.section}>
        <div style={s.label}>DSCTABanner</div>
        <div style={{ marginTop: 16 }}>
          <DSCTABanner title="Sẵn sàng cho kì thi IELTS máy?" subtitle="Ôn luyện trên các bài thi sát thực đề, xem giải thích chi tiết trước khi bước vào phòng thi!" ctaText="Bắt đầu luyện thi" />
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <div style={{ ...s.section, paddingBottom: 8 }}><div style={s.label}>DSFooter</div></div>
        <DSFooter
          description="IELTS PREDICTION Test (IPT) specializes in providing highly accurate test content."
          columns={FOOTER_COLS}
          contactInfo={{ phone: '0927004848', email: 'ieltsprediction@gmail.com', address: '1G203 North Kirkland Blvd.' }}
          socialLinks={[{ icon: 'f', href: '#', label: 'Facebook' }, { icon: 'yt', href: '#', label: 'YouTube' }, { icon: 'in', href: '#', label: 'LinkedIn' }]}
        />
      </div>
    </div>
  );
}
