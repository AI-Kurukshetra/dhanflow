const {
  calculatePortfolioAnalytics,
  simulateInvestmentProjection,
  getPortfolioDashboard,
  getBenchmarkComparison,
  createGoalProjection,
} = require('./portfolioEngine');

console.log('ai-agent service bootstrap (portfolio engine ready)');

module.exports = {
  calculatePortfolioAnalytics,
  simulateInvestmentProjection,
  getPortfolioDashboard,
  getBenchmarkComparison,
  createGoalProjection,
};
