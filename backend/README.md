# CPAS Backend - Crime Pattern Analysis System

Complete Node.js/Express backend for Crime Pattern Analysis System with Oracle Database integration.

##  Features

### Authentication System
- **Officer Login**: Officers authenticate using email and password from `Officer` table
- **Victim Login**: Victims authenticate using email and password from `Victim` table
- **Witness Login**: Witnesses authenticate using email and password from `Witness` table
- JWT-based authentication with role-based access control
- No separate Users table - authentication directly against entity tables

### CRUD Operations
Full CRUD operations for all entities:
- **Crimes**: Create, read, update, delete crimes with full details
- **Crime Reports**: Victims can file reports, Officers can manage them
- **Suspects**: Manage suspect records with criminal history
- **Evidence**: Track evidence with chain of custody
- **Locations**: Manage crime locations
- **Crime Types**: Manage crime categories
- **Investigations**: Full investigation management
- **Officers**: Officer management
- **Victims**: Victim profile management
- **Witnesses**: Witness profile management

### Advanced Database Features

#### Window Functions
- Crime trend analysis with `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`
- Cumulative statistics with `SUM() OVER()`
- Moving averages with window frames
- Month-over-month comparisons with `LAG()`

#### Complex Joins
- Multi-table joins for crime details (Crime, Crime_Type, Location, Officer)
- Self-joins for related crimes
- Outer joins for comprehensive data retrieval
- Bridge table joins for many-to-many relationships

#### Stored Procedures
- `sp_create_crime_report`: Auto-create crime from report
- `sp_assign_investigation`: Assign officer to investigation
- `sp_calculate_crime_statistics`: Calculate comprehensive statistics
- `sp_predict_crime_risk`: Predict crime risk for locations
- `sp_update_evidence_chain`: Maintain evidence chain of custody

#### Triggers
- `trg_audit_crime_reports`: Audit trail for crime reports
- `trg_update_crime_statistics`: Auto-update statistics
- `trg_notify_high_priority_crime`: Notify on high-priority crimes
- `trg_validate_suspect_data`: Data validation
- `trg_maintain_evidence_integrity`: Prevent deletion of linked evidence
- `trg_auto_update_investigation_status`: Auto-update investigation status
- `trg_validate_crime_dates`: Date validation

### Analytics & Predictions
- **Crime Trends**: Time-series analysis with window functions
- **Crime Hotspots**: Location-based crime ranking
- **Crime Patterns**: Day-of-week and time-of-day patterns
- **Category Distribution**: Crime category statistics
- **Officer Performance**: Performance metrics with rankings
- **Time Series Data**: Chart-ready time series data
- **Risk Assessment**: Predict crime risk for locations
- **Pattern Matching**: Find similar crime patterns
- **Forecast**: Forecast future crime trends

## 📁 Project Structure

```
backend/
├── app.js                      # Main application entry point
├── config/
│   └── db.js                  # Database connection configuration
├── controllers/               # Business logic controllers
│   ├── authController.js
│   ├── crimeController.js
│   ├── crimeReportController.js
│   ├── suspectController.js
│   ├── evidenceController.js
│   ├── locationController.js
│   ├── crimeTypeController.js
│   ├── investigationController.js
│   ├── analyticsController.js
│   ├── predictionController.js
│   ├── officerController.js
│   ├── victimController.js
│   └── witnessController.js
├── models/                    # Database interaction models
│   ├── OfficerModel.js
│   ├── VictimModel.js
│   ├── WitnessModel.js
│   ├── CrimeModel.js
│   ├── CrimeReportModel.js
│   ├── SuspectModel.js
│   ├── EvidenceModel.js
│   ├── LocationModel.js
│   ├── CrimeTypeModel.js
│   ├── InvestigationModel.js
│   ├── AnalyticsModel.js
│   └── PredictionModel.js
├── routes/                    # API route definitions
│   ├── authRoutes.js
│   ├── crimeRoutes.js
│   ├── crimeReportRoutes.js
│   ├── suspectRoutes.js
│   ├── evidenceRoutes.js
│   ├── locationRoutes.js
│   ├── crimeTypeRoutes.js
│   ├── investigationRoutes.js
│   ├── analyticsRoutes.js
│   ├── predictionRoutes.js
│   ├── officerRoutes.js
│   ├── victimRoutes.js
│   └── witnessRoutes.js
├── middlewares/              # Express middlewares
│   ├── authMiddleware.js     # JWT authentication
│   └── roleMiddleware.js     # Role-based access control
├── db-schema-updates.sql     # Schema updates for authentication
├── db-procedures.sql         # Stored procedures
└── db-triggers.sql           # Database triggers
```

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Run the following SQL files in order:

1. **Schema Updates** (add password fields):
   ```sql
   -- Run: db-schema-updates.sql
   ```

2. **Stored Procedures**:
   ```sql
   -- Run: db-procedures.sql
   ```

3. **Triggers**:
   ```sql
   -- Run: db-triggers.sql
   ```

### 3. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=localhost:1521/orcl
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 4. Run the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## 📡 API Endpoints

### Authentication

#### Officer
- `POST /api/auth/officer/signup` - Register new officer
- `POST /api/auth/officer/login` - Officer login

#### Victim
- `POST /api/auth/victim/signup` - Register new victim
- `POST /api/auth/victim/login` - Victim login

#### Witness
- `POST /api/auth/witness/signup` - Register new witness
- `POST /api/auth/witness/login` - Witness login

### Crimes
- `GET /api/crimes` - Get all crimes (with filters)
- `GET /api/crimes/:id` - Get crime by ID with full details
- `POST /api/crimes` - Create crime (Officer only)
- `PUT /api/crimes/:id` - Update crime (Officer only)
- `DELETE /api/crimes/:id` - Delete crime (Officer only)
- `POST /api/crimes/:id/suspects` - Link suspect to crime (Officer only)
- `POST /api/crimes/:id/victims` - Link victim to crime (Officer only)

### Crime Reports
- `GET /api/crime-reports` - Get all reports (filtered by role)
- `GET /api/crime-reports/:id` - Get report by ID
- `POST /api/crime-reports` - Create report (Victim only)
- `PUT /api/crime-reports/:id` - Update report status (Officer only)
- `POST /api/crime-reports/:id/link` - Link report to crime (Officer only)
- `DELETE /api/crime-reports/:id` - Delete report (Officer only)

### Suspects
- `GET /api/suspects` - Get all suspects (Officer only)
- `GET /api/suspects/:id` - Get suspect with crime history (Officer only)
- `POST /api/suspects` - Create suspect (Officer only)
- `PUT /api/suspects/:id` - Update suspect (Officer only)
- `DELETE /api/suspects/:id` - Delete suspect (Officer only)

### Evidence
- `GET /api/evidence` - Get all evidence (Officer only)
- `GET /api/evidence/:id` - Get evidence by ID (Officer only)
- `POST /api/evidence` - Create evidence (Officer only)
- `PUT /api/evidence/:id` - Update evidence (Officer only)
- `DELETE /api/evidence/:id` - Delete evidence (Officer only)

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create location (Officer only)
- `PUT /api/locations/:id` - Update location (Officer only)
- `DELETE /api/locations/:id` - Delete location (Officer only)

### Crime Types
- `GET /api/crime-types` - Get all crime types
- `GET /api/crime-types/:id` - Get crime type by ID
- `POST /api/crime-types` - Create crime type (Officer only)
- `PUT /api/crime-types/:id` - Update crime type (Officer only)
- `DELETE /api/crime-types/:id` - Delete crime type (Officer only)

### Investigations
- `GET /api/investigations` - Get all investigations (Officer only)
- `GET /api/investigations/:id` - Get investigation with linked crimes (Officer only)
- `POST /api/investigations` - Create investigation (Officer only)
- `PUT /api/investigations/:id` - Update investigation (Officer only)
- `POST /api/investigations/:id/crimes` - Link crime to investigation (Officer only)
- `DELETE /api/investigations/:id` - Delete investigation (Officer only)

### Analytics (Officer only)
- `GET /api/analytics/crime-trends` - Get crime trends with window functions
- `GET /api/analytics/hotspots` - Get crime hotspots
- `GET /api/analytics/patterns` - Get crime patterns by day/time
- `GET /api/analytics/category-distribution` - Get category distribution
- `GET /api/analytics/officer-performance` - Get officer performance stats
- `GET /api/analytics/time-series` - Get time series data for charts

### Predictions (Officer only)
- `POST /api/predictions/risk-assessment` - Predict crime risk for location
- `POST /api/predictions/pattern-matching` - Find similar crime patterns
- `GET /api/predictions/forecast` - Forecast future crime trends

### Officers
- `GET /api/officers` - Get all officers (Officer only)
- `GET /api/officers/:id` - Get officer by ID (Officer only)
- `POST /api/officers` - Create officer (Officer only)

### Victim Profile
- `GET /api/victim/profile` - Get victim profile (Victim only)
- `PUT /api/victim/profile` - Update victim profile (Victim only)

### Witness Profile
- `GET /api/witness/profile` - Get witness profile (Witness only)
- `PUT /api/witness/profile` - Update witness profile (Witness only)

## 🔐 Authentication

All endpoints (except auth endpoints) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🎯 Role-Based Access

- **OFFICER**: Full access to all features
- **VICTIM**: Can file crime reports, view own reports, update profile
- **WITNESS**: Can view profile, update profile (limited access)

## 📊 Database Optimization

- Indexes on frequently queried columns
- Window functions for efficient analytics
- Stored procedures for complex operations
- Triggers for data integrity and automation
- Connection pooling for performance

## 🧪 Testing

Use Postman or similar tool to test endpoints. A Postman collection can be created based on the routes above.

## 📝 Notes

- All dates should be in ISO format (YYYY-MM-DD)
- All IDs are numbers
- Error responses follow standard format: `{ message: "...", error: "..." }`
- Success responses include data: `{ data: [...] }`

## 🚨 Important

1. Run `db-schema-updates.sql` first to add password fields to tables
2. Set strong `JWT_SECRET` in `.env` file
3. Ensure Oracle database is running and accessible
4. All passwords are hashed using bcrypt

## 📚 Database Features Used

- ✅ Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM OVER)
- ✅ Complex Joins (INNER, LEFT, RIGHT, SELF)
- ✅ Stored Procedures
- ✅ Triggers
- ✅ Sequences (for auto-increment)
- ✅ Views (for analytics)
- ✅ Indexes (for performance)
- ✅ Constraints (for data integrity)

---

**Built with ❤️ for Crime Pattern Analysis System**
