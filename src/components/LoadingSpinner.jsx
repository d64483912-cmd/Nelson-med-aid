import React from 'react'

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="spinner"></div>
    </div>
  )
}

export default LoadingSpinner
