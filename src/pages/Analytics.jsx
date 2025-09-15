import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Activity, Clock, Brain } from 'lucide-react'
import { dbHelpers } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

const Analytics = ({ currentSession }) => {
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    avgConfidence: 0,
    avgLatency: 0,
    topModels: [],
    queryTrends: [],
    loading: true
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch query analytics
        const { data: queries, error } = await dbHelpers.supabase
          .from('queries')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error

        const totalQueries = queries?.length || 0
        const avgConfidence = queries?.length > 0 
          ? queries.reduce((sum, q) => sum + (q.confidence || 0), 0) / queries.length 
          : 0
        const avgLatency = queries?.length > 0
          ? queries.reduce((sum, q) => sum + (q.latency_ms || 0), 0) / queries.length
          : 0

        // Model usage
        const modelCounts = {}
        queries?.forEach(q => {
          const model = q.model || 'unknown'
          modelCounts[model] = (modelCounts[model] || 0) + 1
        })
        
        const topModels = Object.entries(modelCounts)
          .map(([model, count]) => ({ model, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setAnalytics({
          totalQueries,
          avgConfidence,
          avgLatency,
          topModels,
          queryTrends: queries?.slice(0, 10) || [],
          loading: false
        })
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        setAnalytics(prev => ({ ...prev, loading: false }))
      }
    }

    fetchAnalytics()
  }, [])

  if (analytics.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Usage analytics and performance insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-medical-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Queries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalQueries}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analytics.avgConfidence * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analytics.avgLatency)}ms
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-gray-900">Good</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Usage</h3>
          <div className="space-y-3">
            {analytics.topModels.map((model, index) => (
              <div key={model.model} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-medical-100 rounded flex items-center justify-center text-xs font-medium text-medical-600">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {model.model}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-medical-600 h-2 rounded-full"
                      style={{ 
                        width: `${(model.count / analytics.totalQueries) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{model.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h3>
          <div className="space-y-3">
            {analytics.queryTrends.map((query, index) => (
              <div key={query.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {query.user_question || 'Medical query'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(query.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    (query.confidence || 0) > 0.8 
                      ? 'bg-green-100 text-green-800'
                      : (query.confidence || 0) > 0.6
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {Math.round((query.confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">High Accuracy</h4>
            <p className="text-sm text-gray-600 mt-1">
              Average confidence score of {Math.round(analytics.avgConfidence * 100)}% indicates reliable responses
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Fast Response</h4>
            <p className="text-sm text-gray-600 mt-1">
              Average response time of {Math.round(analytics.avgLatency)}ms provides quick assistance
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Growing Usage</h4>
            <p className="text-sm text-gray-600 mt-1">
              {analytics.totalQueries} total queries processed with consistent performance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
