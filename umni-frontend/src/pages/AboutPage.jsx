import React from 'react';
import { Link } from 'react-router-dom';
import '../css/AboutPage.css';
import firstImage from '../images/first.png';

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

      {/* ── HERO SECTION ── */}
      <section className="about-hero">
        <h1>asK UMni</h1>
        <div className="about-image-box">
          <img 
            src={firstImage} 
            alt="ask UMNi Interface" 
            className="about-img"
          />
        </div>
      </section>

      {/* ── TEAM & SUMMARY SECTION ── */}
      <section className="about-details">
        {/* Name pill containing collaborators */}
        <div className="team-pill">
          <span className="team-member">Karnika</span>
          <span className="team-member">Umair</span>
          <span className="team-member">Moni</span>
        </div>

        {/* Project Summary in Professional Style */}
        <div className="summary-container">
          <div className="manifesto-box">
            <h2 className="manifesto-title">We want to simplify mathematical complexity.</h2>

            <p className="manifesto-para">Yes, through modern engineering.</p>

            <p className="manifesto-para">
              Algebra. Calculus. Handwriting recognition.<br />
              We believe interface and intelligence should work as one.
            </p>

            <p className="manifesto-para">
              We built <span className="manifesto-highlight">UmNi</span> as a collaborative group project.<br />
              It combines a responsive drawing canvas with real-time AI processing.<br />
              Translating freehand handwriting into formatted step-by-step LaTeX.<br />
              Making mathematical computation accessible, visual, and intuitive.
            </p>

            <p className="manifesto-para">
              Collaborating as a team taught us the power of full-stack integration.
            </p>

            <p className="manifesto-para">
              Our frontend is built on <span className="manifesto-highlight">React.js</span>.<br />
              Our backend runs on a stateless <span className="manifesto-highlight">Spring Boot</span> server.<br />
              Connected to MongoDB Atlas and integrated with OpenAI & DeepSeek.
            </p>

            <p className="manifesto-para">
              Every integration challenged us to write cleaner, more robust code.<br />
              From managing JWT security contexts during reactive async dispatches,<br />
              To implementing reliable AWS S3 fallbacks and buffer stream decoders.
            </p>

            <div className="quote-line">
              Engineering the details.
            </div>

            <p className="manifesto-para">
              System architecture isn't just about making things work —<br />
              It's about writing code that scales and adapts.
            </p>

            <p className="manifesto-para">
              Why build isolated components —<br />
              when you can build a unified, secure system?
            </p>

            <p className="manifesto-para">
              The best software engineers are not just coders —<br />
              they are collaborative problem-solvers.
            </p>

            <p className="manifesto-para">
              This project represents our shared learning, dedication, and teamwork.
            </p>

            <div className="quote-line">
              Built by Karnika, Umair, and Moni.<br />
              Developed for the final project evaluation.
            </div>
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
