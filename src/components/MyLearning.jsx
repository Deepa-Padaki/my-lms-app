import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './MyLearning.css';

const API_URL = 'https://lms-backend-33rj.onrender.com/api';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get(`${API_URL}/enrollments`);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="my-learning-container">
        <div className="loading">Loading your courses...</div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="my-learning-container">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2>No courses yet</h2>
          <p>You haven&apos;t enrolled in any courses yet. Start your learning journey today!</p>
          <Link to="/courses" className="btn-browse">Browse Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-learning-container">
      <div className="my-learning-header">
        <h1>My Learning</h1>
        <p>Continue where you left off</p>
      </div>

      <div className="enrollments-grid">
        {enrollments.map(enrollment => {
          const percentage = enrollment.total_lessons > 0
            ? Math.round((enrollment.completed_lessons / enrollment.total_lessons) * 100)
            : 0;

          return (
            <div key={enrollment.id} className="enrollment-card">
              <div className="enrollment-thumbnail">
                <img src={enrollment.thumbnail} alt={enrollment.course_title} />
                <span className="enrollment-category">{enrollment.category}</span>
              </div>
              
              <div className="enrollment-content">
                <h3>{enrollment.course_title}</h3>
                <p className="enrollment-date">Enrolled on {formatDate(enrollment.enrolled_at)}</p>
                
                <div className="progress-section">
                  <div className="progress-info">
                    <span className="progress-percentage">{percentage}% Complete</span>
                    <span className="progress-count">
                      {enrollment.completed_lessons} / {enrollment.total_lessons} lessons
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <Link 
                  to={`/learn/${enrollment.course_id}`} 
                  className="btn-continue"
                >
                  {percentage === 0 ? 'Start Course' : percentage === 100 ? 'Review Course' : 'Continue Learning'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
