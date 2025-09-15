import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

// Sample data for testing
const sampleSessions = [
  {
    user_sub: 'user_123',
    started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    ended_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    medical_context: 'Pediatric fever management consultation',
    risk_level: 'low',
    specialty_focus: 'pediatrics',
    patient_context: '5-year-old with fever'
  },
  {
    user_sub: 'user_456',
    started_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    ended_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    medical_context: 'Medication dosing inquiry',
    risk_level: 'medium',
    specialty_focus: 'pediatrics',
    patient_context: '8-year-old requiring antibiotic treatment'
  }
]

const sampleQueries = [
  {
    session_id: 1, // Will be updated after sessions are inserted
    user_question: 'What is the appropriate acetaminophen dose for a 5-year-old with fever?',
    answer: 'For a 5-year-old child, acetaminophen dosing is typically 10-15 mg/kg every 4-6 hours, with a maximum of 5 doses in 24 hours. However, always consult with a healthcare professional for proper dosing based on the child\'s exact weight and medical history. Never exceed the maximum daily dose, and ensure proper measurement using appropriate dosing devices.',
    confidence: 0.85,
    model: 'mistral-large-latest',
    latency_ms: 1250,
    token_count: 156,
    citations: JSON.stringify([
      { type: 'drug_database', source: 'Pediatric Drug Database', count: 1 }
    ]),
    diagnostic_stage: 'information_gathering',
    reasoning_steps: JSON.stringify([
      'Identified medication inquiry',
      'Retrieved pediatric dosing guidelines',
      'Applied safety considerations',
      'Provided educational response with disclaimer'
    ])
  },
  {
    session_id: 2,
    user_question: 'Are there any contraindications for amoxicillin in children?',
    answer: 'Amoxicillin contraindications in children include: known allergy to penicillins or beta-lactam antibiotics, history of severe allergic reactions, and infectious mononucleosis (due to increased risk of rash). Always screen for allergies before administration and consult healthcare professionals for proper evaluation and alternative treatments if contraindications exist.',
    confidence: 0.92,
    model: 'mistral-large-latest',
    latency_ms: 980,
    token_count: 134,
    citations: JSON.stringify([
      { type: 'drug_database', source: 'Pediatric Drug Database', count: 1 },
      { type: 'medical_literature', source: 'Medical Knowledge Base', count: 2 }
    ]),
    diagnostic_stage: 'safety_assessment',
    reasoning_steps: JSON.stringify([
      'Identified antibiotic safety inquiry',
      'Retrieved contraindication data',
      'Cross-referenced with pediatric guidelines',
      'Emphasized allergy screening importance'
    ])
  }
]

const sampleSafetyAlerts = [
  {
    session_id: 1,
    query_id: 1,
    alert_type: 'dosing_concern',
    alert_message: 'Medication dosing inquiry detected. Ensure proper weight-based calculations and professional supervision.',
    triggered_keywords: 'dose, acetaminophen, 5-year-old',
    severity_score: 6,
    acknowledged: false
  }
]

const sampleMedicalContextSummary = [
  {
    session_id: 1,
    summary_text: 'Pediatric fever management consultation for 5-year-old patient. Focus on safe medication dosing and monitoring.',
    key_symptoms: JSON.stringify(['fever', 'elevated temperature']),
    previous_diagnoses: JSON.stringify([]),
    medications_mentioned: JSON.stringify(['acetaminophen']),
    allergies_mentioned: JSON.stringify([]),
    summary_confidence: 0.88
  },
  {
    session_id: 2,
    summary_text: 'Antibiotic safety consultation for 8-year-old requiring treatment. Emphasis on allergy screening and contraindications.',
    key_symptoms: JSON.stringify(['infection']),
    previous_diagnoses: JSON.stringify([]),
    medications_mentioned: JSON.stringify(['amoxicillin']),
    allergies_mentioned: JSON.stringify(['penicillin allergy screening']),
    summary_confidence: 0.91
  }
]

const sampleAuditLogs = [
  {
    user_sub_hash: 'abc123',
    event: 'session_started',
    details: JSON.stringify({ session_id: 1, medical_context: 'Pediatric fever management consultation' })
  },
  {
    user_sub_hash: 'abc123',
    event: 'query_processed',
    details: JSON.stringify({ session_id: 1, query_id: 1, confidence: 0.85 })
  },
  {
    user_sub_hash: 'def456',
    event: 'session_started',
    details: JSON.stringify({ session_id: 2, medical_context: 'Medication dosing inquiry' })
  }
]

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // 1. Insert sample sessions
    console.log('📝 Inserting sample user sessions...')
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .insert(sampleSessions)
      .select()
    
    if (sessionsError) {
      console.error('Error inserting sessions:', sessionsError)
      return
    }
    
    console.log(`✅ Inserted ${sessions.length} user sessions`)
    
    // 2. Update query session IDs and insert
    console.log('💬 Inserting sample queries...')
    const updatedQueries = sampleQueries.map((query, index) => ({
      ...query,
      session_id: sessions[index]?.id || query.session_id
    }))
    
    const { data: queries, error: queriesError } = await supabase
      .from('queries')
      .insert(updatedQueries)
      .select()
    
    if (queriesError) {
      console.error('Error inserting queries:', queriesError)
      return
    }
    
    console.log(`✅ Inserted ${queries.length} queries`)
    
    // 3. Insert safety alerts
    console.log('🚨 Inserting safety alerts...')
    const updatedAlerts = sampleSafetyAlerts.map(alert => ({
      ...alert,
      session_id: sessions[0]?.id || alert.session_id,
      query_id: queries[0]?.id || alert.query_id
    }))
    
    const { data: alerts, error: alertsError } = await supabase
      .from('safety_alerts')
      .insert(updatedAlerts)
      .select()
    
    if (alertsError) {
      console.error('Error inserting safety alerts:', alertsError)
      return
    }
    
    console.log(`✅ Inserted ${alerts.length} safety alerts`)
    
    // 4. Insert medical context summaries
    console.log('📋 Inserting medical context summaries...')
    const updatedSummaries = sampleMedicalContextSummary.map((summary, index) => ({
      ...summary,
      session_id: sessions[index]?.id || summary.session_id
    }))
    
    const { data: summaries, error: summariesError } = await supabase
      .from('medical_context_summary')
      .insert(updatedSummaries)
      .select()
    
    if (summariesError) {
      console.error('Error inserting summaries:', summariesError)
      return
    }
    
    console.log(`✅ Inserted ${summaries.length} medical context summaries`)
    
    // 5. Insert audit logs
    console.log('📊 Inserting audit logs...')
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .insert(sampleAuditLogs)
      .select()
    
    if (auditError) {
      console.error('Error inserting audit logs:', auditError)
      return
    }
    
    console.log(`✅ Inserted ${auditLogs.length} audit logs`)
    
    // 6. Verify data
    console.log('🔍 Verifying seeded data...')
    
    const { count: sessionCount } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
    
    const { count: queryCount } = await supabase
      .from('queries')
      .select('*', { count: 'exact', head: true })
    
    const { count: drugCount } = await supabase
      .from('pediatric_drugs')
      .select('*', { count: 'exact', head: true })
    
    const { count: embeddingCount } = await supabase
      .from('medical_embeddings')
      .select('*', { count: 'exact', head: true })
    
    console.log('\n📊 Database Summary:')
    console.log(`   👥 User Sessions: ${sessionCount}`)
    console.log(`   💬 Queries: ${queryCount}`)
    console.log(`   💊 Pediatric Drugs: ${drugCount}`)
    console.log(`   🧠 Medical Embeddings: ${embeddingCount}`)
    console.log(`   🚨 Safety Alerts: ${alerts.length}`)
    console.log(`   📋 Context Summaries: ${summaries.length}`)
    console.log(`   📊 Audit Logs: ${auditLogs.length}`)
    
    console.log('\n🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
}

export { seedDatabase }
