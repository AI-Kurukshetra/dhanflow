const {
  getClientProfile,
  updateLeadStage,
  createTask,
  scheduleMeeting,
  logCommunication,
} = require('./crm');

console.log('mcp-server service bootstrap (CRM ready)');

module.exports = {
  getClientProfile,
  updateLeadStage,
  createTask,
  scheduleMeeting,
  logCommunication,
};
