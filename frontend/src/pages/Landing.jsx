import React, { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Sun, Moon, ArrowRight, Grid, Users, AlertTriangle, Calendar, ShieldCheck } from 'lucide-react';
import { ThemeContext } from '../App';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', transition: 'background-color 0.3s'}}>
      {/* Header */}
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 5rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 800}}>
          <div style={{background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center'}}>
            <Home size={24} />
          </div>
          HostelSync
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
          <button onClick={toggleTheme} className="theme-toggle" style={{border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)'}}>
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5rem 5rem', maxWidth: 1400, margin: '0 auto', minHeight: '80vh'}}>
        <div style={{flex: 1, paddingRight: '4rem'}}>
          <h1 style={{fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', color: 'var(--text-primary)'}}>
            Run your hostel with <span style={{color: 'var(--accent-primary)'}}>clarity</span>, <br/>not chaos.
          </h1>
          <p style={{fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem', maxWidth: 600}}>
            HostelSync brings room allocation, student records, and maintenance complaints into one clean dashboard — built for wardens who'd rather solve problems than chase spreadsheets.
          </p>
          <div style={{display: 'flex', gap: '1rem'}}>
            <button 
              onClick={() => navigate('/login')} 
              style={{background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}
            >
              Login <ArrowRight size={20} />
            </button>
            <button 
              onClick={scrollToFeatures}
              style={{background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer'}}
            >
              Explore Features
            </button>
          </div>
        </div>
        
        <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'relative', width: 450, height: 350}}>
            <div style={{position: 'absolute', top: 50, left: 0, width: 400, height: 280, background: 'var(--accent-light)', borderRadius: '16px', display: 'flex', flexDirection: 'column'}}>
              <div style={{height: 60, background: 'var(--accent-primary)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'}}></div>
              <div style={{flex: 1, padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem'}}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{background: i === 4 ? 'var(--accent-primary)' : 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative'}}>
                     {i === 4 && <div style={{width: 16, height: 16, background: 'white', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}></div>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{position: 'absolute', bottom: 20, right: -20, width: 100, height: 120, background: 'var(--bg-sidebar)', border: '2px solid var(--border-color)', clipPath: 'polygon(50% 0%, 100% 30%, 100% 100%, 0 100%, 0% 30%)'}}>
               <div style={{width: 20, height: 20, background: 'var(--bg-main)', position: 'absolute', bottom: 20, left: 40}}></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section ref={featuresRef} style={{padding: '5rem 5rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)'}}>
        <div style={{maxWidth: 1400, margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '4rem'}}>
            <h2 style={{fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)'}}>Everything you need to run your hostel</h2>
            <p style={{fontSize: '1.2rem', color: 'var(--text-secondary)'}}>Powerful features designed to automate daily administration.</p>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
            {/* Feature 1 */}
            <div className="card" style={{padding: '2rem'}}>
              <Grid size={32} color="var(--accent-primary)" style={{marginBottom: '1rem'}} />
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>Smart Room Allocation</h3>
              <p style={{color: 'var(--text-secondary)', lineHeight: 1.5}}>Dynamic occupancy tracking and automatic vacancy calculation across all hostel blocks.</p>
            </div>
            {/* Feature 2 */}
            <div className="card" style={{padding: '2rem'}}>
              <Users size={32} color="var(--accent-primary)" style={{marginBottom: '1rem'}} />
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>Student Directory</h3>
              <p style={{color: 'var(--text-secondary)', lineHeight: 1.5}}>Centralized database with automated credential generation (Name & Contact) for instant onboarding.</p>
            </div>
            {/* Feature 3 */}
            <div className="card" style={{padding: '2rem'}}>
              <AlertTriangle size={32} color="var(--accent-primary)" style={{marginBottom: '1rem'}} />
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>Digital Complaints</h3>
              <p style={{color: 'var(--text-secondary)', lineHeight: 1.5}}>Students can log maintenance requests instantly, completely eliminating paper logbooks.</p>
            </div>
            {/* Feature 4 */}
            <div className="card" style={{padding: '2rem'}}>
              <ShieldCheck size={32} color="var(--accent-primary)" style={{marginBottom: '1rem'}} />
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>Warden & Admin Portals</h3>
              <p style={{color: 'var(--text-secondary)', lineHeight: 1.5}}>Role-based access control ensuring sensitive data is only accessible to authorized management.</p>
            </div>
            {/* Feature 5 */}
            <div className="card" style={{padding: '2rem'}}>
              <Calendar size={32} color="var(--accent-primary)" style={{marginBottom: '1rem'}} />
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>Leave & OD Tracking</h3>
              <p style={{color: 'var(--text-secondary)', lineHeight: 1.5}}>Approve or reject student out-passes and leaves digitally with full historical tracking.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

