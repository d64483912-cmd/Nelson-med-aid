# Nelson Med Aid 🏥

AI-powered medical aid application with comprehensive Supabase backend integration, featuring Mistral AI for intelligent medical responses.

## 🌟 Features

- **🧠 AI-Powered Medical Assistance**: Mistral AI integration for intelligent medical responses
- **💊 Comprehensive Drug Database**: 510+ pediatric medications with detailed information
- **🔍 Vector Search**: Semantic search through medical knowledge base
- **🚨 Safety Monitoring**: Real-time safety alerts and contraindication checking
- **📊 Session Management**: Complete user session tracking and context preservation
- **🔒 Audit Logging**: Full compliance and security audit trails
- **⚡ Real-time Database**: Supabase integration with real-time capabilities

## 🏗️ Architecture

### Database Structure
- **pediatric_drugs** (510 records) - Comprehensive medication database
- **medical_embeddings** - Vector-enabled medical knowledge base
- **user_sessions** - Session management and context tracking
- **queries** - Query logging and analytics
- **safety_alerts** - Medical safety monitoring
- **medical_context_summary** - Session context summarization
- **audit_logs** - Security and compliance tracking

### AI Integration
- **Mistral AI** - Primary AI model for medical responses
- **Vector Search** - Semantic search through medical content
- **Safety Checking** - Automated safety alert generation
- **Context Awareness** - Session-based medical context preservation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account and project
- Mistral AI API key (optional - falls back to simulated responses)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/d64483912-cmd/Nelson-med-aid.git
   cd Nelson-med-aid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Seed the database**
   ```bash
   npm run seed-data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# AI Configuration
VITE_MISTRAL_API_KEY=your-mistral-api-key

# Application
VITE_APP_NAME=Nelson Med Aid
VITE_APP_VERSION=1.0.0
```

### Supabase Setup

Your Supabase project should have the following tables:
- `pediatric_drugs` - Drug information
- `medical_embeddings` - Vector search content
- `user_sessions` - Session management
- `queries` - Query logging
- `safety_alerts` - Safety monitoring
- `medical_context_summary` - Context summaries
- `audit_logs` - Audit trails

## 📚 API Usage

### Medical Service

```javascript
import { medicalService } from './src/services/medicalService.js'

// Start a session
const session = await medicalService.startSession('user_123', 'Pediatric consultation')

// Process a medical query
const response = await medicalService.processQuery(
  'What is the appropriate acetaminophen dose for a 5-year-old?',
  { specialty: 'pediatrics' }
)

// End session
await medicalService.endSession()
```

### Database Helpers

```javascript
import { dbHelpers } from './src/lib/supabase.js'

// Search drugs
const drugs = await dbHelpers.searchDrugs('acetaminophen')

// Search medical content
const content = await dbHelpers.searchMedicalContent('fever', 'pediatrics')

// Log events
await dbHelpers.logAuditEvent('user_hash', 'query_processed', { query_id: 123 })
```

### Mistral AI Integration

```javascript
import { mistralClient } from './src/lib/mistral.js'

// Generate medical response
const response = await mistralClient.generateMedicalResponse(
  'How to manage pediatric fever?',
  {
    specialty_focus: 'pediatrics',
    relevant_drugs: [...],
    medical_knowledge: [...]
  }
)
```

## 🛡️ Safety Features

### Automated Safety Alerts
- Dosing concern detection
- Drug interaction warnings
- Emergency keyword monitoring
- Severity scoring (1-10)

### Compliance & Auditing
- Complete audit trail
- User privacy protection (hashed identifiers)
- Session-based tracking
- Query logging with confidence scores

### Medical Disclaimers
- Educational information only
- Professional consultation recommendations
- Safety-first response generation

## 📊 Database Schema

### Core Tables

**pediatric_drugs**
- System, Drug, Class, Indication
- Pediatric_Dose, Max_Dose, Dosage_Form
- Contraindications, Major_Side_Effects
- Special_Notes

**medical_embeddings**
- Vector embeddings for semantic search
- Medical specialty categorization
- Confidence scoring
- Full-text medical content

**user_sessions**
- Session management
- Medical context preservation
- Risk level assessment
- Specialty focus tracking

## 🔍 Search Capabilities

### Drug Search
- Name-based search
- Indication matching
- System filtering
- Contraindication checking

### Medical Content Search
- Vector-based semantic search
- Specialty filtering
- Confidence-based ranking
- Context-aware results

## 🚨 Error Handling

### Graceful Degradation
- Mistral API fallback to simulated responses
- Database error recovery
- Session state preservation
- User-friendly error messages

### Logging & Monitoring
- Comprehensive error logging
- Performance monitoring
- Safety alert tracking
- Audit trail maintenance

## 🧪 Testing

```bash
# Run tests
npm test

# Seed test data
npm run seed-data

# Verify database setup
npm run setup-db
```

## 📈 Performance

### Optimizations
- Vector search indexing
- Query result caching
- Session state management
- Efficient database queries

### Monitoring
- Response time tracking
- Confidence score analysis
- Safety alert frequency
- User session analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🔮 Roadmap

- [ ] Advanced vector search with custom embeddings
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Integration with EHR systems
- [ ] Advanced analytics dashboard
- [ ] Real-time collaboration features

---

**⚠️ Medical Disclaimer**: This application provides educational information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.
