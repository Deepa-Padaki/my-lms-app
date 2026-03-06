import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './CourseList.css';

const API_URL = 'https://backend-lms-setup.onrender.com/api';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/enrollments`);
      const enrolled = new Set(response.data.map(e => e.course_id));
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(courseId);
    try {
      await axios.post(`${API_URL}/enrollments`, { courseId });
      setEnrolledCourses(prev => new Set([...prev, courseId]));
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setEnrolling(null);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="course-list-container">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <h1>Explore Courses</h1>
        <p>Discover new skills and advance your career</p>
      </div>

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-thumbnail">
              <img src={course.thumbnail} alt={course.title} />
              <span className="course-category">{course.category}</span>
            </div>
            
            <div className="course-content">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-instructor">by {course.instructor_name}</p>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {course.total_lessons} lessons
                </span>
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatDuration(course.total_duration)}
                </span>
              </div>

              <div className="course-actions">
                <Link to={`/courses/${course.id}`} className="btn-view">
                  View Details
                </Link>
                
                {enrolledCourses.has(course.id) ? (
                  <Link to={`/learn/${course.id}`} className="btn-continue">
                    Continue Learning
                  </Link>
                ) : (
                  <button 
                    className="btn-enroll"
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                  >
                    {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
