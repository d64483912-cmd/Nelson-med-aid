import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database helper functions
export const dbHelpers = {
  // Pediatric drugs queries
  async searchDrugs(query, system = null) {
    let queryBuilder = supabase
      .from('pediatric_drugs')
      .select('*')
      .or(`Drug.ilike.%${query}%,Indication.ilike.%${query}%,Class.ilike.%${query}%`)
    
    if (system) {
      queryBuilder = queryBuilder.eq('System', system)
    }
    
    return queryBuilder.limit(20)
  },

  async getDrugsBySystem(system) {
    return supabase
      .from('pediatric_drugs')
      .select('*')
      .eq('System', system)
      .order('Drug')
  },

  // Medical embeddings queries
  async searchMedicalContent(query, specialty = null, limit = 10) {
    let queryBuilder = supabase
      .from('medical_embeddings')
      .select('*')
      .or(`keywords.ilike.%${query}%,text_preview.ilike.%${query}%`)
    
    if (specialty) {
      queryBuilder = queryBuilder.eq('medical_specialty', specialty)
    }
    
    return queryBuilder
      .order('confidence_score', { ascending: false })
      .limit(limit)
  },

  // User session management
  async createSession(userSub, medicalContext = null) {
    return supabase
      .from('user_sessions')
      .insert({
        user_sub: userSub,
        started_at: new Date().toISOString(),
        medical_context: medicalContext,
        risk_level: 'low',
        specialty_focus: 'general'
      })
      .select()
      .single()
  },

  async endSession(sessionId) {
    return supabase
      .from('user_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
  },

  // Query logging
  async logQuery(sessionId, question, answer, confidence, model = 'mistral') {
    return supabase
      .from('queries')
      .insert({
        session_id: sessionId,
        user_question: question,
        answer: answer,
        confidence: confidence,
        model: model,
        latency_ms: 0, // Will be calculated by the calling function
        token_count: answer.length / 4, // Rough estimate
        created_at: new Date().toISOString()
      })
  },

  // Safety alerts
  async createSafetyAlert(sessionId, queryId, alertType, message, keywords, severity) {
    return supabase
      .from('safety_alerts')
      .insert({
        session_id: sessionId,
        query_id: queryId,
        alert_type: alertType,
        alert_message: message,
        triggered_keywords: keywords,
        severity_score: severity,
        acknowledged: false,
        created_at: new Date().toISOString()
      })
  },

  // Audit logging
  async logAuditEvent(userSubHash, event, details) {
    return supabase
      .from('audit_logs')
      .insert({
        user_sub_hash: userSubHash,
        event: event,
        details: details,
        created_at: new Date().toISOString()
      })
  }
}
