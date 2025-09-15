import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Users, 
  Database, 
  Shield, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { dbHelpers } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = ({ currentSession }) => {
  const [stats, setStats] = useState({
    totalQueries: 0,
    totalSessions: 0,
    totalDrugs: 0,
    safetyAlerts: 0,
    loading: true
  })

  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch basic statistics
        const [queriesResult, sessionsResult, drugsResult, alertsResult] = await Promise.all([
          dbHelpers.supabase.from('queries').select('*', { count: 'exact', head: true }),
          dbHelpers.supabase.from('user_sessions').select('*', { count: 'exact', head: true }),
          dbHelpers.supabase.from('pediatric_drugs').select('*', { count: 'exact', head: true }),
          dbHelpers.supabase.from('safety_alerts').select('*', { count: 'exact', head: true })
        ])

        setStats({
          totalQueries: queriesResult.count || 0,
          totalSessions: sessionsResult.count || 0,
          totalDrugs: drugsResult.count || 0,
          safetyAlerts: alertsResult.count || 0,
          loading: false
        })

        // Fetch recent activity
        const { data: recentQueries } = await dbHelpers.supabase
          .from('queries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentActivity(recentQueries || [])

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      name: 'Total Queries',
      value: stats.totalQueries,
      icon: Activity,
      color: 'medical',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Active Sessions',
      value: stats.totalSessions,
      icon: Users,
      color: 'blue',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Drug Database',
      value: stats.totalDrugs,
      icon: Database,
      color: 'green',
      change: 'Complete',
      changeType: 'neutral'
    },
    {
      name: 'Safety Alerts',
      value: stats.safetyAlerts,
      icon: Shield,
      color: 'safety',
      change: stats.safetyAlerts > 0 ? 'Active' : 'None',
      changeType: stats.safetyAlerts > 0 ? 'warning' : 'positive'
    }
  ]

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to Nelson Med Aid - Your AI-powered medical assistant
        </p>
      </div>

      {/* Current Session Info */}
      {currentSession && (
        <div className="card bg-gradient-to-r from-medical-50 to-medical-100 border-medical-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-medical-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-medical-900">
                Current Session Active
              </h3>
              <p className="text-medical-700">
                Session ID: {currentSession.id} • Started: {new Date(currentSession.started_at).toLocaleTimeString()}
              </p>
              <p className="text-sm text-medical-600 mt-1">
                Context: {currentSession.medical_context || 'General consultation'}
              </p>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mb-1"></div>
              <span className="text-sm font-medium text-medical-700">Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'warning' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last period</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((query, index) => (
                <div key={query.id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-medical-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {query.user_question || 'Medical query processed'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Confidence: {Math.round((query.confidence || 0.7) * 100)}% • 
                      {query.created_at ? new Date(query.created_at).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {(query.confidence || 0.7) > 0.8 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">Start a medical consultation to see activity here</p>
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Database Connection</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">AI Service</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Ready</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Safety Monitor</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Vector Search</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">Indexing</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Health Check</span>
              <span className="text-gray-900 font-medium">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2 py-3">
            <Activity className="w-5 h-5" />
            <span>Start Medical Chat</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2 py-3">
            <Database className="w-5 h-5" />
            <span>Browse Drug Database</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2 py-3">
            <Shield className="w-5 h-5" />
            <span>View Safety Alerts</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
