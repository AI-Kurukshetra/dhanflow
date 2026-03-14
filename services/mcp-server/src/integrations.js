const { createServerClient } = require('./supabaseClient');

async function fetchMarketDataByProvider({ provider, symbol, limit = 100 }) {
  if (!provider) throw new Error('provider is required');

  const supabase = createServerClient();
  let query = supabase
    .from('market_price_snapshots')
    .select('*')
    .eq('provider', provider)
    .order('as_of', { ascending: false })
    .limit(Math.min(500, Math.max(1, Number(limit) || 100)));

  if (symbol) query = query.eq('symbol', symbol);

  const { data, error } = await query;
  if (error) throw error;

  return {
    provider,
    count: (data || []).length,
    rows: data || [],
  };
}

async function createSebiAuditLog(payload) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('sebi_audit_logs').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

async function createAdvisorComplianceAlert(payload) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('advisor_compliance_alerts')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function createRegulatoryReportingRun(payload) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('regulatory_reporting_runs')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function createDocumentVersion(payload) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('document_versions').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

async function shareClientDocument(payload) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('document_shares').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

module.exports = {
  fetchMarketDataByProvider,
  createSebiAuditLog,
  createAdvisorComplianceAlert,
  createRegulatoryReportingRun,
  createDocumentVersion,
  shareClientDocument,
};
