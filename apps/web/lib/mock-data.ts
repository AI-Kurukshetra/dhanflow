export type Client = {
  id: string;
  name: string;
  segment: string;
  risk_profile: 'Low' | 'Moderate' | 'High';
  aum: number;
  status: 'Active' | 'Pending';
};

export type Holding = {
  symbol: string;
  name: string;
  allocation: number;
  value: number;
  change: number;
};

export type Transaction = {
  id: string;
  client: string;
  type: 'Buy' | 'Sell' | 'SIP';
  amount: number;
  asset: string;
  date: string;
};

export const mockClients: Client[] = [
  { id: 'c1', name: 'Aarav Capital Family', segment: 'HNWI', risk_profile: 'Moderate', aum: 9200000, status: 'Active' },
  { id: 'c2', name: 'Blue Oak Ventures', segment: 'Institutional', risk_profile: 'High', aum: 16100000, status: 'Active' },
  { id: 'c3', name: 'Iris Holdings', segment: 'Retail Plus', risk_profile: 'Low', aum: 3400000, status: 'Pending' },
  { id: 'c4', name: 'Northstar Trust', segment: 'HNWI', risk_profile: 'Moderate', aum: 11800000, status: 'Active' },
];

export const mockHoldings: Holding[] = [
  { symbol: 'NIFTYBEES', name: 'NIFTY ETF', allocation: 32, value: 8550000, change: 4.1 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', allocation: 18, value: 4810000, change: 2.7 },
  { symbol: 'TCS', name: 'TCS', allocation: 14, value: 3690000, change: -1.2 },
  { symbol: 'GOLD', name: 'Gold ETF', allocation: 12, value: 3150000, change: 3.5 },
  { symbol: 'CASH', name: 'Liquid Funds', allocation: 9, value: 2400000, change: 0.5 },
  { symbol: 'BONDS', name: 'Corporate Bonds', allocation: 15, value: 4000000, change: 1.1 },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', client: 'Aarav Capital Family', type: 'Buy', amount: 450000, asset: 'NIFTY ETF', date: '2026-03-13' },
  { id: 't2', client: 'Blue Oak Ventures', type: 'Sell', amount: 210000, asset: 'TCS', date: '2026-03-12' },
  { id: 't3', client: 'Iris Holdings', type: 'SIP', amount: 85000, asset: 'Balanced Fund', date: '2026-03-11' },
  { id: 't4', client: 'Northstar Trust', type: 'Buy', amount: 390000, asset: 'Gold ETF', date: '2026-03-10' },
  { id: 't5', client: 'Aarav Capital Family', type: 'Buy', amount: 275000, asset: 'Corporate Bonds', date: '2026-03-09' },
];

export const portfolioHistory = [
  { month: 'Oct', value: 2.41 },
  { month: 'Nov', value: 2.53 },
  { month: 'Dec', value: 2.58 },
  { month: 'Jan', value: 2.62 },
  { month: 'Feb', value: 2.71 },
  { month: 'Mar', value: 2.83 },
];

export const benchmarkHistory = [
  { month: 'Oct', portfolio: 2.41, benchmark: 2.36 },
  { month: 'Nov', portfolio: 2.53, benchmark: 2.41 },
  { month: 'Dec', portfolio: 2.58, benchmark: 2.49 },
  { month: 'Jan', portfolio: 2.62, benchmark: 2.55 },
  { month: 'Feb', portfolio: 2.71, benchmark: 2.63 },
  { month: 'Mar', portfolio: 2.83, benchmark: 2.7 },
];

export const allocationData = [
  { name: 'Equity', value: 49 },
  { name: 'Debt', value: 24 },
  { name: 'Gold', value: 12 },
  { name: 'International', value: 8 },
  { name: 'Cash', value: 7 },
];
