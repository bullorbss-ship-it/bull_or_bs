import fs from 'fs';
import path from 'path';

export interface StockData {
  ticker: string;
  company: string;
  exchange: string;
  sector: string;
  country: string;
  overview: string;
  bullCase: string[];
  bearCase: string[];
  keyMetrics: {
    marketCap: string;
    peRatio: string;
    dividendYield: string;
    sector: string;
  };
  analystSummary: string;
  seoDescription: string;
  generatedAt: string;
  generatedBy: string;
}

const DATA_DIR = path.join(process.cwd(), 'data', 'stocks');

export function getStockData(ticker: string): StockData | null {
  const slug = ticker.toLowerCase().replace(/\./g, '-');
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
