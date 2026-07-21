import React from 'react';
import { Link } from 'react-router-dom';
import '../css/AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* ── HEADER ── */}
      <header className="about-header">
        <Link to="/" className="about-logo">
          <span className="about-logo-icon">◆</span>
          <span className="about-logo-text">UmNi</span>
        </Link>
        <nav className="about-nav">
          <Link to="/" className="about-nav-link">Home</Link>
          <Link to="/login" className="about-nav-link">Login</Link>
          <Link to="/create-account" className="about-nav-link">Sign Up</Link>
        </nav>
      </header>

      {/* ── SUMMARY SECTION ── */}
      <section className="about-details" style={{ paddingTop: '2rem' }}>
        {/* Project Summary in Professional Style */}
        <div className="summary-container">
          <div className="manifesto-box">
            <h2 className="manifesto-title">Simplifying Mathematics with AI & Handwriting Recognition</h2>

            <p className="manifesto-para">
              <strong>UmNi</strong> is an advanced, AI-driven educational tool designed to bridge the gap between human handwriting and digital computation. By integrating a responsive digital canvas with state-of-the-art Large Language Models, UmNi translates freehand mathematical inputs into real-time, step-by-step LaTeX solutions.
            </p>

            <h3 style={{ color: 'var(--ink)', fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', fontWeight: 600 }}>Key Capabilities</h3>
            <p className="manifesto-para">
              • <strong>Interactive Canvas:</strong> Draw or write equations naturally on a responsive web drawing interface.<br />
              • <strong>Vision AI Recognition:</strong> Instantly process hand-drawn problems using a custom S3 image pipeline and OpenAI Vision model.<br />
              • <strong>LaTeX Math Rendering:</strong> Display complex equations, calculus, and algebra steps in clean mathematical formatting.<br />
              • <strong>Notes Archival Vault:</strong> Save, export, and manage your notes securely in a dedicated microservice repository.
            </p>

            <h3 style={{ color: 'var(--ink)', fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', fontWeight: 600 }}>System Architecture</h3>
            <p className="manifesto-para">
              UmNi is engineered as a secure, container-ready microservices architecture:<br />
              • <strong>Frontend:</strong> Responsive interface built with <strong>React.js</strong> and styled using premium design standards.<br />
              • <strong>API Gateway:</strong> Spring Cloud Gateway routing requests dynamically with embedded Resilience4J circuit breakers.<br />
              • <strong>Core Service:</strong> Spring Boot microservice handling chat, logic, and OpenAI/DeepSeek API integrations.<br />
              • <strong>Note Service:</strong> Standalone Spring Boot microservice connected to AWS S3 and MySQL for document archiving.<br />
              • <strong>Database Layer:</strong> Hybrid setup using MongoDB Atlas for chat histories and MySQL for structured notes.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="about-footer">
        <div className="about-footer-logo"> asK UMni</div>
        <p className="about-footer-copy">© 2026 UmNi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutPage;
