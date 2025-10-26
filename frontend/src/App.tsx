import { useMemo } from "react";
import styles from "./App.module.css";

type FeatureCategory = {
  title: string;
  description: string;
  items: string[];
};

type ArchitectureBlock = {
  title: string;
  summary: string;
  highlights: string[];
};

type TechStackEntry = {
  layer: string;
  recommendation: string;
  notes: string;
};

type RoadmapPhase = {
  phase: string;
  duration: string;
  goals: string;
};

const heroCopy = {
  title: "Healteex Platform",
  subtitle:
    "A unified digital health platform delivering data-driven visibility and forecasting for Nigeria's pharmaceutical supply chain.",
  cta: "Explore the plan",
};

const featureCategories: FeatureCategory[] = [
  {
    title: "Authentication & Roles",
    description: "Secure access for pharmacists, policy makers, and facility administrators.",
    items: [
      "Multi-factor authentication with role-aware dashboards",
      "Granular permissions enforced through Django REST Framework",
      "Comprehensive audit trails for compliance",
    ],
  },
  {
    title: "Facility & Inventory",
    description: "Real-time visibility into stock levels across facilities.",
    items: [
      "Facility profiles with location, ownership, and contact data",
      "Manual and automated stock capture with low-stock alerts",
      "Procurement planning workflows for suppliers and requisitions",
    ],
  },
  {
    title: "Forecasting & Analytics",
    description: "AI-powered demand forecasting with operational insights.",
    items: [
      "Medicine demand predictions with confidence intervals",
      "Historical consumption trends and safety stock guidance",
      "Variance, wastage, and expiry analytics with proactive alerts",
    ],
  },
  {
    title: "Mobility & Integrations",
    description: "Reach underserved facilities with offline-first tools.",
    items: [
      "Offline-capable Android experience using React Native",
      "Data synchronization with DHIS2, OpenLMIS, and EMRs",
      "Notification services for SMS, email, and in-app alerts",
    ],
  },
];

const architectureBlocks: ArchitectureBlock[] = [
  {
    title: "Frontend Experiences",
    summary:
      "React web and mobile apps deliver tailored dashboards, offline capture, and responsive analytics views.",
    highlights: [
      "Next.js web app with reusable component library",
      "Expo-powered mobile app with SQLite offline store",
      "Shared design system built from roadmap prototypes",
    ],
  },
  {
    title: "APIs & Integrations",
    summary:
      "A Django + DRF backend provides modular APIs with integration workers orchestrated via Celery and Airflow.",
    highlights: [
      "Role-based authentication via Django allauth + dj-rest-auth",
      "Data ingestion workers for DHIS2, OpenLMIS, and EMRs",
      "Batch and on-demand ML inference endpoints",
    ],
  },
  {
    title: "Data & Intelligence",
    summary:
      "PostgreSQL stores transactional data while ClickHouse or replicas power analytics, with ML models tracked via MLflow.",
    highlights: [
      "Feature store leveraging Feast or curated PostgreSQL schemas",
      "Prophet, SARIMA, and transformer models for forecasting",
      "Performance monitoring with Prometheus and Grafana",
    ],
  },
];

const techStack: TechStackEntry[] = [
  { layer: "Frontend Web", recommendation: "React + Next.js (TypeScript)", notes: "SSR, Tailwind CSS integration" },
  { layer: "Frontend Mobile", recommendation: "React Native (Expo)", notes: "Offline-first with SQLite" },
  { layer: "Backend APIs", recommendation: "Django + DRF", notes: "Robust ORM and admin" },
  { layer: "Authentication", recommendation: "Django allauth + dj-rest-auth", notes: "OAuth2/OIDC ready" },
  { layer: "Database", recommendation: "PostgreSQL 14+", notes: "PostGIS for geospatial queries" },
  { layer: "Warehouse", recommendation: "ClickHouse or PostgreSQL replica", notes: "Aggregated analytics" },
  { layer: "Queue & Cache", recommendation: "Redis", notes: "Celery broker and cache" },
  { layer: "Orchestration", recommendation: "Apache Airflow", notes: "ETL and model scheduling" },
  { layer: "AI/ML", recommendation: "Prophet, scikit-learn, PyTorch", notes: "MLflow for experiment tracking" },
  { layer: "Monitoring", recommendation: "Prometheus + Grafana", notes: "System health and observability" },
];

const roadmapPhases: RoadmapPhase[] = [
  {
    phase: "Phase 1: MVP",
    duration: "Months 0-4",
    goals:
      "Core authentication, inventory capture, basic forecasting, DHIS2 sandbox integration, and Android beta via Expo.",
  },
  {
    phase: "Phase 2: Beta",
    duration: "Months 5-8",
    goals:
      "Expanded analytics dashboards, advanced forecasting, alerting workflows, offline sync, and pilot deployments.",
  },
  {
    phase: "Phase 3: Launch",
    duration: "Months 9-12",
    goals:
      "Scale infrastructure, multi-region support, performance optimization, compliance certification, nationwide rollout.",
  },
];

const immediateNextSteps: string[] = [
  "Assemble the cross-functional core team and governance structure",
  "Conduct stakeholder discovery workshops with pilot facilities",
  "Finalize MVP UX prototypes in Figma and Miro",
  "Set up data-sharing agreements and initiate Airflow ingestion sandbox",
  "Establish CI/CD baselines with Dockerized environments",
  "Prototype Django integrations for DHIS2 and OpenLMIS",
];

function App() {
  const navItems = useMemo(
    () => [
      { id: "vision", label: "Vision" },
      { id: "features", label: "MVP Features" },
      { id: "architecture", label: "Architecture" },
      { id: "stack", label: "Tech Stack" },
      { id: "roadmap", label: "Roadmap" },
      { id: "next", label: "Next Steps" },
    ],
    []
  );

  return (
    <div className={styles.appShell}>
      <header className={styles.hero}>
        <nav className={styles.nav} aria-label="Primary">
          <span className={styles.brand}>Healteex</span>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.id}>
                <a className={styles.navLink} href={`#${item.id}`}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Product Blueprint</p>
          <h1 className={styles.heroTitle}>{heroCopy.title}</h1>
          <p className={styles.heroSubtitle}>{heroCopy.subtitle}</p>
          <a className={styles.heroCta} href="#features">
            {heroCopy.cta}
          </a>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section id="vision" className={styles.section} aria-labelledby="vision-title">
          <div className={styles.sectionHeader}>
            <h2 id="vision-title">Product Vision</h2>
            <p>
              Deliver a unified digital health platform that optimizes Nigeria&apos;s pharmaceutical supply chain through
              AI-powered demand forecasting, seamless integrations, and equitable access for underserved communities.
            </p>
          </div>
          <div className={styles.calloutGrid}>
            <article className={styles.calloutCard}>
              <h3>Why now?</h3>
              <p>
                Stock-outs and fragmented data prevent efficient care delivery. Healteex aligns stakeholders around
                trustworthy, timely insights to improve medicine availability.
              </p>
            </article>
            <article className={styles.calloutCard}>
              <h3>Who benefits?</h3>
              <p>
                Pharmacists, policy makers, and facility administrators receive targeted dashboards, while rural clinicians
                gain mobile tools to stay connected even offline.
              </p>
            </article>
          </div>
        </section>

        <section id="features" className={styles.section} aria-labelledby="features-title">
          <div className={styles.sectionHeader}>
            <h2 id="features-title">MVP Feature Pillars</h2>
            <p>Four foundational pillars define the MVP scope and user flows.</p>
          </div>
          <div className={styles.cardGrid}>
            {featureCategories.map((category) => (
              <article key={category.title} className={styles.featureCard}>
                <h3>{category.title}</h3>
                <p className={styles.featureDescription}>{category.description}</p>
                <ul className={styles.featureList}>
                  {category.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className={styles.section} aria-labelledby="architecture-title">
          <div className={styles.sectionHeader}>
            <h2 id="architecture-title">System Architecture</h2>
            <p>Composable services connect data ingestion, analytics, and user experiences.</p>
          </div>
          <div className={styles.cardGrid}>
            {architectureBlocks.map((block) => (
              <article key={block.title} className={styles.architectureCard}>
                <h3>{block.title}</h3>
                <p>{block.summary}</p>
                <ul className={styles.featureList}>
                  {block.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="stack" className={styles.section} aria-labelledby="stack-title">
          <div className={styles.sectionHeader}>
            <h2 id="stack-title">Technology Stack</h2>
            <p>Open-source tools provide a sustainable foundation from prototype to launch.</p>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.techTable}>
              <thead>
                <tr>
                  <th scope="col">Layer</th>
                  <th scope="col">Recommendation</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {techStack.map((entry) => (
                  <tr key={entry.layer}>
                    <th scope="row">{entry.layer}</th>
                    <td>{entry.recommendation}</td>
                    <td>{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="roadmap" className={styles.section} aria-labelledby="roadmap-title">
          <div className={styles.sectionHeader}>
            <h2 id="roadmap-title">12-Month Roadmap</h2>
            <p>Milestones guide the team from MVP validation to nationwide rollout.</p>
          </div>
          <ol className={styles.roadmapList}>
            {roadmapPhases.map((phase) => (
              <li key={phase.phase} className={styles.roadmapItem}>
                <h3>{phase.phase}</h3>
                <p className={styles.roadmapDuration}>{phase.duration}</p>
                <p>{phase.goals}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="next" className={styles.section} aria-labelledby="next-title">
          <div className={styles.sectionHeader}>
            <h2 id="next-title">Immediate Next Steps</h2>
            <p>Concrete actions kickstart development and stakeholder alignment.</p>
          </div>
          <ul className={styles.nextStepsList}>
            {immediateNextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Healteex. Building resilient pharmaceutical supply chains.</p>
      </footer>
    </div>
  );
}

export default App;
