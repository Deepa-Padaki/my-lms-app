import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Learn Without Limits</h1>
          <p>Access world-class courses from expert instructors. Start your learning journey today with our comprehensive Learning Management System.</p>
          <div className="hero-buttons">
            {user ? (
              <Link to="/courses" className="btn-primary">Explore Courses</Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary">Get Started Free</Link>
                <Link to="/courses" className="btn-secondary">Browse Courses</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" alt="Students learning" />
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Our LMS?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h3>Expert Instructors</h3>
            <p>Learn from industry professionals with years of real-world experience.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Learn at Your Pace</h3>
            <p>Access course content anytime, anywhere. Progress tracking helps you stay on course.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Track Progress</h3>
            <p>Visual progress indicators show your completion status for each course.</p>
          </div>
        </div>
      </section>

      <section className="courses-preview">
        <h2>Popular Courses</h2>
        <div className="preview-courses">
          <div className="preview-card">
            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" alt="Java" />
            <h3>Java Programming</h3>
            <p>Master Java from basics to advanced OOP concepts</p>
          </div>
          <div className="preview-card">
            <img src="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400" alt="Python" />
            <h3>Python Development</h3>
            <p>Learn Python for web, data science, and automation</p>
          </div>
          <div className="preview-card">
            <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400" alt="ML" />
            <h3>Machine Learning</h3>
            <p>Build AI models with hands-on ML projects</p>
          </div>
        </div>
        <Link to="/courses" className="btn-view-all">View All Courses</Link>
      </section>
    </div>
  );
}
