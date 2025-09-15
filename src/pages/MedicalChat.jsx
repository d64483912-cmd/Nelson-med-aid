import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  Brain,
  Pill
} from 'lucide-react'
import { medicalService } from '../services/medicalService'
import LoadingSpinner from '../components/LoadingSpinner'

const MedicalChat = ({ currentSession }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm Nelson Med Aid, your AI medical assistant. I can help you with pediatric medical questions, drug information, and safety guidance. How can I assist you today?",
      timestamp: new Date(),
      confidence: 1.0
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentSession) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await medicalService.processQuery(inputMessage.trim())
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
        confidence: response.confidence,
        model: response.model,
        latency: response.latency_ms,
        safetyAlerts: response.safety_alerts || [],
        relevantDrugs: response.relevant_drugs || [],
        citations: response.citations || []
      }

      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      console.error('Failed to process message:', err)
      setError('Failed to process your message. Please try again.')
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I apologize, but I'm experiencing technical difficulties. Please consult with a healthcare professional for medical advice, and try again later.",
        timestamp: new Date(),
        confidence: 0.1,
        error: true
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Session</h3>
          <p className="text-gray-600">Please start a session to begin medical consultation.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-medical-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Medical Chat</h1>
              <p className="text-sm text-gray-600">
                AI-powered medical assistance • Session: {currentSession.id?.toString().slice(-6)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Header */}
                <div className={`flex items-center space-x-2 mb-2 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-medical-600' 
                      : message.error 
                        ? 'bg-red-600' 
                        : 'bg-gray-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {message.type === 'user' ? 'You' : 'Nelson Med Aid'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>

                {/* Message Content */}
                <div className={`rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-medical-600 text-white'
                    : message.error
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50 border border-gray-200'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Bot Message Metadata */}
                  {message.type === 'bot' && !message.error && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      {/* Confidence Score */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">Confidence:</span>
                          <span className={`font-medium ${getConfidenceColor(message.confidence)}`}>
                            {getConfidenceText(message.confidence)} ({Math.round(message.confidence * 100)}%)
                          </span>
                        </div>
                        {message.latency && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-500">{message.latency}ms</span>
                          </div>
                        )}
                      </div>

                      {/* Safety Alerts */}
                      {message.safetyAlerts && message.safetyAlerts.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <Shield className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-800">Safety Alerts</span>
                          </div>
                          {message.safetyAlerts.map((alert, index) => (
                            <p key={index} className="text-xs text-yellow-700">
                              • {alert.message}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Relevant Drugs */}
                      {message.relevantDrugs && message.relevantDrugs.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <Pill className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-800">
                              Relevant Medications ({message.relevantDrugs.length})
                            </span>
                          </div>
                          <div className="text-xs text-blue-700">
                            {message.relevantDrugs.slice(0, 3).map((drug, index) => (
                              <span key={index}>
                                {drug.Drug}
                                {index < Math.min(2, message.relevantDrugs.length - 1) && ', '}
                              </span>
                            ))}
                            {message.relevantDrugs.length > 3 && ` +${message.relevantDrugs.length - 3} more`}
                          </div>
                        </div>
                      )}

                      {/* Model Info */}
                      {message.model && (
                        <div className="text-xs text-gray-500">
                          Model: {message.model}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Message */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Nelson Med Aid</span>
                  <span className="text-xs text-gray-500">thinking...</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="small" />
                    <span className="text-gray-600">Processing your medical query...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a medical question... (e.g., 'What is the appropriate acetaminophen dose for a 5-year-old?')"
                className="input-field resize-none"
                rows="2"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="btn-primary px-4 py-2 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 flex items-center space-x-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Educational information only - consult healthcare professionals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalChat
