import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Stethoscope, Activity, Shield, Database } from 'lucide-react'

// Components
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import Dashboard from './pages/Dashboard'
import MedicalChat from './pages/MedicalChat'
import DrugDatabase from './pages/DrugDatabase'
import SafetyAlerts from './pages/SafetyAlerts'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

// Services
import { medicalService } from './services/medicalService'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSession, setCurrentSession] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState(null)

  // Initialize application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        
        // Start a new session
        const session = await medicalService.startSession(
          'demo_user_' + Date.now(),
          'General medical consultation'
        )
        
        setCurrentSession(session)
        setError(null)
      } catch (err) {
        console.error('Failed to initialize app:', err)
        setError('Failed to initialize application. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()

    // Cleanup on unmount
    return () => {
      if (currentSession) {
        medicalService.endSession().catch(console.error)
      }
    }
  }, [])

  // Navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Activity,
      description: 'Overview and quick stats'
    },
    {
      name: 'Medical Chat',
      href: '/chat',
      icon: Stethoscope,
      description: 'AI-powered medical assistance'
    },
    {
      name: 'Drug Database',
      href: '/drugs',
      icon: Database,
      description: 'Pediatric medication database'
    },
    {
      name: 'Safety Alerts',
      href: '/safety',
      icon: Shield,
      description: 'Safety monitoring and alerts'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: Activity,
      description: 'Usage analytics and insights'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Initializing Nelson Med Aid...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-safety-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-safety-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Application Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          currentSession={currentSession}
        />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            navigationItems={navigationItems}
          />

          {/* Main Content */}
          <main className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : ''
          }`}>
            <div className="p-6">
              <Routes>
                <Route 
                  path="/" 
                  element={<Dashboard currentSession={currentSession} />} 
                />
                <Route 
                  path="/chat" 
                  element={<MedicalChat currentSession={currentSession} />} 
                />
                <Route 
                  path="/drugs" 
                  element={<DrugDatabase />} 
                />
                <Route 
                  path="/safety" 
                  element={<SafetyAlerts currentSession={currentSession} />} 
                />
                <Route 
                  path="/analytics" 
                  element={<Analytics currentSession={currentSession} />} 
                />
                <Route 
                  path="/settings" 
                  element={<Settings />} 
                />
                <Route 
                  path="*" 
                  element={<Navigate to="/" replace />} 
                />
              </Routes>
            </div>
          </main>
        </div>

        {/* Medical Disclaimer Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>
                  <strong>Medical Disclaimer:</strong> This application provides educational information only. 
                  Always consult qualified healthcare professionals for medical decisions.
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

export default App
