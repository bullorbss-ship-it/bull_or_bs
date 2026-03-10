import { ImageResponse } from 'next/og';
import { getArticleBySlug, getAllArticles } from '@/lib/content';

export const runtime = 'nodejs';
export const alt = 'BullOrBS Article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

function extractGrade(verdict: string): string | null {
  const match = verdict.match(/GRADE:\s*([A-F][+-]?)/i);
  return match ? match[1] : null;
}

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#10B981';
  if (grade.startsWith('B')) return '#F59E0B';
  if (grade.startsWith('C')) return '#F97316';
  if (grade.startsWith('D')) return '#EF4444';
  return '#EF4444'; // F
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0F172A', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: 48 }}>BullOrBS</span>
        </div>
      ),
      { ...size }
    );
  }

  const grade = extractGrade(article.verdict);
  const isRoast = article.type === 'roast';
  const typeLabel = isRoast ? 'ROAST' : 'AI PICK';
  const typeBg = isRoast ? '#EF4444' : '#10B981';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#0F172A',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top bar: logo + type badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', background: '#fff', padding: '4px 12px', borderRadius: '6px' }}>Bull</span>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#94A3B8' }}>Or</span>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#10B981' }}>BS</span>
          </div>
          <div
            style={{
              display: 'flex',
              background: typeBg,
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
              padding: '8px 20px',
              borderRadius: '8px',
              letterSpacing: '2px',
            }}
          >
            {typeLabel}
          </div>
        </div>

        {/* Middle: title + ticker */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
          {article.ticker && (
            <span style={{ fontSize: 28, fontWeight: 700, color: '#94A3B8', letterSpacing: '3px' }}>
              {article.ticker}
            </span>
          )}
          <span
            style={{
              fontSize: article.title.length > 60 ? 40 : 48,
              fontWeight: 800,
              color: '#F8FAFC',
              lineHeight: 1.2,
              maxWidth: grade ? '850px' : '100%',
            }}
          >
            {article.title}
          </span>
        </div>

        {/* Bottom: grade circle + URL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 18, color: '#64748B' }}>bullorbs.com</span>
          {grade && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                border: `6px solid ${gradeColor(grade)}`,
                position: 'absolute',
                right: '60px',
                bottom: '60px',
              }}
            >
              <span style={{ fontSize: 56, fontWeight: 800, color: gradeColor(grade) }}>{grade}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
