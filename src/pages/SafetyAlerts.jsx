import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react'
import { dbHelpers } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

const SafetyAlerts = ({ currentSession }) => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await dbHelpers.supabase
          .from('safety_alerts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setAlerts(data || [])
      } catch (error) {
        console.error('Failed to fetch safety alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const getSeverityColor = (severity) => {
    if (severity >= 8) return 'bg-red-100 text-red-800 border-red-200'
    if (severity >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getSeverityIcon = (severity) => {
    if (severity >= 8) return <AlertTriangle className="w-4 h-4" />
    if (severity >= 6) return <Shield className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'high') return alert.severity_score >= 8
    if (filter === 'medium') return alert.severity_score >= 6 && alert.severity_score < 8
    if (filter === 'low') return alert.severity_score < 6
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Safety Alerts</h1>
        <p className="text-gray-600">Monitor and manage medical safety alerts</p>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">All Alerts</option>
            <option value="high">High Severity (8+)</option>
            <option value="medium">Medium Severity (6-7)</option>
            <option value="low">Low Severity (&lt;6)</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="card">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg border ${getSeverityColor(alert.severity_score)}`}>
                {getSeverityIcon(alert.severity_score)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {alert.alert_type?.replace('_', ' ')}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity_score)}`}>
                      Severity: {alert.severity_score}/10
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{alert.alert_message}</p>
                {alert.triggered_keywords && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium">Keywords:</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{alert.triggered_keywords}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No safety alerts</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No safety alerts have been generated yet'
              : `No ${filter} severity alerts found`
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default SafetyAlerts
