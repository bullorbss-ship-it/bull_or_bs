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

function BrandName() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ fontSize: 36, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
        Bull
      </span>
      <span style={{ fontSize: 36, fontWeight: 700, color: '#94A3B8', fontFamily: 'monospace' }}>
        Or
      </span>
      <span style={{ fontSize: 36, fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>
        BS
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
        padding: '60px',
      }}
    >
      <BrandName />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: 96, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
            {ticker}
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontFamily: 'monospace',
            }}
          >
            {exchange}
          </span>
        </div>
        <span style={{ fontSize: 32, color: '#94A3B8' }}>
          {company}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 18, color: '#64748B' }}>
          AI-Driven Stock Analysis
        </span>
        <span style={{ fontSize: 16, color: '#475569', fontFamily: 'monospace' }}>
          {siteConfig.url.replace('https://', '')}
        </span>
      </div>
    </div>
  );
}

function ArticleOG({ title, grade, articleType, ticker }: { title: string; grade: string; articleType: string; ticker: string }) {
  const gradeColor = getGradeColor(grade);
  const isNumeric = !isNaN(parseInt(grade, 10));
  const isRoast = articleType === 'roast';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: '#0F172A',
        padding: '60px',
      }}
    >
      {/* Top bar: brand + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BrandName />
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: isRoast ? '#EF4444' : '#10B981',
            backgroundColor: isRoast ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            padding: '8px 20px',
            borderRadius: '9999px',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {isRoast ? 'THE ROAST' : 'AI PICK'}
        </span>
      </div>

      {/* Middle: ticker + grade row, then title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Ticker + Grade row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {ticker && (
            <span style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
            }}>
              {ticker}
            </span>
          )}
          {grade && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isNumeric ? '120px' : '90px',
                height: '90px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: `3px solid ${gradeColor}`,
                flexShrink: 0,
                gap: '2px',
              }}
            >
              <span style={{ fontSize: isNumeric ? 48 : 56, fontWeight: 700, color: gradeColor, fontFamily: 'monospace' }}>
                {isNumeric ? grade : grade.toUpperCase()}
              </span>
              {isNumeric && (
                <span style={{ fontSize: 20, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>
                  /10
                </span>
              )}
            </div>
          )}
        </div>
        {/* Title */}
        <span
          style={{
            fontSize: title.length > 70 ? 28 : title.length > 50 ? 32 : 36,
            fontWeight: 600,
            color: '#94A3B8',
            lineHeight: 1.3,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </span>
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 18, color: '#64748B' }}>
          AI-Driven Stock Analysis
        </span>
        <span style={{ fontSize: 16, color: '#475569', fontFamily: 'monospace' }}>
          {siteConfig.url.replace('https://', '')}
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
        padding: '60px',
      }}
    >
      <BrandName />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <span style={{ fontSize: 48, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
          {siteConfig.tagline}
        </span>
        <span style={{ fontSize: 24, color: '#10B981', fontFamily: 'monospace' }}>
          Made in Canada
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 18, color: '#64748B' }}>
          Free. Transparent. No paywall.
        </span>
        <span style={{ fontSize: 16, color: '#475569', fontFamily: 'monospace' }}>
          {siteConfig.url.replace('https://', '')}
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
    case 'article':
      element = (
        <ArticleOG
          title={searchParams.get('title') || 'Stock Analysis'}
          grade={searchParams.get('grade') || ''}
          articleType={searchParams.get('articleType') || 'roast'}
          ticker={searchParams.get('ticker') || ''}
        />
      );
      break;
    default:
      element = <DefaultOG />;
  }

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
  });
}
