import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // 1. Each .appear -> own animationend -> add is-in (once: true)
    const appears = document.querySelectorAll('.appear');
    appears.forEach((el) => {
      el.addEventListener(
        'animationend',
        () => {
          el.classList.add('is-in');
        },
        { once: true }
      );
    });

    const heroPhoto = document.querySelector('.hero-photo');
    if (heroPhoto) {
      heroPhoto.addEventListener(
        'animationend',
        () => {
          heroPhoto.classList.add('is-in');
        },
        { once: true }
      );
    }

    // 2. JS fallback: after two requestAnimationFrames, if no running animations, force .is-in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let anyRunning = false;
        appears.forEach((el) => {
          if (el.getAnimations && el.getAnimations().length > 0) {
            anyRunning = true;
          }
        });
        if (!anyRunning) {
          appears.forEach((el) => el.classList.add('is-in'));
          if (heroPhoto) heroPhoto.classList.add('is-in');
        }
      });
    });

    // Escape key closes menu
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    // Resize >= 901px closes menu
    const handleResize = () => {
      if (window.innerWidth >= 901) setMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`landing-root ${menuOpen ? 'menu-open' : ''}`}>
      <style>{`
        /* Force black immediately */
        html, body {
          background: #000000 !important;
          color: #ffffff;
        }

        .landing-root {
          background: #000000;
          color: #ffffff;
          min-height: 100vh;
          min-height: 100dvh;
          position: relative;
          overflow-x: hidden;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        :root {
          --bg: #000000;
          --text: #ffffff;
          --muted: #9a9a9a;
          --stat: #d8d8d8;
          --border: rgba(255, 255, 255, 0.16);
          --border-soft: rgba(255, 255, 255, 0.12);

          --logo: 15.5px;
          --logo-mark: 22px;
          --nav: 14px;
          --nav-h: 40px;
          --btn: 13.5px;
          --btn-h: 40px;
          --hero-btn-h: 42px;
          --h1: 48px;
          --lede: 15.5px;
          --badge: 12.5px;
          --stat-size: 13.5px;
          --header-y: 22px;
          --header-x: 40px;
          --stats-x: 72px;
          --stats-y: 36px;
          --hero-gap: 85px;
          --copy-max: 860px;
          --lede-max: 470px;
        }

        .landing-root .grain {
          position: fixed;
          inset: 0;
          z-index: 100;
          pointer-events: none;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .landing-root .hero-photo {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: url('/farmer-hero.jpg') center center / cover no-repeat;
          opacity: 1;
          transition: opacity 1s ease;
        }

        .landing-root .hero-photo::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.35) 42%, rgba(0, 0, 0, 0.75) 75%, #000000 100%);
          pointer-events: none;
        }

        .landing-root .page {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-rows: auto 1fr auto;
          min-height: 100vh;
          min-height: 100dvh;
        }

        /* Header — 3-column grid */
        .landing-root header.header,
        .landing-root .landing-header {
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          height: auto !important;
          background: transparent !important;
          border: none !important;
          display: grid !important;
          grid-template-columns: 1fr auto 1fr !important;
          align-items: center !important;
          padding: var(--header-y) var(--header-x) 10px !important;
          z-index: 50 !important;
        }

        .landing-root a.logo {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          justify-self: start;
          font-size: var(--logo);
          font-weight: 600;
          letter-spacing: -0.03em;
          color: #ffffff;
        }

        .landing-root .logo-mark {
          width: var(--logo-mark);
          height: var(--logo-mark);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .landing-root .logo-suffix {
          font-weight: 400;
          color: rgba(255, 255, 255, 0.75);
        }

        .landing-root #site-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-self: center;
        }

        .landing-root .nav-pill {
          height: var(--nav-h);
          padding: 0 18px;
          border-radius: 7px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(198, 198, 198, 0.55);
          background: linear-gradient(105deg, #050505 0%, #2a2a2a 48%, #4a4a4a 100%);
          color: #f3f3f3;
          font-size: var(--nav);
          font-weight: 400;
          letter-spacing: -0.01em;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, transform 0.2s ease;
        }

        .landing-root .nav-pill::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.16) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }

        .landing-root .nav-pill:hover {
          border-color: rgba(235, 235, 235, 0.9);
          background: linear-gradient(105deg, #111 0%, #3a3a3a 45%, #6a6a6a 100%);
          box-shadow: 0 0 18px rgba(200, 210, 230, 0.18);
        }

        .landing-root .nav-pill:hover::before {
          transform: translateX(120%);
        }

        .landing-root .btn {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: var(--btn-h);
          padding: 0 16px;
          border-radius: 6px;
          font-size: var(--btn);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, color 0.35s ease, filter 0.35s ease, transform 0.2s ease;
        }

        .landing-root .btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.45) 48%, transparent 76%);
          transform: translateX(-130%);
          transition: transform 0.65s ease;
          pointer-events: none;
        }

        .landing-root .btn:hover::after {
          transform: translateX(130%);
        }

        .landing-root .btn-solid {
          background: linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%);
          color: #111111;
          border: 1px solid #ffffff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }

        .landing-root .btn-solid:hover {
          background: linear-gradient(180deg, #ffffff 0%, #f3f6ff 42%, #d5def2 100%);
          border-color: #f2f6ff;
          box-shadow: inset 0 1px 0 #ffffff, 0 0 22px rgba(186, 208, 255, 0.35), 0 8px 18px rgba(255, 255, 255, 0.12);
        }

        .landing-root .header-cta {
          justify-self: end;
        }

        .landing-root .hero-btn {
          height: var(--hero-btn-h);
          padding: 0 18px;
        }

        .landing-root .hero-btn.btn-solid:hover {
          box-shadow: inset 0 1px 0 #ffffff, 0 0 26px rgba(186, 208, 255, 0.4), 0 8px 18px rgba(255, 255, 255, 0.14);
        }

        .landing-root .hero-ghost {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(0, 0, 0, 0.5) 46%, rgba(150, 170, 200, 0.1));
          border: 1px solid rgba(198, 198, 198, 0.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #ffffff;
        }

        .landing-root .hero-ghost:hover {
          border-color: rgba(220, 230, 255, 0.8);
          box-shadow: 0 0 24px rgba(170, 200, 255, 0.28);
        }

        .landing-root .burger-btn {
          display: none;
          width: 42px;
          height: 42px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: rgba(8, 8, 8, 0.55);
          z-index: 60;
          justify-self: end;
          place-items: center;
          cursor: pointer;
        }

        .landing-root .burger-box {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
          justify-content: center;
        }

        .landing-root .burger-bar {
          width: 16px;
          height: 1.5px;
          background: #ffffff;
          border-radius: 1px;
          transition: transform 0.25s ease, opacity 0.2s ease;
        }

        .landing-root.menu-open .burger-bar:nth-child(1) {
          transform: translateY(6.5px) rotate(45deg);
        }

        .landing-root.menu-open .burger-bar:nth-child(2) {
          opacity: 0;
        }

        .landing-root.menu-open .burger-bar:nth-child(3) {
          transform: translateY(-6.5px) rotate(-45deg);
        }

        .landing-root .menu-backdrop {
          display: none;
        }

        .landing-root main.hero {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 8px 24px var(--hero-gap);
          min-height: 0;
        }

        .landing-root .hero-copy {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: var(--copy-max);
          width: 100%;
        }

        .landing-root .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          padding: 9px 15px;
          border: 0;
          border-radius: 5px;
          background: linear-gradient(90deg, #7d7d7d 0%, #2a2a2a 52%, #0a0a0a 100%);
          color: #f2f2f2;
          font-size: var(--badge);
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .landing-root .badge-star {
          width: 18px;
          height: 20px;
          fill: #ffffff;
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.45));
        }

        .landing-root h1.headline {
          font-size: var(--h1);
          font-weight: 500;
          letter-spacing: -0.045em;
          line-height: 1.12;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .landing-root .headline-line {
          display: block;
          overflow: hidden;
          padding: 0.06em 0.15em 0.14em;
        }

        .landing-root h1.headline em {
          font-family: "Instrument Serif", "Times New Roman", Times, serif;
          font-style: italic;
          font-weight: 400;
          font-size: 1.08em;
          letter-spacing: -0.03em;
          color: #9a9a9a;
        }

        .landing-root p.lede {
          max-width: var(--lede-max);
          margin-top: 18px;
          color: #9a9a9a;
          font-size: var(--lede);
          font-weight: 400;
          line-height: 1.55;
          letter-spacing: -0.015em;
        }

        .landing-root .hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 26px;
        }

        .landing-root footer.stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 0 var(--stats-x) var(--stats-y);
          padding-bottom: max(var(--stats-y), env(safe-area-inset-bottom));
          color: var(--stat);
        }

        .landing-root .stat {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-size: var(--stat-size);
          letter-spacing: -0.015em;
          white-space: nowrap;
        }

        .landing-root .stat-icon {
          width: 20px;
          height: 20px;
          color: #e8e8e8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .landing-root .stat-icon-wide {
          width: 38px;
          height: 21px;
        }

        /* Entrance Animations */
        .landing-root .appear {
          opacity: 1;
          animation-duration: 1.05s;
          animation-fill-mode: both;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-delay: var(--d, 0.08s);
        }

        .landing-root .is-in {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
          clip-path: none !important;
          filter: none !important;
        }

        @keyframes in-scale {
          from { opacity: 0; transform: scale(0.84); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes in-soft {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes in-mask {
          from { opacity: 0; transform: translateY(40%); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes in-pop {
          0% { opacity: 0; transform: scale(0.9); }
          70% { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes in-btn {
          from { opacity: 0; transform: translateY(18px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes in-side {
          from { opacity: 0; transform: translateX(22px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes in-stat {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes in-star {
          0% { opacity: 0; transform: scale(0.2) rotate(-50deg); }
          65% { transform: scale(1.2) rotate(8deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        @keyframes in-em {
          from { opacity: 0.35; filter: blur(4px); }
          to { opacity: 1; filter: blur(0); }
        }

        .landing-root .appear--scale { animation-name: in-scale; }
        .landing-root .appear--soft { animation-name: in-soft; }
        .landing-root .appear--mask { animation-name: in-mask; }
        .landing-root .appear--pop { animation-name: in-pop; }
        .landing-root .appear--btn { animation-name: in-btn; }
        .landing-root .appear--side { animation-name: in-side; }
        .landing-root .appear--stat { animation-name: in-stat; }

        .landing-root .badge-star {
          animation: in-star 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.28s both;
        }

        .landing-root h1.headline em {
          animation: in-em 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.72s both;
        }

        /* Desktop Lock */
        @media (min-width: 901px) {
          .landing-root {
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
          }
          .landing-root .page {
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
          }
        }

        /* 901 - 1279px */
        @media (min-width: 901px) and (max-width: 1279px) {
          .landing-root {
            --logo: 15px;
            --nav: 13px;
            --nav-h: 36px;
            --btn: 13px;
            --btn-h: 38px;
            --hero-btn-h: 40px;
            --h1: 42px;
            --lede: 15px;
            --badge: 12px;
            --stat-size: 12.5px;
            --header-y: 16px;
            --header-x: 28px;
            --stats-x: 36px;
            --stats-y: 28px;
            --hero-gap: 64px;
            --copy-max: 760px;
            --lede-max: 440px;
          }
          .landing-root .nav-pill { padding: 0 14px; }
          .landing-root .badge { margin-bottom: 16px; }
          .landing-root p.lede { margin-top: 14px; }
          .landing-root .hero-actions { margin-top: 20px; }
        }

        /* 1280 - 1599px */
        @media (min-width: 1280px) and (max-width: 1599px) {
          .landing-root {
            --h1: 54px;
            --lede: 16px;
            --header-x: 48px;
            --stats-x: 80px;
            --copy-max: 900px;
          }
        }

        /* >= 1600px */
        @media (min-width: 1600px) {
          .landing-root {
            --logo: 17px;
            --logo-mark: 24px;
            --nav: 15px;
            --nav-h: 44px;
            --btn: 15px;
            --btn-h: 44px;
            --hero-btn-h: 48px;
            --h1: 64px;
            --lede: 18px;
            --badge: 13.5px;
            --stat-size: 15px;
            --header-y: 28px;
            --header-x: 64px;
            --stats-x: 96px;
            --stats-y: 44px;
            --copy-max: 980px;
            --lede-max: 540px;
          }
        }

        /* Phone */
        @media (max-width: 900px) {
          .landing-root {
            --logo: 16px;
            --btn: 15px;
            --btn-h: 46px;
            --hero-btn-h: 48px;
            --h1: 36px;
            --lede: 16.5px;
            --badge: 13.5px;
            --stat-size: 15px;
            --header-y: 16px;
            --header-x: 18px;
            --stats-x: 20px;
            --stats-y: 28px;
            --hero-gap: 36px;
          }

          .landing-root header.header,
          .landing-root .landing-header {
            grid-template-columns: 1fr auto auto !important;
            gap: 8px !important;
          }

          .landing-root .burger-btn {
            display: grid;
          }

          .landing-root .menu-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 40;
            background: rgba(8, 8, 8, 0.42);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.28s ease, visibility 0.28s ease;
          }

          .landing-root.menu-open .menu-backdrop {
            opacity: 1;
            visibility: visible;
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
          }

          .landing-root #site-nav {
            position: fixed;
            inset: 0;
            z-index: 45;
            background: transparent;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 96px 22px 32px;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.28s ease, visibility 0.28s ease;
          }

          .landing-root.menu-open #site-nav {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }

          .landing-root .nav-pill {
            width: 100%;
            height: 56px;
            font-size: 19px;
            border-radius: 10px;
          }

          .landing-root footer.stats {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
        }

        @media (max-width: 560px) {
          .landing-root {
            --h1: 34px;
            --lede: 16px;
            --header-x: 16px;
          }
          .landing-root .hero-actions {
            flex-direction: column;
            width: 100%;
          }
          .landing-root .hero-actions .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="grain"></div>
      <div className="hero-photo"></div>

      <div className="page">
        <div
          className="menu-backdrop"
          id="menu-backdrop"
          onClick={() => setMenuOpen(false)}
        ></div>

        {/* Header — 3-column grid */}
        <header className="header landing-header">
          {/* Left Logo */}
          <Link
            to="/"
            className="logo appear appear--scale"
            style={{ '--d': '0.08s' }}
            aria-label="Vesper.ai"
          >
            <span className="logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <g transform="rotate(-30 12 12)">
                  <circle cx="7.3" cy="3.2" r="1.45" />
                  <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
                  <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
                  <circle cx="16.7" cy="20.8" r="1.45" />
                </g>
              </svg>
            </span>
            <span>
              Vesper<span className="logo-suffix">.ai</span>
            </span>
          </Link>

          {/* Center Nav */}
          <nav id="site-nav" aria-label="Primary">
            <Link
              to="/dashboard"
              className="nav-pill appear appear--scale"
              style={{ '--d': '0.16s' }}
              onClick={() => setMenuOpen(false)}
            >
              Benefits
            </Link>
            <Link
              to="/dashboard"
              className="nav-pill appear appear--soft"
              style={{ '--d': '0.28s' }}
              onClick={() => setMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/dashboard"
              className="nav-pill appear appear--scale"
              style={{ '--d': '0.40s' }}
              onClick={() => setMenuOpen(false)}
            >
              FAQs
            </Link>
            <Link
              to="/dashboard"
              className="nav-pill appear appear--soft"
              style={{ '--d': '0.52s' }}
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
          </nav>

          {/* Right CTA */}
          <Link
            to="/login"
            className="btn btn-solid header-cta appear appear--scale"
            style={{ '--d': '0.34s' }}
          >
            Start for Free
          </Link>

          {/* Burger for Phone */}
          <button
            className="burger-btn appear appear--scale"
            style={{ '--d': '0.34s' }}
            id="burger-toggle"
            aria-controls="site-nav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="burger-box">
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
            </span>
          </button>
        </header>

        {/* Main Hero (Bottom-centered) */}
        <main className="hero" id="top">
          <div className="hero-copy">
            {/* Badge */}
            <div className="badge appear appear--pop" style={{ '--d': '0.22s' }}>
              <svg className="badge-star" viewBox="0 0 24 24">
                <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
              </svg>
              <span>Operational AI Infrastructure</span>
            </div>

            {/* H1 Two Masked Lines */}
            <h1 className="headline">
              <span className="headline-line">
                <span
                  className="appear appear--mask"
                  style={{ '--d': '0.42s', display: 'block' }}
                >
                  Train <em>AI agents</em> on your
                </span>
              </span>
              <span className="headline-line">
                <span
                  className="appear appear--mask"
                  style={{ '--d': '0.62s', display: 'block' }}
                >
                  workflows in minutes.
                </span>
              </span>
            </h1>

            {/* Lede */}
            <p
              className="lede appear appear--soft"
              style={{ '--d': '0.82s', animationDuration: '1.25s' }}
            >
              Deploy adaptive AI agents that learn, execute, and scale operational
              tasks across your business.
            </p>

            {/* Actions */}
            <div className="hero-actions">
              <Link
                to="/login"
                className="btn btn-solid hero-btn appear appear--btn"
                style={{ '--d': '0.96s' }}
              >
                Start for Free
              </Link>
              <Link
                to="/dashboard"
                className="btn hero-ghost hero-btn appear appear--side"
                style={{ '--d': '1.10s' }}
              >
                See it in action
              </Link>
            </div>
          </div>
        </main>

        {/* Stats Footer */}
        <footer className="stats">
          {/* Stat 1 */}
          <div className="stat appear appear--stat" style={{ '--d': '1.12s' }}>
            <span className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <defs>
                  <linearGradient
                    id="rectGrad1-jsx"
                    x1="3"
                    y1="2"
                    x2="14"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#3a3a3a" stopOpacity="0.62" />
                  </linearGradient>
                  <linearGradient
                    id="rectGrad2-jsx"
                    x1="13"
                    y1="2"
                    x2="24"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#3a3a3a" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.62" />
                  </linearGradient>
                </defs>
                <rect
                  x="3.4"
                  y="2.6"
                  width="7.2"
                  height="18.8"
                  rx="3.6"
                  fill="url(#rectGrad1-jsx)"
                />
                <rect
                  x="13.4"
                  y="2.6"
                  width="7.2"
                  height="18.8"
                  rx="3.6"
                  fill="url(#rectGrad2-jsx)"
                />
                <rect
                  x="9.2"
                  y="10.9"
                  width="5.6"
                  height="2.2"
                  rx="1.1"
                  fill="#4a4a4a"
                />
              </svg>
            </span>
            <span>4.2M+ workflows automated</span>
          </div>

          {/* Stat 2 */}
          <div className="stat appear appear--stat" style={{ '--d': '1.28s' }}>
            <span className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <rect
                  x="2.4"
                  y="2.4"
                  width="19.2"
                  height="19.2"
                  rx="6.2"
                  fill="#ffffff"
                />
                <path
                  d="M12 7.1v7.4"
                  stroke="#111111"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.15 12.35L12 16.2l3.85-3.85"
                  stroke="#111111"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
            <span>92% reduction in manual operations</span>
          </div>

          {/* Stat 3 */}
          <div className="stat appear appear--stat" style={{ '--d': '1.44s' }}>
            <span className="stat-icon-wide">
              <svg width="40" height="22" viewBox="0 0 40 22">
                <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
                <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
                <polygon points="7.2,5.2 8.6,8.2 6.2,7.5" fill="#2b2b2b" />
                <polygon points="13.2,5.2 11.8,8.2 14.2,7.5" fill="#2b2b2b" />
                <circle cx="8.9" cy="11.4" r="0.7" fill="#1a1a1a" />
                <circle cx="11.5" cy="11.4" r="0.7" fill="#1a1a1a" />

                <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
                <circle cx="18.1" cy="10.2" r="1.7" fill="#111111" />
                <circle cx="22.3" cy="10.2" r="1.7" fill="#111111" />
                <ellipse cx="20.2" cy="12.2" rx="0.9" ry="0.6" fill="#111111" />
                <path
                  d="M18.8 13.8 Q20.2 15.2 21.6 13.8"
                  stroke="#111111"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />

                <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
                <text
                  x="30.2"
                  y="15.1"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="700"
                  fontSize="12.5"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  e
                </text>
              </svg>
            </span>
            <span>180+ operational teams onboarded</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
