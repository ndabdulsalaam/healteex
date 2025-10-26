# Healteex Development Roadmap

## 1. Product Vision
Healteex will deliver a unified digital health platform that optimizes Nigeria’s pharmaceutical supply chain through AI-driven demand forecasting, seamless interoperability with health information systems, and inclusive access for rural and underserved communities.

---

## 2. MVP Feature Set & User Flow

### 2.1 Core MVP Features
- **Authentication & Role Management**
  - Secure login with multi-factor support.
  - Role-specific dashboards (Pharmacist, Policy Maker, Facility Administrator).
- **Facility & Inventory Management**
  - Facility profiles with location, type, ownership, and contact information.
  - Real-time stock capture (manual entry + integration data ingestion).
  - Stock-out and low-inventory alerts (SMS/email/in-app).
- **Demand Forecasting Dashboard**
  - Medicine demand forecasts with confidence intervals.
  - Historical consumption graphs, lead time and safety stock suggestions.
- **Supply Chain Analytics**
  - Stock variance reports, wastage tracking, expiry alerts.
  - Procurement planning (purchase requisitions, supplier linking).
- **Mobile Accessibility**
  - Offline-capable Android app for rural pharmacies/facilities with synchronization.
- **Audit & Activity Logging**
  - User actions tracked for compliance and troubleshooting.

### 2.2 MVP User Flow (Pharmacist Example)
1. **Login & Role Selection:** Access via web or mobile, authenticate, select facility.
2. **Dashboard Overview:** View stock status, pending alerts, and forecast summary.
3. **Stock Update:** Enter receipts or dispenses manually or confirm automated imports.
4. **Forecast Review:** Examine demand prediction and recommended reorder quantity.
5. **Procurement Action:** Generate requisition or notify suppliers.
6. **Audit Trail:** System logs actions for administrator review.

---

## 3. System Architecture Overview

### 3.1 High-Level Components
- **Frontend (Web + Mobile):**
  - React (TypeScript) web app served via Next.js for SSR and performance.
  - React Native (Expo) mobile app with offline-first local storage (SQLite/WatermelonDB).
- **Backend & APIs:**
  - Django with Django REST Framework (DRF) for modular RESTful APIs.
  - Authentication service using Django allauth or dj-rest-auth for OAuth2/OIDC.
- **Data Integration Layer:**
  - API adapters for DHIS2, OpenLMIS, hospital EMRs using Python integration services (Celery workers).
  - ETL pipelines via Apache Airflow (open-source) orchestrating data ingestion and cleaning.
- **AI/Analytics Service:**
  - Python ML service (scikit-learn, Prophet, PyTorch) containerized and served via Django channels or FastAPI microservice communicating over REST.
  - Feature store leveraging open-source Feast (self-hosted) or a PostgreSQL-backed custom store.
- **Data Storage:**
  - Primary transactional DB (PostgreSQL with PostGIS for geospatial features).
  - Analytical warehouse via PostgreSQL read replica or ClickHouse (open-source) for aggregated queries.
- **Messaging & Notifications:**
  - Celery + Redis or RabbitMQ for asynchronous tasks and event processing.
  - Notification microservice integrating with free-tier services (e.g., Firebase Cloud Messaging for push, Africa's Talking sandbox for SMS testing).
- **Infrastructure & DevOps:**
  - Containerization with Docker, orchestrated through Kubernetes (K3s or DigitalOcean Kubernetes) or Docker Compose for MVP.
  - CI/CD using GitHub Actions (free tier) with Infrastructure as Code via Terraform (open-source providers).

---

## 4. Technology Stack Recommendations

| Layer | Recommendation | Notes |
| --- | --- | --- |
| Frontend Web | React + Next.js (TypeScript) | SSR, component reuse, integrates with Tailwind CSS. |
| Frontend Mobile | React Native (Expo) | Rapid prototyping, offline support via SQLite. |
| Backend APIs | Django 4.x + Django REST Framework | Built-in admin, robust ORM, easy integration with DRF. |
| Authentication | Django allauth + dj-rest-auth | Supports OAuth2/OIDC, MFA integrations. |
| Database | PostgreSQL 14+ | Strong relational support; PostGIS for location queries. |
| Data Warehouse | ClickHouse or PostgreSQL analytics replica | Open-source analytics processing. |
| Caching & Queue | Redis (open-source) | Session caching, Celery broker. |
| Task Orchestration | Apache Airflow or Prefect (open-source editions) | Schedule ETL, model training. |
| AI/ML | Python stack (pandas, scikit-learn, Prophet, PyTorch) | MLflow (open-source) for experiment tracking. |
| Hosting | DigitalOcean, Linode, or AWS Free Tier (for prototypes) | Use Docker Compose/K3s clusters. |
| Monitoring | Prometheus + Grafana (open-source) | Observability for system health. |
| Prototyping Tools | Figma (free tier), Miro (free), Notion (free personal), Postman (free) | Support design, collaboration, API testing. |

---

## 5. AI/ML Demand Forecasting Approach

### 5.1 Data Inputs
- **Historical Consumption:** Dispense and receipt transactions per facility/medicine.
- **Stock Levels & Stock-outs:** Opening/closing balances, days of stock-out.
- **Demographics & Disease Burden:** Population, incidence of key diseases per region.
- **Seasonality Factors:** Weather data, health campaign schedules.
- **Supply Chain Metadata:** Lead times, supplier reliability, order fill rates.

### 5.2 Model Strategy
- **Baseline:** Time-series forecasting (Prophet/SARIMA) per medicine-facility pair.
- **Advanced Models:** Gradient boosted models (XGBoost, LightGBM) or Temporal Fusion Transformers for complex temporal dependencies using PyTorch Forecasting.
- **Cold Start Handling:** Regional clustering, meta-learning with facility characteristics.
- **Model Training:** Rolling-origin cross-validation with multi-step horizon.
- **Evaluation Metrics:** Mean Absolute Percentage Error (MAPE), Forecast Bias, Service Level (stock-out rate reduction).

### 5.3 Model Serving & Monitoring
- Batch inference nightly via Celery tasks updating forecast tables.
- On-demand inference endpoints for urgent recalculations.
- Model performance tracking with MLflow and alerting when drift exceeds thresholds.

---

## 6. Database Schema Outline

### 6.1 Key Entities
- **Facilities**
  - `facility_id`, `name`, `type`, `ownership`, `location (lat/long)`, `region`, `contact_info`.
- **Users**
  - `user_id`, `name`, `email`, `phone`, `role`, `facility_id`, `auth_provider_id`.
- **Medicines**
  - `medicine_id`, `name`, `generic_name`, `category`, `ATC_code`, `pack_size`, `unit`.
- **Inventory Transactions**
  - `transaction_id`, `facility_id`, `medicine_id`, `transaction_type (receipt/issue/adjustment)`, `quantity`, `batch_number`, `expiry_date`, `source_dest`, `timestamp`, `entered_by`.
- **Stock Snapshots**
  - `snapshot_id`, `facility_id`, `medicine_id`, `stock_on_hand`, `days_of_stock`, `recorded_at`, `data_source`.
- **Forecasts**
  - `forecast_id`, `facility_id`, `medicine_id`, `forecast_date`, `period_start`, `period_end`, `predicted_demand`, `confidence_interval_lower`, `confidence_interval_upper`, `model_version`.
- **Alerts**
  - `alert_id`, `facility_id`, `medicine_id`, `alert_type (stock-out/low stock/expiry)`, `alert_status`, `created_at`, `resolved_at`, `notes`.
- **Integrations**
  - `integration_id`, `system_name`, `api_credentials`, `last_sync_at`, `status`.

### 6.2 Relationships
- `Facilities` to `Users`: One-to-many.
- `Facilities` to `Inventory Transactions`: One-to-many.
- `Medicines` to `Inventory Transactions`: One-to-many.
- `Forecasts` linked to `Facilities` and `Medicines`.
- `Alerts` reference `Forecasts` and `Stock Snapshots`.

---

## 7. Data Security & Privacy Strategy

- **Compliance Frameworks:**
  - Nigeria Data Protection Regulation (NDPR).
  - HIPAA-inspired safeguards (administrative, physical, technical).
  - WHO guidelines for digital health data.
- **Security Measures:**
  - End-to-end encryption (TLS 1.2+ for transit; AES-256 for rest via open-source KMS solutions like HashiCorp Vault).
  - Role-based access with least privilege enforced via Django permissions and Keycloak integration if scaled.
  - Regular vulnerability scanning using open-source tools (OWASP ZAP, OpenVAS).
  - Audit trails with immutable logs stored in Elasticsearch/OpenSearch.
- **Data Privacy:**
  - De-identification of patient-level data if collected; prefer aggregate metrics.
  - Consent management for facilities sharing data.
  - Data residency compliance by hosting in African data centers (AWS Cape Town, Azure South Africa, or local providers).
- **Disaster Recovery:**
  - Automated backups, multi-region replication, RPO/RTO targets < 1 hour for critical services.
- **Policy & Governance:**
  - Appoint Data Protection Officer.
  - Incident response plan and breach notification procedure.
  - Periodic training for staff on data handling.

---

## 8. Scalability, Performance & Offline Considerations

- **Scalability:**
  - Modular Django apps with clear bounded contexts; scale horizontally using Gunicorn + Nginx.
  - Database read replicas and partitioning for large datasets.
  - CDN (Cloudflare free tier) for static content delivery.
- **Performance:**
  - Caching frequently accessed dashboards (Redis, Django cache framework).
  - Asynchronous processing for heavy tasks via Celery workers.
  - API rate limiting with Django REST throttling to ensure stability.
- **Offline Support:**
  - Mobile app stores transactions locally (SQLite) with background sync when connectivity resumes.
  - Conflict resolution rules (last-write-wins with manual review logs).
  - SMS/USSD fallback for critical alerts in low-bandwidth regions leveraging free/low-cost gateways during pilot.
- **Monitoring & Reliability:**
  - SLIs/SLOs for API latency, uptime (target 99.5%+).
  - Synthetic monitoring of key flows (login, data sync) using open-source tools like k6 or Selenium Grid.
  - Circuit breakers on integration services using library patterns (Hystrix-like in Python).

---

## 9. Project Management Plan

### 9.1 Development Timeline (Approx. 12 Months)

| Phase | Duration | Goals |
| --- | --- | --- |
| **Phase 1: MVP (0–4 months)** | Requirements gathering, UX research using Figma and Miro, foundational Django/React architecture, core features (authentication, inventory, basic forecasting), pilot integrations (DHIS2 sandbox), Android beta via Expo. |
| **Phase 2: Beta (5–8 months)** | Expanded analytics, advanced forecasting, policy maker dashboards, alerting workflows, security hardening, offline sync, pilot deployments in selected states. |
| **Phase 3: Full Launch (9–12 months)** | Scaling infrastructure, multi-region support, advanced integrations, performance optimization, compliance certification, nationwide rollout, onboarding partnerships. |

### 9.2 Key Team Roles
- **Product Manager:** Roadmap ownership, stakeholder alignment.
- **Technical Lead / Software Architect:** System design, technical decision-making.
- **Backend Engineers (2–3):** Django app development, integrations, database design.
- **Frontend Engineers (Web + Mobile):** React/React Native UI implementation, offline features.
- **Data Scientist / ML Engineer (2):** Forecasting models, data pipelines.
- **Data Engineer:** ETL, Airflow pipelines, data warehouse management.
- **DevOps Engineer:** CI/CD, infrastructure automation.
- **UI/UX Designer:** User research, wireframes, usability testing with Figma.
- **QA Engineer:** Automated testing, regression suites (Cypress, pytest, Detox).
- **Public Health Advisor:** Supply chain domain expertise, regulatory guidance.
- **Customer Success / Training Lead:** Facility onboarding, feedback loops.

### 9.3 Success Metrics & KPIs
- **Operational KPIs:**
  - 90% reduction in stock-out incidents at pilot facilities.
  - Forecast accuracy: MAPE < 15% for top 50 essential medicines.
  - User adoption: 80% monthly active facilities.
  - Data freshness: 95% of integrations syncing within 24 hours.
- **Business KPIs:**
  - Partner onboarding (number of hospitals/pharmacies).
  - Funding or subscription milestones achieved.
  - Net Promoter Score (NPS) from facility administrators.
- **Technical KPIs:**
  - System uptime > 99.5%.
  - API response time < 500 ms for 95th percentile.
  - Sync latency < 10 minutes for mobile offline data.

---

## 10. Next Steps & Recommendations

### 10.1 Data Acquisition
- **Primary Datasets:**
  - Historical drug consumption from Ministry of Health and State logistics management units.
  - DHIS2 logistics modules, OpenLMIS transaction logs.
  - National Health Facility Registry for facility metadata.
  - Demographic data from Nigeria Bureau of Statistics.
  - Disease surveillance data (NCDC).
- **Supplementary Datasets:**
  - Weather patterns (NiMet) for seasonality correlation.
  - NGO program data (e.g., CHAI, Global Fund supply chains).

### 10.2 Integration Partners
- **Governmental:** Federal Ministry of Health, National Primary Health Care Development Agency.
- **International & NGO:** UNICEF Supply Division, CHAI, Global Fund, PEPFAR implementing partners.
- **Tech Partners:** DHIS2 Nigeria team, OpenLMIS consortium, regional health data hubs (eHealth Africa).
- **Telecoms:** MTN, Airtel for SMS/USSD alert channels.

### 10.3 Open-Source Tools & Frameworks
- **Interoperability:** DHIS2 & OpenLMIS SDKs, OpenHIM, HAPI FHIR server.
- **Data & Analytics:** Metabase, Apache Superset, MLflow, Feast, dbt (core).
- **Development & Collaboration:** GitHub, GitHub Projects, Figma, Miro, Notion, Postman, Swagger UI.

---

## 11. Summary of Immediate Action Items
1. Establish core team and governance (appoint DPO, technical leads).
2. Conduct stakeholder discovery sessions with pilot facilities and government agencies.
3. Define detailed MVP requirements and UX prototypes using Figma/Miro.
4. Initiate data-sharing agreements and begin data ingestion sandbox using Airflow.
5. Set up foundational infrastructure (GitHub Actions, Docker-based dev environment, security baselines).
6. Start building modular integrations with DHIS2 and OpenLMIS using Django-based services.

---

Healteex is positioned to address critical gaps in Nigeria’s pharmaceutical supply chain through a robust, data-driven platform grounded in open-source technologies. Following this roadmap ensures a disciplined approach from MVP to full-scale launch while maximizing free tooling during prototyping.

## 12. Implementation Kickoff

The repository now includes starter code for the Django REST Framework backend (`backend/`) and the Vite + React TypeScript frontend (`frontend/`).

### 12.1 Backend Setup
1. `cd backend`
2. Create a virtual environment: `python -m venv .venv && source .venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Copy environment defaults: `cp .env.example .env`
5. Apply migrations: `python manage.py migrate`
6. Create a superuser: `python manage.py createsuperuser`
7. Run the API locally: `python manage.py runserver`

Key API endpoints:
- `GET /api/health/` – Health check used by the frontend probe.
- `api/v1/accounts/` – Admin-only CRUD for users.
- `api/v1/inventory/` – CRUD endpoints for facilities, medicines, transactions, forecasts, alerts, and integration configs.

### 12.2 Frontend Setup
1. `cd frontend`
2. Install dependencies (Node 18+ recommended): `npm install`
3. Start the dev server: `npm run dev`
4. Access the app via `http://localhost:5173`

The landing screen pings the Django health endpoint to confirm connectivity and will evolve into role-specific dashboards as APIs mature.

### 12.3 Next Engineering Tasks
- Implement authentication flows (token-based sessions, password resets, MFA hooks).
- Harden API permissions with granular DRF policies per role.
- Add integration workers (Celery + Redis) for DHIS2/OpenLMIS data ingestion.
- Scaffold forecasting pipelines (batch jobs, model registry, monitoring).
- Flesh out frontend routing and shared component library.
