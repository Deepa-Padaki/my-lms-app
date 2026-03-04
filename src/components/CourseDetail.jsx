import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './CourseDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
    if (user) {
      checkEnrollment();
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await axios.get(`${API_URL}/enrollments/${id}`);
      setIsEnrolled(response.data.enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await axios.post(`${API_URL}/enrollments`, { courseId: id });
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling:', error);
    } finally {
      setEnrolling(false);
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

  const totalLessons = course?.sections?.reduce((acc, section) => acc + section.lessons.length, 0) || 0;

  if (loading) {
    return (
      <div className="course-detail-container">
        <div className="loading">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-container">
        <div className="error">Course not found</div>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <div className="course-hero">
        <div className="course-hero-content">
          <div className="course-breadcrumb">
            <Link to="/courses">Courses</Link>
            <span>/</span>
            <span>{course.category}</span>
          </div>
          
          <h1 className="course-hero-title">{course.title}</h1>
          <p className="course-hero-description">{course.description}</p>
          
          <div className="course-hero-meta">
            <span className="meta-badge">{course.category}</span>
            <span className="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {course.instructor_name}
            </span>
            <span className="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {totalLessons} lessons
            </span>
            <span className="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatDuration(course.total_duration)}
            </span>
          </div>

          {isEnrolled ? (
            <Link to={`/learn/${course.id}`} className="btn-start-learning">
              Start Learning
            </Link>
          ) : (
            <button 
              className="btn-enroll-now"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}
        </div>
        
        <div className="course-hero-image">
          <img src={course.thumbnail} alt={course.title} />
        </div>
      </div>

      <div className="course-content-grid">
        <div className="course-main-content">
          <section className="content-section">
            <h2>What You Will Learn</h2>
            <ul className="learning-list">
              {course.what_you_will_learn?.map((item, index) => (
                <li key={index}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="content-section">
            <h2>Course Content</h2>
            <div className="course-curriculum">
              {course.sections?.map((section, sectionIndex) => (
                <div key={section.id} className="curriculum-section">
                  <div className="section-header">
                    <h3>Section {sectionIndex + 1}: {section.title}</h3>
                    <span>{section.lessons.length} lessons</span>
                  </div>
                  <div className="lessons-list">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="lesson-item">
                        <span className="lesson-number">{lessonIndex + 1}</span>
                        <span className="lesson-title">{lesson.title}</span>
                        <span className="lesson-duration">{formatDuration(lesson.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="course-sidebar">
          <div className="sidebar-card">
            <h3>Course Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Sections</span>
              <span className="stat-value">{course.sections?.length || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Lessons</span>
              <span className="stat-value">{totalLessons}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Duration</span>
              <span className="stat-value">{formatDuration(course.total_duration)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Category</span>
              <span className="stat-value">{course.category}</span>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Instructor</h3>
            <div className="instructor-info">
              <div className="instructor-avatar">
                {course.instructor_name?.charAt(0)}
              </div>
              <div className="instructor-details">
                <p className="instructor-name">{course.instructor_name}</p>
                <p className="instructor-role">Course Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
