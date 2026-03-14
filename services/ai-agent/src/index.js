const {
  calculatePortfolioAnalytics,
  simulateInvestmentProjection,
  getPortfolioDashboard,
  getBenchmarkComparison,
  createGoalProjection,
} = require('./portfolioEngine');
const { runAiAdvisorWorkflow } = require('./advisorService');
const { startAiAdvisorServer } = require('./apiServer');

module.exports = {
  calculatePortfolioAnalytics,
  simulateInvestmentProjection,
  getPortfolioDashboard,
  getBenchmarkComparison,
  createGoalProjection,
  runAiAdvisorWorkflow,
  startAiAdvisorServer,
};

if (require.main === module) {
  console.log('ai-agent service bootstrap (AI advisor ready)');
  startAiAdvisorServer();
}
