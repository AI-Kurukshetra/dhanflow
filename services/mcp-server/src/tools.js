const { createServerClient } = require('./supabaseClient');

function ok(tool, data, meta = {}) {
  return {
    ok: true,
    tool,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

function fail(tool, error, details = null) {
  return {
    ok: false,
    tool,
    error: {
      message: error instanceof Error ? error.message : String(error),
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

function stdDev(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function percentile(sortedNumbers, p) {
  if (!sortedNumbers.length) return 0;
  const index = Math.max(0, Math.min(sortedNumbers.length - 1, Math.floor(p * sortedNumbers.length)));
  return sortedNumbers[index];
}

function randomNormal() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

async function marketDataFetch(input = {}) {
  const tool = 'market_data_fetch';
  try {
    const supabase = createServerClient();
    const {
      benchmark = null,
      fromDate = null,
      toDate = null,
      limit = 100,
      assetId = null,
    } = input;

    if (!benchmark && !assetId) {
      throw new Error('Provide either benchmark or assetId');
    }

    if (benchmark) {
      let query = supabase
        .from('benchmark_prices')
        .select('benchmark,as_of_date,close_price,change_percent,source')
        .order('as_of_date', { ascending: false })
        .limit(Math.min(500, Math.max(1, Number(limit) || 100)))
        .eq('benchmark', benchmark);

      if (fromDate) query = query.gte('as_of_date', fromDate);
      if (toDate) query = query.lte('as_of_date', toDate);

      const { data, error } = await query;
      if (error) throw error;

      return ok(tool, {
        type: 'benchmark',
        rows: data || [],
      });
    }

    let query = supabase
      .from('market_data')
      .select('asset_id,as_of,open_price,high_price,low_price,close_price,volume,source')
      .order('as_of', { ascending: false })
      .limit(Math.min(500, Math.max(1, Number(limit) || 100)))
      .eq('asset_id', assetId);

    if (fromDate) query = query.gte('as_of', fromDate);
    if (toDate) query = query.lte('as_of', toDate);

    const { data, error } = await query;
    if (error) throw error;

    return ok(tool, {
      type: 'asset',
      rows: data || [],
    });
  } catch (error) {
    return fail(tool, error);
  }
}

async function portfolioAnalysis(input = {}) {
  const tool = 'portfolio_analysis';
  try {
    const { portfolioId } = input;
    if (!portfolioId) throw new Error('portfolioId is required');

    const supabase = createServerClient();

    const txQuery = supabase
      .from('transactions')
      .select('asset_id,transaction_type,quantity,net_amount,executed_at')
      .eq('portfolio_id', portfolioId)
      .order('executed_at', { ascending: false })
      .limit(5000);

    const snapshotQuery = supabase
      .from('portfolio_snapshots')
      .select('as_of_date,total_value')
      .eq('portfolio_id', portfolioId)
      .order('as_of_date', { ascending: true });

    const [{ data: transactions, error: txError }, { data: snapshots, error: snapshotError }] =
      await Promise.all([txQuery, snapshotQuery]);

    if (txError) throw txError;
    if (snapshotError) throw snapshotError;

    const holdings = new Map();
    for (const tx of transactions || []) {
      if (!tx.asset_id) continue;
      const prev = holdings.get(tx.asset_id) || { quantity: 0, investedValue: 0 };
      const qty = Number(tx.quantity || 0);
      const net = Number(tx.net_amount || 0);

      if (tx.transaction_type === 'sell') {
        prev.quantity -= qty;
        prev.investedValue -= net;
      } else {
        prev.quantity += qty;
        prev.investedValue += net;
      }

      holdings.set(tx.asset_id, prev);
    }

    const totalInvested = [...holdings.values()].reduce(
      (sum, item) => sum + Math.max(0, item.investedValue),
      0,
    );

    const allocation = [...holdings.entries()].map(([assetId, values]) => ({
      assetId,
      quantity: Number(values.quantity.toFixed(4)),
      investedValue: Number(values.investedValue.toFixed(2)),
      weightPercent:
        totalInvested > 0
          ? Number(((Math.max(0, values.investedValue) / totalInvested) * 100).toFixed(2))
          : 0,
    }));

    const returns = [];
    const ordered = snapshots || [];
    for (let i = 1; i < ordered.length; i += 1) {
      const prev = Number(ordered[i - 1].total_value || 0);
      const curr = Number(ordered[i].total_value || 0);
      if (prev > 0) returns.push((curr - prev) / prev);
    }

    const dailyVol = stdDev(returns);
    const annualVol = dailyVol * Math.sqrt(252);
    const first = Number(ordered[0]?.total_value || 0);
    const last = Number(ordered[ordered.length - 1]?.total_value || 0);

    return ok(tool, {
      portfolioId,
      allocation,
      transactionHistory: transactions || [],
      analytics: {
        growthPercent: first > 0 ? Number((((last - first) / first) * 100).toFixed(2)) : 0,
        volatility: Number(annualVol.toFixed(6)),
      },
      snapshots: ordered,
    });
  } catch (error) {
    return fail(tool, error);
  }
}

async function riskSimulation(input = {}) {
  const tool = 'risk_simulation';
  try {
    const {
      portfolioId,
      years = 5,
      iterations = 1000,
      confidence = 0.95,
      expectedAnnualReturn = 0.11,
    } = input;

    if (!portfolioId) throw new Error('portfolioId is required');

    const supabase = createServerClient();
    const { data: snapshots, error: snapshotError } = await supabase
      .from('portfolio_snapshots')
      .select('as_of_date,total_value')
      .eq('portfolio_id', portfolioId)
      .order('as_of_date', { ascending: true });

    if (snapshotError) throw snapshotError;

    const values = (snapshots || []).map((s) => Number(s.total_value || 0)).filter((v) => v > 0);
    const startValue = values.length ? values[values.length - 1] : 0;
    if (startValue <= 0) {
      throw new Error('Not enough portfolio snapshot value data for risk simulation');
    }

    const returns = [];
    for (let i = 1; i < values.length; i += 1) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }

    const annualVol = stdDev(returns) * Math.sqrt(252);
    const monthlyMean = expectedAnnualReturn / 12;
    const monthlyVol = annualVol / Math.sqrt(12);
    const months = Number(years) * 12;

    const sims = [];
    const count = Math.min(20000, Math.max(100, Number(iterations) || 1000));
    for (let i = 0; i < count; i += 1) {
      let value = startValue;
      for (let m = 0; m < months; m += 1) {
        const shock = randomNormal() * monthlyVol;
        value = value * (1 + monthlyMean + shock);
        if (value < 0) value = 0;
      }
      sims.push(value);
    }

    sims.sort((a, b) => a - b);

    const varPercentile = Math.max(0.01, 1 - Number(confidence));
    const worstExpected = percentile(sims, varPercentile);

    return ok(tool, {
      portfolioId,
      simulation: {
        years: Number(years),
        iterations: count,
        annualizedVolatility: Number(annualVol.toFixed(6)),
        percentile10: Number(percentile(sims, 0.1).toFixed(2)),
        percentile50: Number(percentile(sims, 0.5).toFixed(2)),
        percentile90: Number(percentile(sims, 0.9).toFixed(2)),
        valueAtRisk: {
          confidence: Number(confidence),
          portfolioValueFloor: Number(worstExpected.toFixed(2)),
        },
      },
    });
  } catch (error) {
    return fail(tool, error);
  }
}

async function clientLookup(input = {}) {
  const tool = 'client_lookup';
  try {
    const { clientId = null, email = null, query = null, advisorUserId = null } = input;

    if (!clientId && !email && !query) {
      throw new Error('Provide one of clientId, email, or query');
    }

    const supabase = createServerClient();
    let db = supabase
      .from('clients')
      .select('id,advisor_user_id,first_name,last_name,email,phone,status,risk_tolerance,advisor_notes,last_contacted_at,created_at')
      .order('created_at', { ascending: false })
      .limit(25);

    if (clientId) db = db.eq('id', clientId);
    if (advisorUserId) db = db.eq('advisor_user_id', advisorUserId);
    if (email) db = db.ilike('email', email);
    if (query) {
      const q = `%${query}%`;
      db = db.or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q}`);
    }

    const { data, error } = await db;
    if (error) throw error;

    return ok(tool, {
      count: (data || []).length,
      clients: data || [],
    });
  } catch (error) {
    return fail(tool, error);
  }
}

async function goalProjection(input = {}) {
  const tool = 'goal_projection';
  try {
    const {
      goalId = null,
      clientId = null,
      goalType = null,
      years = 10,
      expectedAnnualReturn = 0.11,
      expectedAnnualVolatility = 0.18,
      monthlyContribution = 25000,
      iterations = 1000,
    } = input;

    const supabase = createServerClient();
    let query = supabase
      .from('goals')
      .select('id,client_id,title,goal_type,target_amount,current_amount,target_date,status')
      .order('created_at', { ascending: false })
      .limit(10);

    if (goalId) query = query.eq('id', goalId);
    if (clientId) query = query.eq('client_id', clientId);
    if (goalType) query = query.eq('goal_type', goalType);

    const { data: goals, error } = await query;
    if (error) throw error;

    const results = [];
    const count = Math.min(10000, Math.max(200, Number(iterations) || 1000));
    for (const goal of goals || []) {
      const months = Number(years) * 12;
      const monthlyMean = Number(expectedAnnualReturn) / 12;
      const monthlyVol = Number(expectedAnnualVolatility) / Math.sqrt(12);

      const outcomes = [];
      for (let i = 0; i < count; i += 1) {
        let value = Number(goal.current_amount || 0);
        for (let m = 0; m < months; m += 1) {
          const shock = randomNormal() * monthlyVol;
          value = (value + Number(monthlyContribution)) * (1 + monthlyMean + shock);
          if (value < 0) value = 0;
        }
        outcomes.push(value);
      }

      outcomes.sort((a, b) => a - b);
      const target = Number(goal.target_amount || 0);
      const successRate = target > 0
        ? outcomes.filter((v) => v >= target).length / outcomes.length
        : 0;

      results.push({
        goal,
        projection: {
          years: Number(years),
          iterations: count,
          percentile10: Number(percentile(outcomes, 0.1).toFixed(2)),
          percentile50: Number(percentile(outcomes, 0.5).toFixed(2)),
          percentile90: Number(percentile(outcomes, 0.9).toFixed(2)),
          successProbability: Number(successRate.toFixed(4)),
        },
      });
    }

    return ok(tool, {
      count: results.length,
      results,
    });
  } catch (error) {
    return fail(tool, error);
  }
}

const toolHandlers = {
  market_data_fetch: marketDataFetch,
  portfolio_analysis: portfolioAnalysis,
  risk_simulation: riskSimulation,
  client_lookup: clientLookup,
  goal_projection: goalProjection,
};

module.exports = {
  toolHandlers,
  marketDataFetch,
  portfolioAnalysis,
  riskSimulation,
  clientLookup,
  goalProjection,
};
