// Mistral AI Integration for Medical Responses
class MistralClient {
  constructor() {
    this.apiKey = import.meta.env.VITE_MISTRAL_API_KEY
    this.baseUrl = 'https://api.mistral.ai/v1'
    
    if (!this.apiKey) {
      console.warn('Mistral API key not found. AI responses will be simulated.')
    }
  }

  async generateMedicalResponse(query, context = {}) {
    const startTime = Date.now()
    
    try {
      if (!this.apiKey) {
        return this.simulateResponse(query, context)
      }

      const systemPrompt = this.buildSystemPrompt(context)
      const userPrompt = this.buildUserPrompt(query, context)

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1000,
          top_p: 0.9
        })
      })

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`)
      }

      const data = await response.json()
      const latency = Date.now() - startTime

      return {
        answer: data.choices[0].message.content,
        confidence: this.calculateConfidence(data.choices[0].message.content),
        model: 'mistral-large-latest',
        latency_ms: latency,
        token_count: data.usage?.total_tokens || 0,
        citations: this.extractCitations(context),
        safety_alerts: this.checkSafetyAlerts(query, data.choices[0].message.content)
      }
    } catch (error) {
      console.error('Mistral API error:', error)
      return this.simulateResponse(query, context)
    }
  }

  buildSystemPrompt(context) {
    return `You are Nelson Med Aid, an AI medical assistant specializing in pediatric medicine. 

CRITICAL SAFETY GUIDELINES:
- Always emphasize that you provide educational information only
- Recommend consulting healthcare professionals for medical decisions
- Never provide specific dosing without professional supervision
- Flag potentially dangerous queries immediately

CONTEXT:
- Specialty Focus: ${context.specialty_focus || 'General Pediatrics'}
- Patient Context: ${context.patient_context || 'Not specified'}
- Risk Level: ${context.risk_level || 'Standard'}

RESPONSE FORMAT:
- Provide clear, evidence-based information
- Include relevant safety warnings
- Cite medical sources when available
- Use appropriate medical terminology with explanations

Remember: You are an educational tool, not a replacement for professional medical advice.`
  }

  buildUserPrompt(query, context) {
    let prompt = `Medical Query: ${query}\n\n`
    
    if (context.medical_context) {
      prompt += `Medical Context: ${context.medical_context}\n\n`
    }
    
    if (context.relevant_drugs && context.relevant_drugs.length > 0) {
      prompt += `Relevant Medications Found:\n`
      context.relevant_drugs.forEach(drug => {
        prompt += `- ${drug.Drug} (${drug.Class}): ${drug.Indication}\n`
        prompt += `  Pediatric Dose: ${drug.Pediatric_Dose}\n`
        prompt += `  Contraindications: ${drug.Contraindications}\n\n`
      })
    }
    
    if (context.medical_knowledge && context.medical_knowledge.length > 0) {
      prompt += `Relevant Medical Knowledge:\n`
      context.medical_knowledge.forEach(knowledge => {
        prompt += `- ${knowledge.text_preview}\n`
      })
      prompt += `\n`
    }
    
    prompt += `Please provide a comprehensive, safe, and educational response.`
    
    return prompt
  }

  calculateConfidence(response) {
    // Simple confidence calculation based on response characteristics
    let confidence = 0.7 // Base confidence
    
    // Increase confidence for structured responses
    if (response.includes('•') || response.includes('-') || response.includes('1.')) {
      confidence += 0.1
    }
    
    // Increase confidence for safety disclaimers
    if (response.toLowerCase().includes('consult') || response.toLowerCase().includes('healthcare professional')) {
      confidence += 0.1
    }
    
    // Decrease confidence for uncertain language
    if (response.toLowerCase().includes('might') || response.toLowerCase().includes('possibly')) {
      confidence -= 0.1
    }
    
    return Math.min(Math.max(confidence, 0.1), 0.95)
  }

  extractCitations(context) {
    const citations = []
    
    if (context.relevant_drugs) {
      citations.push({
        type: 'drug_database',
        source: 'Pediatric Drug Database',
        count: context.relevant_drugs.length
      })
    }
    
    if (context.medical_knowledge) {
      citations.push({
        type: 'medical_literature',
        source: 'Medical Knowledge Base',
        count: context.medical_knowledge.length
      })
    }
    
    return citations
  }

  checkSafetyAlerts(query, response) {
    const alerts = []
    const dangerousKeywords = [
      'overdose', 'toxic', 'emergency', 'urgent', 'severe', 'critical',
      'allergic reaction', 'anaphylaxis', 'poisoning', 'suicide'
    ]
    
    const queryLower = query.toLowerCase()
    const responseLower = response.toLowerCase()
    
    dangerousKeywords.forEach(keyword => {
      if (queryLower.includes(keyword) || responseLower.includes(keyword)) {
        alerts.push({
          type: 'safety_concern',
          keyword: keyword,
          severity: keyword.includes('emergency') || keyword.includes('critical') ? 9 : 7,
          message: `Potential safety concern detected: ${keyword}. Immediate medical attention may be required.`
        })
      }
    })
    
    return alerts
  }

  simulateResponse(query, context) {
    // Fallback response when Mistral API is not available
    const simulatedResponses = {
      fever: "For pediatric fever management, acetaminophen or ibuprofen can be considered based on age and weight. Always consult with a healthcare professional for proper dosing and to rule out serious conditions. Monitor for signs of dehydration and seek immediate care if fever persists or worsens.",
      
      medication: "When considering pediatric medications, several factors are crucial: patient age, weight, medical history, and potential drug interactions. Always verify dosing with current pediatric guidelines and consult with a healthcare professional before administration.",
      
      default: "I understand you're seeking medical information. While I can provide educational content, it's essential to consult with a qualified healthcare professional for personalized medical advice, especially for pediatric patients. Please describe your specific question for more targeted educational information."
    }
    
    let response = simulatedResponses.default
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('fever') || queryLower.includes('temperature')) {
      response = simulatedResponses.fever
    } else if (queryLower.includes('medication') || queryLower.includes('drug') || queryLower.includes('dose')) {
      response = simulatedResponses.medication
    }
    
    return {
      answer: response,
      confidence: 0.6,
      model: 'simulated-response',
      latency_ms: 100,
      token_count: response.length / 4,
      citations: this.extractCitations(context),
      safety_alerts: this.checkSafetyAlerts(query, response)
    }
  }
}

export const mistralClient = new MistralClient()
