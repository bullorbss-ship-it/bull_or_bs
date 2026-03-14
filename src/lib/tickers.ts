export interface TickerInfo {
  ticker: string;
  company: string;
  exchange: 'TSX' | 'NYSE' | 'NASDAQ';
  sector: string;
  country: 'CA' | 'US';
}

// Top Canadian TSX stocks
export const TSX_TICKERS: TickerInfo[] = [
  { ticker: 'RY', company: 'Royal Bank of Canada', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'TD', company: 'Toronto-Dominion Bank', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'BNS', company: 'Bank of Nova Scotia', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'BMO', company: 'Bank of Montreal', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'CM', company: 'Canadian Imperial Bank of Commerce', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'CNR', company: 'Canadian National Railway', exchange: 'TSX', sector: 'Industrials', country: 'CA' },
  { ticker: 'CP', company: 'Canadian Pacific Kansas City', exchange: 'TSX', sector: 'Industrials', country: 'CA' },
  { ticker: 'ENB', company: 'Enbridge Inc.', exchange: 'TSX', sector: 'Energy', country: 'CA' },
  { ticker: 'TRP', company: 'TC Energy Corp.', exchange: 'TSX', sector: 'Energy', country: 'CA' },
  { ticker: 'SU', company: 'Suncor Energy', exchange: 'TSX', sector: 'Energy', country: 'CA' },
  { ticker: 'CNQ', company: 'Canadian Natural Resources', exchange: 'TSX', sector: 'Energy', country: 'CA' },
  { ticker: 'IMO', company: 'Imperial Oil', exchange: 'TSX', sector: 'Energy', country: 'CA' },
  { ticker: 'CVE', company: 'Cenovus Energy', exchange: 'TSX', sector: 'Energy', country: 'CA' },
  { ticker: 'SHOP', company: 'Shopify Inc.', exchange: 'TSX', sector: 'Technology', country: 'CA' },
  { ticker: 'CSU', company: 'Constellation Software', exchange: 'TSX', sector: 'Technology', country: 'CA' },
  { ticker: 'OTEX', company: 'OpenText Corp.', exchange: 'TSX', sector: 'Technology', country: 'CA' },
  { ticker: 'KXS', company: 'Kinaxis Inc.', exchange: 'TSX', sector: 'Technology', country: 'CA' },
  { ticker: 'DCBO', company: 'Docebo Inc.', exchange: 'TSX', sector: 'Technology', country: 'CA' },
  { ticker: 'T', company: 'TELUS Corp.', exchange: 'TSX', sector: 'Communications', country: 'CA' },
  { ticker: 'BCE', company: 'BCE Inc.', exchange: 'TSX', sector: 'Communications', country: 'CA' },
  { ticker: 'RCI.B', company: 'Rogers Communications', exchange: 'TSX', sector: 'Communications', country: 'CA' },
  { ticker: 'MFC', company: 'Manulife Financial', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'SLF', company: 'Sun Life Financial', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'GWO', company: 'Great-West Lifeco', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'ABX', company: 'Barrick Gold Corp.', exchange: 'TSX', sector: 'Materials', country: 'CA' },
  { ticker: 'NTR', company: 'Nutrien Ltd.', exchange: 'TSX', sector: 'Materials', country: 'CA' },
  { ticker: 'FNV', company: 'Franco-Nevada Corp.', exchange: 'TSX', sector: 'Materials', country: 'CA' },
  { ticker: 'WFG', company: 'West Fraser Timber', exchange: 'TSX', sector: 'Materials', country: 'CA' },
  { ticker: 'ATD', company: 'Alimentation Couche-Tard', exchange: 'TSX', sector: 'Consumer Staples', country: 'CA' },
  { ticker: 'L', company: 'Loblaw Companies', exchange: 'TSX', sector: 'Consumer Staples', country: 'CA' },
  { ticker: 'WN', company: 'George Weston Ltd.', exchange: 'TSX', sector: 'Consumer Staples', country: 'CA' },
  { ticker: 'DOL', company: 'Dollarama Inc.', exchange: 'TSX', sector: 'Consumer Discretionary', country: 'CA' },
  { ticker: 'BAM', company: 'Brookfield Asset Management', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'BN', company: 'Brookfield Corp.', exchange: 'TSX', sector: 'Financials', country: 'CA' },
  { ticker: 'GIB.A', company: 'CGI Inc.', exchange: 'TSX', sector: 'Technology', country: 'CA' },
  { ticker: 'WSP', company: 'WSP Global Inc.', exchange: 'TSX', sector: 'Industrials', country: 'CA' },
  // Canadian ETFs
  { ticker: 'XIU', company: 'iShares S&P/TSX 60 Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'XIC', company: 'iShares Core S&P/TSX Capped Composite Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'VFV', company: 'Vanguard S&P 500 Index ETF (CAD)', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'XEQT', company: 'iShares Core Equity ETF Portfolio', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'VEQT', company: 'Vanguard All-Equity ETF Portfolio', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'ZEB', company: 'BMO Equal Weight Banks Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'ZAG', company: 'BMO Aggregate Bond Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'ZWB', company: 'BMO Covered Call Canadian Banks ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'XEI', company: 'iShares Core MSCI Canadian Quality Dividend Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'ZDV', company: 'BMO Canadian Dividend ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'VGRO', company: 'Vanguard Growth ETF Portfolio', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'VBAL', company: 'Vanguard Balanced ETF Portfolio', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'XAW', company: 'iShares Core MSCI All Country World ex Canada Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'HXS', company: 'Global X S&P 500 Index Corporate Class ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'TEC', company: 'TD Global Technology Leaders Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'VSP', company: 'Vanguard S&P 500 Index ETF (CAD-Hedged)', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'VDY', company: 'Vanguard FTSE Canadian High Dividend Yield Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'ZGLD', company: 'BMO Gold Bullion ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'XMV', company: 'iShares Edge MSCI Min Vol Canada Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'XIU', company: 'iShares S&P/TSX 60 Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'XIC', company: 'iShares Core S&P/TSX Capped Composite Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'PSA', company: 'Purpose High Interest Savings ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'ZEQT', company: 'BMO All-Equity ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'HEQT', company: 'Global X All-Equity Asset Allocation ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'FEQT', company: 'Fidelity All-in-One Equity ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'HEQL', company: 'Global X Enhanced All-Equity Asset Allocation ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'MIX', company: 'Hamilton Enhanced Mixed Asset ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'VCN', company: 'Vanguard FTSE Canada All Cap Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'VXC', company: 'Vanguard FTSE Global All Cap ex Canada Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'ZSP', company: 'BMO S&P 500 Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
  { ticker: 'ZCN', company: 'BMO S&P/TSX Capped Composite Index ETF', exchange: 'TSX', sector: 'ETF', country: 'CA' },
];

// Top US stocks
export const US_TICKERS: TickerInfo[] = [
  { ticker: 'AAPL', company: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
  { ticker: 'MSFT', company: 'Microsoft Corp.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
  { ticker: 'GOOGL', company: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
  { ticker: 'AMZN', company: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', country: 'US' },
  { ticker: 'NVDA', company: 'NVIDIA Corp.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
  { ticker: 'META', company: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
  { ticker: 'TSLA', company: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', country: 'US' },
  { ticker: 'JPM', company: 'JPMorgan Chase', exchange: 'NYSE', sector: 'Financials', country: 'US' },
  { ticker: 'V', company: 'Visa Inc.', exchange: 'NYSE', sector: 'Financials', country: 'US' },
  { ticker: 'JNJ', company: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare', country: 'US' },
  { ticker: 'WMT', company: 'Walmart Inc.', exchange: 'NYSE', sector: 'Consumer Staples', country: 'US' },
  { ticker: 'PG', company: 'Procter & Gamble', exchange: 'NYSE', sector: 'Consumer Staples', country: 'US' },
  { ticker: 'MA', company: 'Mastercard Inc.', exchange: 'NYSE', sector: 'Financials', country: 'US' },
  { ticker: 'HD', company: 'Home Depot Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary', country: 'US' },
  { ticker: 'DIS', company: 'Walt Disney Co.', exchange: 'NYSE', sector: 'Communications', country: 'US' },
  { ticker: 'BAC', company: 'Bank of America', exchange: 'NYSE', sector: 'Financials', country: 'US' },
  { ticker: 'XOM', company: 'Exxon Mobil Corp.', exchange: 'NYSE', sector: 'Energy', country: 'US' },
  { ticker: 'KO', company: 'Coca-Cola Co.', exchange: 'NYSE', sector: 'Consumer Staples', country: 'US' },
  { ticker: 'PEP', company: 'PepsiCo Inc.', exchange: 'NASDAQ', sector: 'Consumer Staples', country: 'US' },
  { ticker: 'COST', company: 'Costco Wholesale', exchange: 'NASDAQ', sector: 'Consumer Staples', country: 'US' },
  { ticker: 'AMD', company: 'Advanced Micro Devices', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
  { ticker: 'NFLX', company: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Communications', country: 'US' },
  { ticker: 'CRM', company: 'Salesforce Inc.', exchange: 'NYSE', sector: 'Technology', country: 'US' },
  { ticker: 'INTC', company: 'Intel Corp.', exchange: 'NASDAQ', sector: 'Technology', country: 'US' },
  { ticker: 'PLTR', company: 'Palantir Technologies', exchange: 'NYSE', sector: 'Technology', country: 'US' },
  // US ETFs
  { ticker: 'SPY', company: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'QQQ', company: 'Invesco QQQ Trust (Nasdaq-100)', exchange: 'NASDAQ', sector: 'ETF', country: 'US' },
  { ticker: 'VTI', company: 'Vanguard Total Stock Market ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'VOO', company: 'Vanguard S&P 500 ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'IWM', company: 'iShares Russell 2000 ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'DIA', company: 'SPDR Dow Jones Industrial Average ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'ARKK', company: 'ARK Innovation ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'GLD', company: 'SPDR Gold Shares ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'TLT', company: 'iShares 20+ Year Treasury Bond ETF', exchange: 'NASDAQ', sector: 'ETF', country: 'US' },
  { ticker: 'XLF', company: 'Financial Select Sector SPDR Fund', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'XLE', company: 'Energy Select Sector SPDR Fund', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'VGT', company: 'Vanguard Information Technology ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'SCHD', company: 'Schwab US Dividend Equity ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'VYM', company: 'Vanguard High Dividend Yield ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'EEM', company: 'iShares MSCI Emerging Markets ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'ITOT', company: 'iShares Core S&P Total U.S. Stock Market ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'IEFA', company: 'iShares Core MSCI EAFE ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'IEMG', company: 'iShares Core MSCI Emerging Markets ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'VEA', company: 'Vanguard FTSE Developed Markets ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'VWO', company: 'Vanguard FTSE Emerging Markets ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
  { ticker: 'IVV', company: 'iShares Core S&P 500 ETF', exchange: 'NYSE', sector: 'ETF', country: 'US' },
];

export const ALL_TICKERS = [...TSX_TICKERS, ...US_TICKERS];

export function getTickerInfo(ticker: string): TickerInfo | undefined {
  return ALL_TICKERS.find(t => t.ticker.toUpperCase() === ticker.toUpperCase());
}

export function getTickersByExchange(exchange: 'TSX' | 'NYSE' | 'NASDAQ'): TickerInfo[] {
  return ALL_TICKERS.filter(t => t.exchange === exchange);
}

export function getTickersBySector(sector: string): TickerInfo[] {
  return ALL_TICKERS.filter(t => t.sector === sector);
}

export function getTickersByCountry(country: 'CA' | 'US'): TickerInfo[] {
  return ALL_TICKERS.filter(t => t.country === country);
}

export function getAllSectors(): string[] {
  return [...new Set(ALL_TICKERS.map(t => t.sector))].sort();
}

export function tickerToSlug(ticker: string): string {
  return ticker.toLowerCase().replace(/\./g, '-');
}

export function slugToTicker(slug: string): string {
  return slug.toUpperCase().replace(/-/g, '.');
}
