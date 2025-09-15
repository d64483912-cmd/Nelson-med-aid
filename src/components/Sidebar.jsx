import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, ExternalLink } from 'lucide-react'

const Sidebar = ({ isOpen, onClose, navigationItems }) => {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-medical-100 text-medical-700 border-r-2 border-medical-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-medical-600' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-medical-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-medical-700">
                  System Status
                </span>
              </div>
              <div className="space-y-1 text-xs text-medical-600">
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Service:</span>
                  <span className="text-green-600 font-medium">Ready</span>
                </div>
                <div className="flex justify-between">
                  <span>Safety Monitor:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 space-y-2">
              <a
                href="https://github.com/d64483912-cmd/Nelson-med-aid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="text-xs text-gray-400">
                Version 1.0.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
