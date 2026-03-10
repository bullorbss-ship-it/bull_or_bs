import { ImageResponse } from 'next/og';
import { getArticleBySlug, getAllArticles } from '@/lib/content';
import type { Article } from '@/lib/types';

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
  return '#EF4444';
}

function gradePercent(grade: string): number {
  const map: Record<string, number> = {
    'A+': 97, 'A': 90, 'A-': 85,
    'B+': 82, 'B': 75, 'B-': 70,
    'C+': 67, 'C': 60, 'C-': 55,
    'D+': 52, 'D': 45, 'D-': 40,
    'F': 20,
  };
  return map[grade] ?? 50;
}

function gradeLabel(grade: string): string {
  if (grade.startsWith('A')) return 'BULL';
  if (grade.startsWith('B')) return 'LEANING BULL';
  if (grade.startsWith('C')) return 'MIXED';
  if (grade.startsWith('D')) return 'LEANING BS';
  return 'BS';
}

/* ── Shared: top bar (logo + badges) ── */
function TopBar({ article, typeBg, typeLabel }: { article: Article; typeBg: string; typeLabel: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', background: '#1E293B', border: '2px solid #334155', padding: '4px 14px', borderRadius: '8px' }}>Bull</span>
        <span style={{ fontSize: 32, fontWeight: 800, color: '#64748B', padding: '0 2px' }}>Or</span>
        <span style={{ fontSize: 32, fontWeight: 800, color: '#10B981' }}>BS</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {article.ticker && (
          <span style={{ fontSize: 22, fontWeight: 700, color: '#CBD5E1', background: '#1E293B', border: '2px solid #334155', padding: '6px 16px', borderRadius: '8px', letterSpacing: '2px' }}>
            {article.ticker}
          </span>
        )}
        <div style={{ display: 'flex', background: typeBg, color: '#fff', fontSize: 16, fontWeight: 700, padding: '8px 18px', borderRadius: '8px', letterSpacing: '2px' }}>
          {typeLabel}
        </div>
      </div>
    </div>
  );
}

/* ── ROAST image ── */
function RoastImage({ article }: { article: Article }) {
  const grade = extractGrade(article.verdict);
  const gColor = grade ? gradeColor(grade) : '#94A3B8';
  const pct = grade ? gradePercent(grade) : 50;
  const label = grade ? gradeLabel(grade) : '';
  const bars = [35, 55, 40, 70, 50, 85, 60, 75, 45, 90, 65, 80, 55, 70, 48];

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Background chart bars */}
      <div style={{ display: 'flex', position: 'absolute', bottom: 0, right: 0, width: '500px', height: '300px', alignItems: 'flex-end', gap: '8px', padding: '0 40px 30px 0', opacity: 0.12 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ display: 'flex', width: '24px', height: `${h}%`, background: gColor, borderRadius: '4px 4px 0 0' }} />
        ))}
      </div>

      {/* Accent line */}
      <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, #EF4444 0%, ${gColor} 100%)` }} />

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '48px 56px' }}>
        <TopBar article={article} typeBg="#EF4444" typeLabel="ROAST" />

        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', paddingRight: '200px' }}>
          <span style={{ fontSize: article.title.length > 70 ? 36 : article.title.length > 50 ? 42 : 48, fontWeight: 800, color: '#F8FAFC', lineHeight: 1.25, letterSpacing: '-0.5px' }}>
            {article.title}
          </span>
        </div>

        {/* Grade meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {grade && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#EF4444', letterSpacing: '1px' }}>BS</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: gColor, letterSpacing: '1px' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#10B981', letterSpacing: '1px' }}>BULL</span>
              </div>
              <div style={{ display: 'flex', width: '100%', height: '12px', background: '#1E293B', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 40%, #10B981 100%)', borderRadius: '6px' }} />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: 16, color: '#475569' }}>bullorbs.com</span>
            {grade && <span style={{ fontSize: 16, fontWeight: 700, color: gColor }}>Grade: {grade}</span>}
          </div>
        </div>
      </div>

      {/* Grade badge */}
      {grade && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: '56px', top: '50%', transform: 'translateY(-50%)', marginTop: '-30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '130px', height: '130px', borderRadius: '65px', border: `5px solid ${gColor}`, background: `${gColor}15` }}>
            <span style={{ fontSize: 64, fontWeight: 800, color: gColor }}>{grade}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PICK image — tournament bracket ── */
function PickImage({ article }: { article: Article }) {
  const candidates = article.content.candidates || [];
  const winner = article.content.winner;
  const eliminated = candidates.filter(c => c.status === 'eliminated');
  const considered = candidates.filter(c => c.status === 'considered' || c.status === 'selected');

  // Show up to 6 eliminated tickers and up to 4 considered
  const showEliminated = eliminated.slice(0, 6);
  const showConsidered = considered.filter(c => c.ticker !== winner?.ticker).slice(0, 4);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Accent line */}
      <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10B981 0%, #F59E0B 100%)' }} />

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '44px 56px' }}>
        <TopBar article={article} typeBg="#10B981" typeLabel="AI PICK" />

        {/* Title */}
        <div style={{ display: 'flex', marginTop: '24px' }}>
          <span style={{ fontSize: article.title.length > 70 ? 32 : article.title.length > 50 ? 36 : 40, fontWeight: 800, color: '#F8FAFC', lineHeight: 1.25, letterSpacing: '-0.5px', maxWidth: '700px' }}>
            {article.title}
          </span>
        </div>

        {/* Tournament bracket visual */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '20px', marginTop: '16px' }}>
          {/* Left: eliminated tickers (crossed out) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', letterSpacing: '1px', marginBottom: '2px' }}>ELIMINATED</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '280px' }}>
              {showEliminated.map((c) => (
                <div key={c.ticker} style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#64748B',
                  background: '#1E293B',
                  border: '1px solid #334155',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  textDecoration: 'line-through',
                  opacity: 0.6,
                }}>
                  {c.ticker}
                </div>
              ))}
              {eliminated.length > 6 && (
                <span style={{ fontSize: 12, color: '#475569', padding: '4px 6px' }}>+{eliminated.length - 6}</span>
              )}
            </div>
          </div>

          {/* Middle: arrow / flow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', width: '2px', height: '40px', background: '#334155' }} />
            <span style={{ fontSize: 20, color: '#475569' }}>→</span>
            <div style={{ display: 'flex', width: '2px', height: '40px', background: '#334155' }} />
          </div>

          {/* Finalists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '1px', marginBottom: '2px' }}>FINALISTS</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '220px' }}>
              {showConsidered.map((c) => (
                <div key={c.ticker} style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#CBD5E1',
                  background: '#1E293B',
                  border: '1px solid #475569',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}>
                  {c.ticker}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow to winner */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: 20, color: '#10B981' }}>→</span>
          </div>

          {/* Winner */}
          {winner && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', letterSpacing: '1px' }}>WINNER</span>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                border: '4px solid #10B981',
                background: '#10B98115',
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#10B981' }}>{winner.ticker}</span>
                {winner.score && (
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#F59E0B', marginTop: '2px' }}>{winner.score}/10</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom: candidate count + URL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, color: '#475569' }}>bullorbs.com</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>{candidates.length} candidates analyzed</span>
        </div>
      </div>
    </div>
  );
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

  const isRoast = article.type === 'roast';
  const element = isRoast ? <RoastImage article={article} /> : <PickImage article={article} />;

  return new ImageResponse(element, { ...size });
}
