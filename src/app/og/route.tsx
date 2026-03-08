import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const runtime = 'edge';

const GRADE_COLORS: Record<string, string> = {
  A: '#F59E0B',
  B: '#10B981',
  C: '#F59E0B',
  D: '#F97316',
  F: '#EF4444',
};

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

function ArticleOG({ title, grade, articleType }: { title: string; grade: string; articleType: string }) {
  const gradeColor = GRADE_COLORS[grade?.toUpperCase()] || '#94A3B8';
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BrandName />
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: isRoast ? '#EF4444' : '#10B981',
            backgroundColor: isRoast ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {isRoast ? 'THE ROAST' : 'AI PICK'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        {grade && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: `3px solid ${gradeColor}`,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 72, fontWeight: 700, color: gradeColor, fontFamily: 'monospace' }}>
              {grade.toUpperCase()}
            </span>
          </div>
        )}
        <span
          style={{
            fontSize: title.length > 60 ? 36 : 44,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
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
