import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../css/LandingPage.css';

const features = [
  {
    icon: '💬',
    title: 'Text Chat',
    desc: 'Ask any math question in plain English and get clear, step-by-step AI-generated answers instantly.',
  },
  {
    icon: '✏️',
    title: 'Vision Tab',
    desc: 'Draw geometry or algebra problems on the canvas. UmNi reads your sketch and solves it.',
  },
  {
    icon: '❓',
    title: 'Unknown Detection',
    desc: 'Mark any unknown value with ? and the AI will identify and solve for it automatically.',
  },
  {
    icon: '🖼️',
    title: 'Corrected Image',
    desc: 'Get a corrected, annotated image back alongside a complete step-by-step explanation.',
  },
  {
    icon: '📚',
    title: 'Session History',
    desc: 'All your chats and solutions are saved so you can revisit and review any problem anytime.',
  },
  {
    icon: '🔒',
    title: 'Secure Auth',
    desc: 'Your data is protected with token-based authentication and private session management.',
  },
];

const steps = [
  { number: '01', title: 'Draw or Type', desc: 'Write a question or sketch your math problem on the canvas.' },
  { number: '02', title: 'Mark the Unknown', desc: 'Use ? to indicate the value you want the AI to solve for.' },
  { number: '03', title: 'Get the Solution', desc: 'Receive a structured answer with steps and a corrected image.' },
];

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* ── HEADER ── */}
      <header className="lp-header">
        <div className="lp-logo">
          <span className="lp-logo-icon">◆</span>
          <span className="lp-logo-text">UmNi</span>
        </div>

        <nav className="lp-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>

        <div className="lp-header-right">
          <Link to="/login" className="lp-signin">Sign in</Link>
          <Link to="/login" className="lp-btn-dark">Get started →</Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <motion.section
        className="lp-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <span className="lp-badge">AI-Powered Math Assistant</span>
        <h1 className="lp-hero-title">
          Draw. Ask.<br />Solve
        </h1>
        <p className="lp-hero-sub">
          UmNi combines a smart chat interface with a drawing canvas so you can
          solve handwritten geometry and algebra problems in seconds.
        </p>
        <div className="lp-hero-btns">
          <Link to="/create-account" className="lp-btn-primary">Start for free →</Link>
          <Link to="/login" className="lp-btn-secondary">Sign in</Link>
        </div>
      </motion.section>

      {/* ── FEATURES ── */}
      
      <section className="lp-features" id="features">
        <div className="lp-section-label">Features</div>
        <h2 className="lp-section-title">Everything you need to solve math problems</h2>
        <h4 className="lp-section-sub">From simple algebra to complex geometry — UmNi handles it all with AI precision.</h4>
      
        <div className="lp-feature-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="lp-feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-section-label">How it works</div>
        <h2 className="lp-section-title">Three steps to a solution</h2>
        <div className="lp-steps">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="lp-step"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <div className="lp-step-number">{s.number}</div>
              <div className="lp-step-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ABOUT / TECH STACK ── */}
      <section className="lp-about" id="about">
        <div className="lp-section-label">About</div>
        <h2 className="lp-section-title">Built with modern tech</h2>
        <div className="lp-stack-grid">
          {[
            { label: 'Frontend', value: 'React.js' },
            { label: 'Backend', value: 'Spring Boot' },
            { label: 'Database', value: 'MongoDB' },
            { label: 'AI', value: 'OpenAI / DEEPSEEK API' },
            { label: 'Canvas', value: 'HTML5 Canvas' },
            { label: 'Build', value: 'Maven' },
          ].map((t, i) => (
            <div key={i} className="lp-stack-item">
              <span className="lp-stack-label">{t.label}</span>
              <span className="lp-stack-value">{t.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.section
        className="lp-cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2>Ready to solve smarter?</h2>
        <p>Create a free account and start drawing your first problem in seconds.</p>
        <Link to="/create-account" className="lp-btn-primary">Get started for free →</Link>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-logo">
          <span className="lp-logo-icon">◆</span>
          <span className="lp-logo-text">UmNi</span>
        </div>
        <p className="lp-footer-copy">© 2026 UmNi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
