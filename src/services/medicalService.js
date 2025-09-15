import { dbHelpers } from '../lib/supabase.js'
import { mistralClient } from '../lib/mistral.js'

// Main Medical Service - Orchestrates all medical AI functionality
export class MedicalService {
  constructor() {
    this.currentSession = null
  }

  async startSession(userSub, medicalContext = null) {
    try {
      const { data: session, error } = await dbHelpers.createSession(userSub, medicalContext)
      if (error) throw error
      
      this.currentSession = session
      
      // Log session start
      await dbHelpers.logAuditEvent(
        this.hashUserSub(userSub),
        'session_started',
        { session_id: session.id, medical_context: medicalContext }
      )
      
      return session
    } catch (error) {
      console.error('Failed to start session:', error)
      throw error
    }
  }

  async endSession() {
    if (!this.currentSession) return
    
    try {
      await dbHelpers.endSession(this.currentSession.id)
      
      // Log session end
      await dbHelpers.logAuditEvent(
        this.hashUserSub(this.currentSession.user_sub),
        'session_ended',
        { session_id: this.currentSession.id }
      )
      
      this.currentSession = null
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  async processQuery(question, options = {}) {
    if (!this.currentSession) {
      throw new Error('No active session. Please start a session first.')
    }

    const startTime = Date.now()
    
    try {
      // Step 1: Search for relevant drugs
      const relevantDrugs = await this.findRelevantDrugs(question)
      
      // Step 2: Search medical knowledge base
      const medicalKnowledge = await this.findRelevantMedicalContent(question, options.specialty)
      
      // Step 3: Build context for AI
      const context = {
        specialty_focus: this.currentSession.specialty_focus,
        patient_context: this.currentSession.patient_context,
        risk_level: this.currentSession.risk_level,
        medical_context: this.currentSession.medical_context,
        relevant_drugs: relevantDrugs.data || [],
        medical_knowledge: medicalKnowledge.data || []
      }
      
      // Step 4: Generate AI response using Mistral
      const aiResponse = await mistralClient.generateMedicalResponse(question, context)
      aiResponse.latency_ms = Date.now() - startTime
      
      // Step 5: Log the query and response
      const { data: queryLog, error: logError } = await dbHelpers.logQuery(
        this.currentSession.id,
        question,
        aiResponse.answer,
        aiResponse.confidence,
        aiResponse.model
      )
      
      if (logError) {
        console.error('Failed to log query:', logError)
      }
      
      // Step 6: Handle safety alerts
      if (aiResponse.safety_alerts && aiResponse.safety_alerts.length > 0) {
        await this.processSafetyAlerts(aiResponse.safety_alerts, queryLog?.id)
      }
      
      // Step 7: Return comprehensive response
      return {
        ...aiResponse,
        query_id: queryLog?.id,
        session_id: this.currentSession.id,
        relevant_drugs: relevantDrugs.data || [],
        medical_knowledge: medicalKnowledge.data || [],
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Failed to process query:', error)
      
      // Return fallback response
      return {
        answer: "I apologize, but I'm experiencing technical difficulties. Please consult with a healthcare professional for medical advice, and try again later.",
        confidence: 0.1,
        model: 'error-fallback',
        latency_ms: Date.now() - startTime,
        error: error.message,
        safety_alerts: [{
          type: 'system_error',
          severity: 5,
          message: 'System error occurred. Please seek professional medical advice.'
        }]
      }
    }
  }

  async findRelevantDrugs(query) {
    try {
      // Extract potential drug names and medical terms
      const medicalTerms = this.extractMedicalTerms(query)
      
      if (medicalTerms.length === 0) {
        return { data: [], error: null }
      }
      
      // Search for drugs using the most relevant term
      const searchTerm = medicalTerms[0]
      return await dbHelpers.searchDrugs(searchTerm)
      
    } catch (error) {
      console.error('Failed to find relevant drugs:', error)
      return { data: [], error: error.message }
    }
  }

  async findRelevantMedicalContent(query, specialty = null) {
    try {
      return await dbHelpers.searchMedicalContent(query, specialty, 5)
    } catch (error) {
      console.error('Failed to find relevant medical content:', error)
      return { data: [], error: error.message }
    }
  }

  async processSafetyAlerts(alerts, queryId) {
    if (!this.currentSession || !alerts || alerts.length === 0) return
    
    try {
      for (const alert of alerts) {
        await dbHelpers.createSafetyAlert(
          this.currentSession.id,
          queryId,
          alert.type,
          alert.message,
          alert.keyword || '',
          alert.severity
        )
      }
    } catch (error) {
      console.error('Failed to process safety alerts:', error)
    }
  }

  extractMedicalTerms(query) {
    // Simple medical term extraction
    const medicalKeywords = [
      'fever', 'pain', 'infection', 'antibiotic', 'medication', 'dose', 'dosage',
      'treatment', 'symptom', 'diagnosis', 'allergy', 'reaction', 'side effect',
      'pediatric', 'child', 'infant', 'baby', 'toddler', 'adolescent'
    ]
    
    const queryLower = query.toLowerCase()
    const foundTerms = medicalKeywords.filter(term => queryLower.includes(term))
    
    // Also extract potential drug names (capitalized words)
    const words = query.split(/\s+/)
    const potentialDrugNames = words.filter(word => 
      word.length > 3 && 
      /^[A-Z][a-z]+$/.test(word) &&
      !['The', 'This', 'That', 'What', 'When', 'Where', 'How', 'Why'].includes(word)
    )
    
    return [...foundTerms, ...potentialDrugNames]
  }

  hashUserSub(userSub) {
    // Simple hash function for privacy (in production, use crypto.subtle.digest)
    let hash = 0
    for (let i = 0; i < userSub.length; i++) {
      const char = userSub.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  // Utility methods for drug information
  async getDrugsBySystem(system) {
    return await dbHelpers.getDrugsBySystem(system)
  }

  async searchDrugs(query, system = null) {
    return await dbHelpers.searchDrugs(query, system)
  }

  // Get available medical systems
  async getMedicalSystems() {
    try {
      const { data, error } = await dbHelpers.supabase
        .from('pediatric_drugs')
        .select('System')
        .order('System')
      
      if (error) throw error
      
      // Get unique systems
      const uniqueSystems = [...new Set(data.map(item => item.System))]
      return { data: uniqueSystems, error: null }
      
    } catch (error) {
      console.error('Failed to get medical systems:', error)
      return { data: [], error: error.message }
    }
  }
}

// Export singleton instance
export const medicalService = new MedicalService()
