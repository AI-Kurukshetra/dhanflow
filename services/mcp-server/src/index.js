const {
  getClientProfile,
  updateLeadStage,
  createTask,
  scheduleMeeting,
  logCommunication,
} = require('./crm');
const {
  marketDataFetch,
  portfolioAnalysis,
  riskSimulation,
  clientLookup,
  goalProjection,
} = require('./tools');
const { startMcpServer } = require('./server');

module.exports = {
  getClientProfile,
  updateLeadStage,
  createTask,
  scheduleMeeting,
  logCommunication,
  marketDataFetch,
  portfolioAnalysis,
  riskSimulation,
  clientLookup,
  goalProjection,
  startMcpServer,
};

if (require.main === module) {
  console.log('mcp-server service bootstrap (tool server ready)');
  startMcpServer();
}
