const { createClient } = require('@supabase/supabase-js');

const BENCHMARKS = {
  nifty_50: 'Nifty 50',
  sensex: 'Sensex',
};

function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function percentile(sortedNumbers, p) {
  if (!sortedNumbers.length) return 0;
  const index = Math.max(0, Math.min(sortedNumbers.length - 1, Math.floor(p * sortedNumbers.length)));
  return sortedNumbers[index];
}

function stdDev(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function randomNormal() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function inferRiskScore(annualVolatility, sharpeRatio) {
  const volFactor = Math.min(100, annualVolatility * 320);
  const sharpeFactor = Math.max(0, Math.min(100, 50 - sharpeRatio * 10));
  return Number(((volFactor * 0.7) + (sharpeFactor * 0.3)).toFixed(2));
}

function calculatePortfolioAnalytics(snapshotSeries, riskFreeRate = 0.05) {
  if (!snapshotSeries || snapshotSeries.length < 2) {
    return {
      portfolioGrowthPercent: 0,
      volatility: 0,
      sharpeRatio: 0,
      riskScore: 0,
    };
  }

  const sorted = [...snapshotSeries].sort(
    (a, b) => new Date(a.as_of_date).getTime() - new Date(b.as_of_date).getTime(),
  );

  const first = Number(sorted[0].total_value || 0);
  const last = Number(sorted[sorted.length - 1].total_value || 0);

  const dailyReturns = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = Number(sorted[i - 1].total_value || 0);
    const curr = Number(sorted[i].total_value || 0);
    if (prev > 0) dailyReturns.push((curr - prev) / prev);
  }

  const avgDaily = dailyReturns.length
    ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
    : 0;
  const dailyVolatility = stdDev(dailyReturns);
  const annualizedVolatility = dailyVolatility * Math.sqrt(252);
  const annualizedReturn = avgDaily * 252;
  const sharpeRatio = annualizedVolatility > 0
    ? (annualizedReturn - riskFreeRate) / annualizedVolatility
    : 0;

  return {
    portfolioGrowthPercent: first > 0 ? Number((((last - first) / first) * 100).toFixed(2)) : 0,
    volatility: Number(annualizedVolatility.toFixed(6)),
    sharpeRatio: Number(sharpeRatio.toFixed(4)),
    riskScore: inferRiskScore(annualizedVolatility, sharpeRatio),
  };
}

function simulateInvestmentProjection({
  initialInvestment,
  monthlyContribution,
  annualReturn,
  annualVolatility,
  years,
  iterations = 1000,
  targetValue = null,
}) {
  const months = years * 12;
  const monthlyMean = annualReturn / 12;
  const monthlyVol = annualVolatility / Math.sqrt(12);
  const outcomes = [];

  for (let i = 0; i < iterations; i += 1) {
    let value = initialInvestment;
    for (let m = 0; m < months; m += 1) {
      const shock = randomNormal() * monthlyVol;
      value = (value + monthlyContribution) * (1 + monthlyMean + shock);
      if (value < 0) value = 0;
    }
    outcomes.push(value);
  }

  outcomes.sort((a, b) => a - b);

  const p10 = percentile(outcomes, 0.1);
  const p50 = percentile(outcomes, 0.5);
  const p90 = percentile(outcomes, 0.9);
  const success = targetValue
    ? outcomes.filter((value) => value >= targetValue).length / outcomes.length
    : null;

  return {
    percentile10: Number(p10.toFixed(2)),
    percentile50: Number(p50.toFixed(2)),
    percentile90: Number(p90.toFixed(2)),
    probabilityOfSuccess: success === null ? null : Number(success.toFixed(4)),
    sampleSize: outcomes.length,
  };
}

async function getPortfolioDashboard(portfolioId, { from, to } = {}) {
  const supabase = createServerClient();

  const { data: portfolio, error: portfolioError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', portfolioId)
    .single();
  if (portfolioError) throw portfolioError;

  const txQuery = supabase
    .from('transactions')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('executed_at', { ascending: false });

  if (from) txQuery.gte('executed_at', from);
  if (to) txQuery.lte('executed_at', to);

  const { data: transactions, error: txError } = await txQuery;
  if (txError) throw txError;

  const { data: snapshots, error: snapshotError } = await supabase
    .from('portfolio_snapshots')
    .select('as_of_date,total_value')
    .eq('portfolio_id', portfolioId)
    .order('as_of_date', { ascending: true });
  if (snapshotError) throw snapshotError;

  const analytics = calculatePortfolioAnalytics(snapshots || []);

  const holdings = new Map();
  for (const tx of transactions || []) {
    if (!tx.asset_id) continue;

    const existing = holdings.get(tx.asset_id) || {
      quantity: 0,
      netInvested: 0,
    };

    const qty = Number(tx.quantity || 0);
    const net = Number(tx.net_amount || 0);

    if (tx.transaction_type === 'sell') {
      existing.quantity -= qty;
      existing.netInvested -= net;
    } else {
      existing.quantity += qty;
      existing.netInvested += net;
    }

    holdings.set(tx.asset_id, existing);
  }

  const totalInvested = [...holdings.values()].reduce((acc, item) => acc + Math.max(0, item.netInvested), 0);
  const allocation = [...holdings.entries()].map(([assetId, item]) => {
    const weight = totalInvested > 0 ? (Math.max(0, item.netInvested) / totalInvested) * 100 : 0;
    return {
      assetId,
      quantity: Number(item.quantity.toFixed(4)),
      investedValue: Number(item.netInvested.toFixed(2)),
      weightPercent: Number(weight.toFixed(2)),
    };
  });

  return {
    portfolio,
    analytics,
    allocation,
    transactionHistory: transactions || [],
    snapshotSeries: snapshots || [],
  };
}

async function getBenchmarkComparison(portfolioId, benchmark = 'nifty_50') {
  if (!BENCHMARKS[benchmark]) {
    throw new Error('Unsupported benchmark. Use nifty_50 or sensex');
  }

  const supabase = createServerClient();

  const { data: snapshots, error: snapshotError } = await supabase
    .from('portfolio_snapshots')
    .select('as_of_date,total_value')
    .eq('portfolio_id', portfolioId)
    .order('as_of_date', { ascending: true });

  if (snapshotError) throw snapshotError;

  const { data: benchmarkData, error: benchmarkError } = await supabase
    .from('benchmark_prices')
    .select('as_of_date,close_price')
    .eq('benchmark', benchmark)
    .order('as_of_date', { ascending: true });

  if (benchmarkError) throw benchmarkError;

  const p0 = Number(snapshots?.[0]?.total_value || 0);
  const b0 = Number(benchmarkData?.[0]?.close_price || 0);

  const portfolioSeries = (snapshots || []).map((point) => ({
    date: point.as_of_date,
    normalized: p0 > 0 ? Number(((Number(point.total_value) / p0) * 100).toFixed(2)) : 0,
  }));

  const benchmarkSeries = (benchmarkData || []).map((point) => ({
    date: point.as_of_date,
    normalized: b0 > 0 ? Number(((Number(point.close_price) / b0) * 100).toFixed(2)) : 0,
  }));

  return {
    benchmark,
    benchmarkLabel: BENCHMARKS[benchmark],
    portfolioSeries,
    benchmarkSeries,
  };
}

async function createGoalProjection({
  advisorUserId,
  portfolioId,
  goalId,
  goalType,
  scenarioName,
  benchmark = null,
  initialInvestment,
  monthlyContribution,
  annualReturn,
  annualVolatility,
  years,
  iterations = 1000,
  targetValue = null,
}) {
  const simulation = simulateInvestmentProjection({
    initialInvestment,
    monthlyContribution,
    annualReturn,
    annualVolatility,
    years,
    iterations,
    targetValue,
  });

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('investment_simulations')
    .insert({
      advisor_user_id: advisorUserId,
      portfolio_id: portfolioId,
      goal_id: goalId,
      goal_type: goalType,
      benchmark,
      scenario_name: scenarioName,
      initial_investment: initialInvestment,
      monthly_contribution: monthlyContribution,
      expected_return: annualReturn,
      expected_volatility: annualVolatility,
      years,
      iterations,
      percentile_10_value: simulation.percentile10,
      percentile_50_value: simulation.percentile50,
      percentile_90_value: simulation.percentile90,
      probability_of_success: simulation.probabilityOfSuccess,
      metadata: {
        targetValue,
      },
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    projection: simulation,
    persisted: data,
  };
}

module.exports = {
  calculatePortfolioAnalytics,
  simulateInvestmentProjection,
  getPortfolioDashboard,
  getBenchmarkComparison,
  createGoalProjection,
};
