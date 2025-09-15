import React, { useState } from 'react'
import { Settings as SettingsIcon, Save, Key, Database, Shield, Bell } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    mistralApiKey: '',
    notifications: true,
    safetyAlerts: true,
    autoSave: true,
    theme: 'light'
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your Nelson Med Aid application</p>
      </div>

      {/* API Configuration */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mistral AI API Key
            </label>
            <input
              type="password"
              value={settings.mistralApiKey}
              onChange={(e) => handleInputChange('mistralApiKey', e.target.value)}
              placeholder="Enter your Mistral AI API key"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for AI-powered medical responses. Without this, the system will use simulated responses.
            </p>
          </div>
        </div>
      </div>

      {/* Database Settings */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Database Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-save Sessions</label>
              <p className="text-xs text-gray-500">Automatically save session data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-medical-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Safety & Notifications */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Safety & Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Safety Alerts</label>
              <p className="text-xs text-gray-500">Enable real-time safety monitoring</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.safetyAlerts}
                onChange={(e) => handleInputChange('safetyAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-medical-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
              <p className="text-xs text-gray-500">Receive notifications for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleInputChange('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-medical-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <SettingsIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Version:</span>
            <span className="ml-2 text-gray-600">1.0.0</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Database:</span>
            <span className="ml-2 text-green-600">Connected</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">AI Service:</span>
            <span className="ml-2 text-green-600">Ready</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Safety Monitor:</span>
            <span className="ml-2 text-green-600">Active</span>
          </div>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Configuration</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Required Environment Variables:</h4>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">VITE_SUPABASE_URL</span>
              <span className="text-green-600">✓ Set</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">VITE_SUPABASE_PUBLISHABLE_KEY</span>
              <span className="text-green-600">✓ Set</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">VITE_MISTRAL_API_KEY</span>
              <span className="text-yellow-600">⚠ Optional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`btn-primary flex items-center space-x-2 ${
            saved ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Medical Disclaimer */}
      <div className="card bg-medical-50 border-medical-200">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-medical-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-medical-900 mb-2">Medical Disclaimer</h4>
            <p className="text-sm text-medical-800">
              Nelson Med Aid provides educational information only and is not a substitute for 
              professional medical advice, diagnosis, or treatment. Always consult with qualified 
              healthcare professionals for medical decisions, especially regarding pediatric care.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
