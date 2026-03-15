import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const runtime = 'nodejs';

function getGradeColor(grade: string): string {
  const n = parseInt(grade, 10);
  if (!isNaN(n)) {
    if (n >= 8) return '#10B981';
    if (n >= 6) return '#F59E0B';
    if (n >= 4) return '#F97316';
    return '#EF4444';
  }
  const LETTER_COLORS: Record<string, string> = {
    A: '#F59E0B', B: '#10B981', C: '#F59E0B', D: '#F97316', F: '#EF4444',
  };
  return LETTER_COLORS[grade?.toUpperCase()] || '#94A3B8';
}

function getGradeLabel(grade: string): string {
  const n = parseInt(grade, 10);
  if (!isNaN(n)) {
    if (n >= 8) return 'STRONG BUY SIGNAL';
    if (n >= 6) return 'MIXED SIGNAL';
    if (n >= 4) return 'PROCEED WITH CAUTION';
    return 'RED FLAG';
  }
  const upper = grade?.toUpperCase();
  if (upper === 'A') return 'TOP RATED';
  if (upper === 'B') return 'SOLID PICK';
  if (upper === 'C') return 'MIXED BAG';
  if (upper === 'D') return 'WEAK';
  if (upper === 'F') return 'AVOID';
  return '';
}

function getAccentBg(grade: string): string {
  const n = parseInt(grade, 10);
  if (!isNaN(n)) {
    if (n >= 8) return 'rgba(16, 185, 129, 0.08)';
    if (n >= 6) return 'rgba(245, 158, 11, 0.08)';
    if (n >= 4) return 'rgba(249, 115, 22, 0.08)';
    return 'rgba(239, 68, 68, 0.08)';
  }
  return 'rgba(16, 185, 129, 0.08)';
}

function BrandBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>Bull</span>
        <span style={{ fontSize: 32, fontWeight: 700, color: '#64748B', fontFamily: 'monospace' }}>Or</span>
        <span style={{ fontSize: 32, fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>BS</span>
      </div>
      <span style={{ fontSize: 16, color: '#475569', fontFamily: 'monospace' }}>
        {siteConfig.url.replace('https://', '')}
      </span>
    </div>
  );
}

function StockOG({ ticker, company, exchange }: { ticker: string; company: string; exchange: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
        padding: '50px 60px',
      }}
    >
      <BrandBar />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
          <span style={{ fontSize: 100, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
            {ticker}
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              padding: '6px 18px',
              borderRadius: '9999px',
              fontFamily: 'monospace',
            }}
          >
            {exchange}
          </span>
        </div>
        <span style={{ fontSize: 28, color: '#94A3B8', lineHeight: 1.3 }}>
          {company}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 4, height: 20, backgroundColor: '#10B981', borderRadius: 2 }} />
        <span style={{ fontSize: 18, color: '#94A3B8', fontFamily: 'monospace' }}>
          Should you buy {ticker}? Read the AI analysis →
        </span>
      </div>
    </div>
  );
}

function ArticleOG({ title, grade, articleType, ticker }: { title: string; grade: string; articleType: string; ticker: string }) {
  const gradeColor = getGradeColor(grade);
  const isNumeric = !isNaN(parseInt(grade, 10));
  const isRoast = articleType === 'roast';
  const isTake = articleType === 'take';
  const gradeLabel = getGradeLabel(grade);
  const accentBg = getAccentBg(grade);

  const badgeLabel = isRoast ? '🔥 ROAST' : isTake ? '📰 NEWS TAKE' : '🏆 AI PICK';
  const badgeColor = isRoast ? '#EF4444' : isTake ? '#3B82F6' : '#10B981';

  // Truncate title smartly for readability
  const displayTitle = title.length > 80 ? title.substring(0, 77) + '...' : title;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
        padding: '50px 60px',
        backgroundImage: `radial-gradient(ellipse 80% 60% at 80% 100%, ${accentBg}, transparent)`,
      }}
    >
      {/* Top: brand + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BrandBar />
      </div>

      {/* Middle: the hook */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        {/* Left: Title + badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          {/* Type badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: badgeColor,
                backgroundColor: `${badgeColor}1A`,
                padding: '6px 16px',
                borderRadius: '9999px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {badgeLabel}
            </span>
            {ticker && (
              <span style={{ fontSize: 24, fontWeight: 700, color: '#94A3B8', fontFamily: 'monospace' }}>
                {ticker}
              </span>
            )}
          </div>

          {/* Title — the hook */}
          <span
            style={{
              fontSize: displayTitle.length > 60 ? 30 : displayTitle.length > 40 ? 36 : 40,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.25,
            }}
          >
            {displayTitle}
          </span>
        </div>

        {/* Right: Grade circle (big, dominant) */}
        {grade && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '140px',
                height: '140px',
                borderRadius: '9999px',
                backgroundColor: `${gradeColor}1A`,
                border: `4px solid ${gradeColor}`,
                gap: '2px',
              }}
            >
              <span style={{ fontSize: isNumeric ? 64 : 72, fontWeight: 700, color: gradeColor, fontFamily: 'monospace' }}>
                {isNumeric ? grade : grade.toUpperCase()}
              </span>
              {isNumeric && (
                <span style={{ fontSize: 24, fontWeight: 600, color: `${gradeColor}99`, fontFamily: 'monospace' }}>
                  /10
                </span>
              )}
            </div>
            {gradeLabel && (
              <span style={{ fontSize: 13, fontWeight: 700, color: gradeColor, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {gradeLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom: CTA line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 4, height: 20, backgroundColor: gradeColor || '#10B981', borderRadius: 2 }} />
        <span style={{ fontSize: 17, color: '#94A3B8', fontFamily: 'monospace' }}>
          {isRoast ? 'AI fact-checked this stock recommendation →' :
           isTake ? 'What this means for your portfolio →' :
           'See which stock survived the AI tournament →'}
        </span>
      </div>
    </div>
  );
}

function TakeOG({ title, source }: { title: string; source: string }) {
  const displayTitle = title.length > 90 ? title.substring(0, 87) + '...' : title;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
        padding: '50px 60px',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(59, 130, 246, 0.06), transparent)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BrandBar />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            📰 BREAKING
          </span>
          {source && (
            <span style={{ fontSize: 16, color: '#64748B', fontFamily: 'monospace' }}>
              via {source}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: displayTitle.length > 70 ? 32 : 38,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.3,
          }}
        >
          {displayTitle}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 4, height: 20, backgroundColor: '#3B82F6', borderRadius: 2 }} />
        <span style={{ fontSize: 17, color: '#94A3B8', fontFamily: 'monospace' }}>
          Bull or BS for your portfolio? Read the breakdown →
        </span>
      </div>
    </div>
  );
}

function DefaultOG() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
        padding: '50px 60px',
        backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 80%, rgba(16, 185, 129, 0.08), transparent)',
      }}
    >
      <BrandBar />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <span style={{ fontSize: 52, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
          AI-Powered Stock Analysis
        </span>
        <span style={{ fontSize: 26, color: '#94A3B8', lineHeight: 1.4 }}>
          We fact-check stock recommendations so you don&apos;t have to.
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{
            fontSize: 15, fontWeight: 700, color: '#EF4444', fontFamily: 'monospace',
            backgroundColor: 'rgba(239, 68, 68, 0.12)', padding: '6px 14px', borderRadius: '9999px',
          }}>
            🔥 ROASTS
          </span>
          <span style={{
            fontSize: 15, fontWeight: 700, color: '#10B981', fontFamily: 'monospace',
            backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '6px 14px', borderRadius: '9999px',
          }}>
            🏆 AI PICKS
          </span>
          <span style={{
            fontSize: 15, fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace',
            backgroundColor: 'rgba(59, 130, 246, 0.12)', padding: '6px 14px', borderRadius: '9999px',
          }}>
            📰 NEWS TAKES
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 4, height: 20, backgroundColor: '#10B981', borderRadius: 2 }} />
        <span style={{ fontSize: 17, color: '#94A3B8', fontFamily: 'monospace' }}>
          Free. Transparent. No paywall. No BS.
        </span>
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'default';

  let element: React.JSX.Element;

  switch (type) {
    case 'stock':
      element = (
        <StockOG
          ticker={searchParams.get('ticker') || 'TICKER'}
          company={searchParams.get('company') || 'Company Name'}
          exchange={searchParams.get('exchange') || 'TSX'}
        />
      );
      break;
    case 'article': {
      const articleType = searchParams.get('articleType') || 'roast';
      if (articleType === 'take') {
        element = (
          <TakeOG
            title={searchParams.get('title') || 'News Take'}
            source={decodeURIComponent(searchParams.get('source') || '')}
          />
        );
      } else {
        element = (
          <ArticleOG
            title={searchParams.get('title') || 'Stock Analysis'}
            grade={searchParams.get('grade') || ''}
            articleType={articleType}
            ticker={searchParams.get('ticker') || ''}
          />
        );
      }
      break;
    }
    default:
      element = <DefaultOG />;
  }

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
