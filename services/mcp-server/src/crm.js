const { createClient } = require('@supabase/supabase-js');

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

async function getClientProfile(clientId) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('clients')
    .select(
      `
      *,
      risk_profiles(*),
      goals(*),
      client_relationships(*),
      activity_timeline(*),
      communication_logs(*)
    `,
    )
    .eq('id', clientId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function updateLeadStage(leadId, stage) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('leads')
    .update({ pipeline_stage: stage })
    .eq('id', leadId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function createTask(taskInput) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('tasks').insert(taskInput).select('*').single();

  if (error) throw error;
  return data;
}

async function scheduleMeeting(meetingInput) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('meetings').insert(meetingInput).select('*').single();

  if (error) throw error;
  return data;
}

async function logCommunication(logInput) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('communication_logs')
    .insert(logInput)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getClientProfile,
  updateLeadStage,
  createTask,
  scheduleMeeting,
  logCommunication,
};
