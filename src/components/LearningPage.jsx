import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './LearningPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LearningPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [progressSummary, setProgressSummary] = useState({ percentage: 0, completed_lessons: 0, total_lessons: 0 });
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const iframeRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    checkEnrollmentAndLoad();
  }, [courseId, user]);

  const checkEnrollmentAndLoad = async () => {
    try {
      const enrollmentRes = await axios.get(`${API_URL}/enrollments/${courseId}`);
      if (!enrollmentRes.data.enrolled) {
        navigate(`/courses/${courseId}`);
        return;
      }
      setIsEnrolled(true);
      await loadCourseData();
    } catch (error) {
      console.error('Error:', error);
      navigate('/courses');
    }
  };

  const loadCourseData = async () => {
    try {
      const [courseRes, progressRes, summaryRes, lastWatchedRes] = await Promise.all([
        axios.get(`${API_URL}/courses/${courseId}`),
        axios.get(`${API_URL}/progress/${courseId}`),
        axios.get(`${API_URL}/progress/${courseId}/summary`),
        axios.get(`${API_URL}/progress/${courseId}/last-watched`)
      ]);

      setCourse(courseRes.data);
      
      const progressMap = {};
      progressRes.data.forEach(p => {
        progressMap[p.lesson_id] = p.status;
      });
      setProgress(progressMap);
      setProgressSummary(summaryRes.data);

      // Set current lesson - either last watched or first lesson
      if (lastWatchedRes.data) {
        setCurrentLesson(lastWatchedRes.data);
      } else {
        const firstLesson = courseRes.data.sections?.[0]?.lessons?.[0];
        if (firstLesson) {
          setCurrentLesson(firstLesson);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = async (lesson) => {
    setCurrentLesson(lesson);
    
    // Mark as in_progress if not completed
    if (progress[lesson.id] !== 'completed') {
      try {
        await axios.post(`${API_URL}/progress`, {
          courseId,
          lessonId: lesson.id,
          status: 'in_progress'
        });
        setProgress(prev => ({ ...prev, [lesson.id]: 'in_progress' }));
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;

    try {
      await axios.post(`${API_URL}/progress`, {
        courseId,
        lessonId: currentLesson.id,
        status: 'completed'
      });
      
      setProgress(prev => ({ ...prev, [currentLesson.id]: 'completed' }));
      
      // Update progress summary
      const summaryRes = await axios.get(`${API_URL}/progress/${courseId}/summary`);
      setProgressSummary(summaryRes.data);
      
      // Move to next lesson if available
      const nextLesson = getNextLesson();
      if (nextLesson) {
        setCurrentLesson(nextLesson);
      }
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };

  const getNextLesson = () => {
    if (!course || !currentLesson) return null;
    
    let foundCurrent = false;
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (foundCurrent) return lesson;
        if (lesson.id === currentLesson.id) foundCurrent = true;
      }
    }
    return null;
  };

  const getPreviousLesson = () => {
    if (!course || !currentLesson) return null;
    
    let prevLesson = null;
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.id === currentLesson.id) return prevLesson;
        prevLesson = lesson;
      }
    }
    return null;
  };

  const handleNext = () => {
    const next = getNextLesson();
    if (next) handleLessonClick(next);
  };

  const handlePrevious = () => {
    const prev = getPreviousLesson();
    if (prev) handleLessonClick(prev);
  };

  const isFirstLesson = () => !getPreviousLesson();
  const isLastLesson = () => !getNextLesson();

  const getLessonStatusIcon = (lessonId) => {
    const status = progress[lessonId];
    if (status === 'completed') {
      return (
        <svg className="status-icon completed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 11 15 16 9" />
        </svg>
      );
    } else if (status === 'in_progress') {
      return (
        <svg className="status-icon in-progress" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      );
    }
    return (
      <svg className="status-icon not-started" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="learning-page">
        <div className="loading">Loading course content...</div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="learning-page">
        <div className="error">Course not found</div>
      </div>
    );
  }

  return (
    <div className="learning-page">
      <div className="learning-header">
        <div className="learning-header-content">
          <h1>{course.title}</h1>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressSummary.percentage}%` }}
              />
            </div>
            <span className="progress-text">{progressSummary.percentage}% Complete</span>
          </div>
        </div>
      </div>

      <div className="learning-content">
        <div className="video-section">
          <div className="video-container">
            <iframe
              ref={iframeRef}
              src={currentLesson.youtube_url}
              title={currentLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="lesson-info">
            <h2>{currentLesson.title}</h2>
            <p className="lesson-section">
              {course.sections.find(s => s.lessons.some(l => l.id === currentLesson.id))?.title}
            </p>
          </div>

          <div className="lesson-navigation">
            <button 
              className="nav-btn prev"
              onClick={handlePrevious}
              disabled={isFirstLesson()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous Lesson
            </button>

            <button 
              className="mark-complete-btn"
              onClick={handleMarkComplete}
              disabled={progress[currentLesson.id] === 'completed'}
            >
              {progress[currentLesson.id] === 'completed' ? 'Completed' : 'Mark as Complete'}
            </button>

            <button 
              className="nav-btn next"
              onClick={handleNext}
              disabled={isLastLesson()}
            >
              Next Lesson
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="course-content-sidebar">
            <h3>Course Content</h3>
            <div className="content-stats">
              <span>{progressSummary.completed_lessons} / {progressSummary.total_lessons} lessons completed</span>
            </div>
            
            <div className="sections-list">
              {course.sections?.map((section, sectionIndex) => (
                <div key={section.id} className="sidebar-section-item">
                  <div className="sidebar-section-header">
                    <h4>Section {sectionIndex + 1}: {section.title}</h4>
                    <span>{section.lessons.length} lessons</span>
                  </div>
                  <div className="sidebar-lessons-list">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className={`sidebar-lesson ${currentLesson.id === lesson.id ? 'active' : ''} ${progress[lesson.id] === 'completed' ? 'completed' : ''}`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        {getLessonStatusIcon(lesson.id)}
                        <div className="lesson-info-small">
                          <span className="lesson-number">{lessonIndex + 1}</span>
                          <span className="lesson-title-small">{lesson.title}</span>
                        </div>
                        <span className="lesson-duration-small">{formatDuration(lesson.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
