import React, { useState, useEffect } from 'react'
import { Search, Pill, Filter, Eye, AlertTriangle } from 'lucide-react'
import { medicalService } from '../services/medicalService'
import LoadingSpinner from '../components/LoadingSpinner'

const DrugDatabase = () => {
  const [drugs, setDrugs] = useState([])
  const [filteredDrugs, setFilteredDrugs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSystem, setSelectedSystem] = useState('')
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDrug, setSelectedDrug] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all drugs and systems
        const [drugsResult, systemsResult] = await Promise.all([
          medicalService.searchDrugs(''),
          medicalService.getMedicalSystems()
        ])
        
        setDrugs(drugsResult.data || [])
        setFilteredDrugs(drugsResult.data || [])
        setSystems(systemsResult.data || [])
      } catch (error) {
        console.error('Failed to fetch drug data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = drugs

    if (searchTerm) {
      filtered = filtered.filter(drug =>
        drug.Drug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.Class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.Indication?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSystem) {
      filtered = filtered.filter(drug => drug.System === selectedSystem)
    }

    setFilteredDrugs(filtered)
  }, [searchTerm, selectedSystem, drugs])

  const DrugModal = ({ drug, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{drug.Drug}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">System</label>
                <p className="text-gray-900">{drug.System}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Class</label>
                <p className="text-gray-900">{drug.Class}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Indication</label>
              <p className="text-gray-900">{drug.Indication}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Pediatric Dose</label>
              <p className="text-gray-900 bg-medical-50 p-3 rounded">{drug.Pediatric_Dose}</p>
            </div>
            
            {drug.Max_Dose && (
              <div>
                <label className="text-sm font-medium text-gray-600">Maximum Dose</label>
                <p className="text-gray-900">{drug.Max_Dose}</p>
              </div>
            )}
            
            {drug.Contraindications && (
              <div>
                <label className="text-sm font-medium text-gray-600">Contraindications</label>
                <p className="text-safety-800 bg-safety-50 p-3 rounded">{drug.Contraindications}</p>
              </div>
            )}
            
            {drug.Major_Side_Effects && (
              <div>
                <label className="text-sm font-medium text-gray-600">Major Side Effects</label>
                <p className="text-gray-900">{drug.Major_Side_Effects}</p>
              </div>
            )}
            
            {drug.Special_Notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Special Notes</label>
                <p className="text-gray-900 bg-yellow-50 p-3 rounded">{drug.Special_Notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

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
        <h1 className="text-2xl font-bold text-gray-900">Drug Database</h1>
        <p className="text-gray-600">Comprehensive pediatric medication database with {drugs.length} drugs</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search drugs, classes, or indications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="input-field"
            >
              <option value="">All Systems</option>
              {systems.map(system => (
                <option key={system} value={system}>{system}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredDrugs.length} of {drugs.length} drugs</span>
          {(searchTerm || selectedSystem) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedSystem('')
              }}
              className="text-medical-600 hover:text-medical-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Drug List */}
      <div className="grid gap-4">
        {filteredDrugs.map((drug, index) => (
          <div key={index} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-medical-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{drug.Drug}</h3>
                    <p className="text-sm text-gray-600">{drug.Class} • {drug.System}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Indication:</strong> {drug.Indication}
                  </p>
                  <p className="text-sm text-medical-700 bg-medical-50 px-3 py-1 rounded inline-block">
                    <strong>Pediatric Dose:</strong> {drug.Pediatric_Dose}
                  </p>
                </div>
                {drug.Contraindications && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-safety-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Has contraindications</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedDrug(drug)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDrugs.length === 0 && (
        <div className="text-center py-12">
          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No drugs found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      )}

      {/* Drug Detail Modal */}
      {selectedDrug && (
        <DrugModal drug={selectedDrug} onClose={() => setSelectedDrug(null)} />
      )}
    </div>
  )
}

export default DrugDatabase
