import React from 'react'
import { Menu, Stethoscope, User, Settings, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

const Header = ({ onMenuClick, currentSession }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-medical-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Nelson Med Aid
                </h1>
                <p className="text-xs text-gray-500">AI Medical Assistant</p>
              </div>
            </Link>
          </div>

          {/* Center - Session Info */}
          {currentSession && (
            <div className="hidden md:flex items-center space-x-2 bg-medical-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-medical-700 font-medium">
                Session Active
              </span>
              <span className="text-xs text-medical-600">
                ID: {currentSession.id?.toString().slice(-6)}
              </span>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-medical-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-safety-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Demo User</p>
                <p className="text-xs text-gray-500">Healthcare Professional</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile session info */}
      {currentSession && (
        <div className="md:hidden bg-medical-50 px-4 py-2 border-t border-medical-100">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-medical-700 font-medium">
              Session Active - ID: {currentSession.id?.toString().slice(-6)}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
