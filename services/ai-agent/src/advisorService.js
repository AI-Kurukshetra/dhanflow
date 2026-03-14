const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const {
  getPortfolioDashboard,
  simulateInvestmentProjection,
  getBenchmarkComparison,
} = require('./portfolioEngine');

const { getClientProfile } = require('../../mcp-server/src');

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

async function fetchSupabaseData({ clientId, advisorUserId }) {
  const supabase = createServerClient();

  const [{ data: goals, error: goalsError }, { data: benchmarkRows, error: benchmarkError }] =
    await Promise.all([
      supabase
        .from('goals')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false }),
      supabase
        .from('benchmark_prices')
        .select('benchmark,as_of_date,close_price,change_percent')
        .order('as_of_date', { ascending: false })
        .limit(10),
    ]);

  if (goalsError) throw goalsError;
  if (benchmarkError) throw benchmarkError;

  let communicationLogs = [];
  if (clientId) {
    const { data, error } = await supabase
      .from('communication_logs')
      .select('sent_at,channel,direction')
      .eq('client_id', clientId)
      .order('sent_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    communicationLogs = data || [];
  }

  let advisorTasks = [];
  if (advisorUserId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('id,status,due_at,completed_at')
      .eq('advisor_user_id', advisorUserId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    advisorTasks = data || [];
  }

  return {
    goals: goals || [],
    benchmarkRows: benchmarkRows || [],
    communicationLogs,
    advisorTasks,
  };
}

function buildMarketSummary(benchmarkRows) {
  const latestByBenchmark = new Map();

  for (const row of benchmarkRows || []) {
    if (!latestByBenchmark.has(row.benchmark)) {
      latestByBenchmark.set(row.benchmark, row);
    }
  }

  return ['nifty_50', 'sensex']
    .map((benchmark) => {
      const item = latestByBenchmark.get(benchmark);
      if (!item) return `${benchmark.toUpperCase()}: data unavailable`;
      const pct = item.change_percent === null || item.change_percent === undefined
        ? 'n/a'
        : `${Number(item.change_percent).toFixed(2)}%`;
      return `${benchmark === 'nifty_50' ? 'Nifty 50' : 'Sensex'} ${Number(item.close_price).toFixed(2)} (${pct})`;
    })
    .join(' | ');
}

function buildRiskInsights(analytics) {
  const insights = [];

  if (analytics.volatility >= 0.3) {
    insights.push('Portfolio volatility is elevated for a typical wealth profile.');
  } else if (analytics.volatility > 0) {
    insights.push('Portfolio volatility is within moderate bounds.');
  }

  if (analytics.sharpeRatio < 0.5) {
    insights.push('Risk-adjusted returns are weak; allocation quality can be improved.');
  } else {
    insights.push('Risk-adjusted returns are healthy based on current Sharpe ratio.');
  }

  insights.push(`Computed risk score: ${analytics.riskScore}/100.`);

  return insights;
}

function buildRecommendations(allocation) {
  if (!allocation || !allocation.length) {
    return ['No allocation data yet. Start with diversified equity, debt, and cash positions.'];
  }

  const sorted = [...allocation].sort((a, b) => b.weightPercent - a.weightPercent);
  const top = sorted[0];

  const recs = [];
  if (top && top.weightPercent > 45) {
    recs.push(`Top holding concentration is ${top.weightPercent}%. Rebalance to reduce single-asset risk.`);
  }

  const smallPositions = sorted.filter((item) => item.weightPercent > 0 && item.weightPercent < 5).length;
  if (smallPositions >= 6) {
    recs.push('Portfolio has many small positions. Consolidate for clearer conviction and lower friction.');
  }

  if (!recs.length) {
    recs.push('Allocation looks balanced. Maintain cadence with periodic drift-based rebalancing.');
  }

  return recs;
}

function buildChurnPrediction({ clientProfile, communicationLogs, advisorTasks }) {
  const now = Date.now();
  const lastContactISO = communicationLogs?.[0]?.sent_at || clientProfile?.last_contacted_at || null;
  const daysSinceLastContact = lastContactISO
    ? Math.floor((now - new Date(lastContactISO).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const overdueTasks = (advisorTasks || []).filter((task) => {
    if (!task.due_at || task.completed_at) return false;
    return new Date(task.due_at).getTime() < now;
  }).length;

  let score = 15;
  if (daysSinceLastContact > 45) score += 45;
  else if (daysSinceLastContact > 21) score += 25;
  else if (daysSinceLastContact > 10) score += 10;

  score += Math.min(30, overdueTasks * 3);

  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  return {
    churnRiskLevel: level,
    churnRiskScore: Math.min(100, score),
    reasons: [
      `Days since last contact: ${daysSinceLastContact}`,
      `Open overdue advisor tasks: ${overdueTasks}`,
    ],
  };
}

function buildGoalForecasts(goals) {
  return (goals || []).slice(0, 3).map((goal) => {
    const projection = simulateInvestmentProjection({
      initialInvestment: Number(goal.current_amount || 0),
      monthlyContribution: 25000,
      annualReturn: 0.11,
      annualVolatility: 0.18,
      years: 10,
      iterations: 800,
      targetValue: Number(goal.target_amount || 0),
    });

    return {
      goalId: goal.id,
      title: goal.title,
      goalType: goal.goal_type,
      targetAmount: Number(goal.target_amount || 0),
      ...projection,
    };
  });
}

async function generateAIResponse({ query, context }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      mode: 'rules',
      message: [
        `Query: ${query}`,
        'AI key not configured. Returning deterministic advisor output.',
      ].join(' '),
      recommendations: context.recommendations,
      riskInsights: context.riskInsights,
      marketSummary: context.marketSummary,
      goalForecasts: context.goalForecasts,
      churnPrediction: context.churnPrediction,
    };
  }

  const client = new OpenAI({ apiKey });

  const prompt = {
    query,
    portfolioAnalytics: context.dashboard.analytics,
    allocationTop5: context.dashboard.allocation.slice(0, 5),
    marketSummary: context.marketSummary,
    riskInsights: context.riskInsights,
    recommendations: context.recommendations,
    goalForecasts: context.goalForecasts,
    churnPrediction: context.churnPrediction,
  };

  const result = await client.responses.create({
    model: process.env.AI_ADVISOR_MODEL || 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content:
          'You are an AI financial advisor for wealth managers. Provide concise, compliant, non-guaranteed recommendations with clear rationale and risk caveats.',
      },
      {
        role: 'user',
        content: `Generate a client-facing advisory response from this JSON context: ${JSON.stringify(prompt)}`,
      },
    ],
  });

  return {
    mode: 'openai',
    message: result.output_text || 'No response generated.',
    recommendations: context.recommendations,
    riskInsights: context.riskInsights,
    marketSummary: context.marketSummary,
    goalForecasts: context.goalForecasts,
    churnPrediction: context.churnPrediction,
  };
}

async function runAiAdvisorWorkflow({ query, clientId, portfolioId, advisorUserId, benchmark = 'nifty_50' }) {
  if (!query) throw new Error('query is required');
  if (!portfolioId) throw new Error('portfolioId is required');

  const [clientProfile, dashboard, benchmarkComparison, supabaseData] = await Promise.all([
    clientId ? getClientProfile(clientId) : Promise.resolve(null),
    getPortfolioDashboard(portfolioId),
    getBenchmarkComparison(portfolioId, benchmark),
    fetchSupabaseData({ clientId, advisorUserId }),
  ]);

  const recommendations = buildRecommendations(dashboard.allocation);
  const riskInsights = buildRiskInsights(dashboard.analytics);
  const marketSummary = buildMarketSummary(supabaseData.benchmarkRows);
  const goalForecasts = buildGoalForecasts(supabaseData.goals);
  const churnPrediction = buildChurnPrediction({
    clientProfile,
    communicationLogs: supabaseData.communicationLogs,
    advisorTasks: supabaseData.advisorTasks,
  });

  const response = await generateAIResponse({
    query,
    context: {
      clientProfile,
      dashboard,
      benchmarkComparison,
      recommendations,
      riskInsights,
      marketSummary,
      goalForecasts,
      churnPrediction,
    },
  });

  return {
    workflow: [
      'User query',
      'Call MCP tools',
      'Fetch Supabase data',
      'Generate AI response',
    ],
    response,
    data: {
      clientProfile,
      portfolioDashboard: dashboard,
      benchmarkComparison,
    },
  };
}

module.exports = {
  runAiAdvisorWorkflow,
};
