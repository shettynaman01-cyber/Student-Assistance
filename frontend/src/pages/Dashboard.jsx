
import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
const navigate = useNavigate()


const [assignments, setAssignments] = useState([])
const [classrooms, setClassrooms] = useState([])

const [selectedPdf, setSelectedPdf] = useState(null)
const [summary, setSummary] = useState('')
const [aiLoading, setAiLoading] = useState(false)
const [aiError, setAiError] = useState('')

useEffect(() => {
    const userId = localStorage.getItem('userId')

    if (!userId) {
        return
    }

    loadDashboardData(userId)
}, [])

async function loadDashboardData(userId) {
    try {
        const classroomResponse = await fetch(
            `http://localhost:5000/api/classrooms/student/${userId}`
        )

        const classroomData = await classroomResponse.json()

        if (!classroomResponse.ok || !Array.isArray(classroomData)) {
            return
        }

        setClassrooms(classroomData)

        const assignmentRequests = classroomData.map(
            (classroom) =>
                fetch(
                    `http://localhost:5000/api/classrooms/${classroom.id}/assignments`
                ).then((response) => {
                    if (!response.ok) {
                        return []
                    }

                    return response.json()
                })
        )

        const assignmentResults =
            await Promise.all(assignmentRequests)

        const allAssignments = assignmentResults.flat()

        setAssignments(allAssignments)

    } catch (error) {
        console.log('Error loading dashboard:', error)
    }
}

const totalAssignments = assignments.length

const completedAssignments = assignments.filter(
    (assignment) =>
        assignment.completed === true ||
        assignment.completed === 1
).length

const pendingAssignments =
    totalAssignments - completedAssignments

const today = new Date()
    .toISOString()
    .split('T')[0]

const overdueAssignments = assignments.filter(
    (assignment) =>
        !(
            assignment.completed === true ||
            assignment.completed === 1
        ) &&
        (assignment.due_date || assignment.dueDate) < today
).length

const upcomingAssignments = assignments
    .filter((assignment) => {
        const completed =
            assignment.completed === true ||
            assignment.completed === 1

        const dueDate =
            assignment.due_date ||
            assignment.dueDate

        return (
            !completed &&
            dueDate &&
            dueDate >= today
        )
    })
    .sort((a, b) => {
        const dateA =
            a.due_date || a.dueDate

        const dateB =
            b.due_date || b.dueDate

        return dateA.localeCompare(dateB)
    })
    .slice(0, 5)

function handleLogout() {
    localStorage.removeItem('loggedIn')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    localStorage.removeItem('name')

    navigate('/login')
}

function handlePdfChange(event) {
    const file = event.target.files[0]

    setAiError('')
    setSummary('')

    if (!file) {
        setSelectedPdf(null)
        return
    }

    if (file.type !== 'application/pdf') {
        setSelectedPdf(null)
        setAiError('Please select a PDF file.')
        return
    }

    if (file.size > 10 * 1024 * 1024) {
        setSelectedPdf(null)
        setAiError('PDF size must be 10MB or less.')
        return
    }

    setSelectedPdf(file)
}

async function handleSummarize() {
    if (!selectedPdf) {
        setAiError('Please select a PDF file first.')
        return
    }

    setAiLoading(true)
    setAiError('')
    setSummary('')

    try {
        const formData = new FormData()
        formData.append('pdf', selectedPdf)

        const response = await fetch(
            'http://localhost:5000/api/ai/test-pdf',
            {
                method: 'POST',
                body: formData
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                'PDF test failed.'
            )
        }

        setSummary(data.response)

    } catch (error) {
        console.log('AI PDF test error:', error)

        setAiError(
            error.message ||
            'PDF test failed. Please try again.'
        )
    } finally {
        setAiLoading(false)
    }
}

const studentName =
    localStorage.getItem('name') || 'Student'

return (
    <div className="student-dashboard">

        {/* HEADER */}

        <header className="student-header">

            <div className="student-brand">

                <div className="student-logo">
                    SA
                </div>

                <div>
                    <h1>
                        Student Assistance
                    </h1>

                    <p>
                        Student Portal
                    </p>
                </div>

            </div>

            <div className="student-header-user">

                <div className="student-avatar">
                    {studentName.charAt(0).toUpperCase()}
                </div>

                <div>
                    <strong>
                        {studentName}
                    </strong>

                    <span>
                        Student
                    </span>
                </div>

            </div>

        </header>


        {/* NAVIGATION */}

        <nav className="student-nav">

            <div className="student-nav-links">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>⌂</span>
                    Dashboard
                </NavLink>

                <NavLink
                    to="/student-classrooms"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>🏫</span>
                    Classrooms
                </NavLink>

                <NavLink
                    to="/doubts"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>💬</span>
                    Doubts
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>👤</span>
                    Profile
                </NavLink>

            </div>

            <button
                className="student-logout"
                onClick={handleLogout}
            >
                Logout
            </button>

        </nav>


        {/* MAIN */}

        <main className="student-main">

            {/* HERO */}

            <section className="student-hero">

                <div className="student-hero-content">

                    <span className="student-eyebrow">
                        STUDENT DASHBOARD
                    </span>

                    <h2>
                        Welcome back, {studentName}!
                    </h2>

                    <p>
                        Stay organized, keep up with your
                        assignments and stay connected with
                        your classrooms.
                    </p>

                    <div className="student-hero-buttons">

                        <Link
                            to="/student-classrooms"
                            className="student-primary-button"
                        >
                            Explore Classrooms
                            <span>→</span>
                        </Link>

                        <Link
                            to="/doubts"
                            className="student-secondary-button"
                        >
                            Ask a Doubt
                        </Link>

                    </div>

                </div>

                <div className="student-hero-decoration">

                    <div className="hero-circle hero-circle-one"></div>
                    <div className="hero-circle hero-circle-two"></div>

                    <div className="hero-floating-card">

                        <span>
                            📚
                        </span>

                        <div>
                            <strong>
                                Keep learning
                            </strong>

                            <small>
                                Your progress matters
                            </small>
                        </div>

                    </div>

                </div>

            </section>


            {/* AI STUDY ASSISTANT */}

            <section className="student-section ai-study-section">

                <div className="student-section-header">

                    <div>

                        <span className="student-section-label">
                            AI STUDY ASSISTANT
                        </span>

                        <h2>
                            Understand your study material
                        </h2>

                        <p>
                            Upload a PDF and get a simple,
                            student-friendly explanation powered by AI.
                        </p>

                    </div>

                </div>

                <div className="ai-study-card">

                    <div className="ai-study-upload">

                        <div className="ai-study-icon">
                            ✨
                        </div>

                        <div className="ai-study-content">

                            <h3>
                                Summarize a PDF
                            </h3>

                            <p>
                                Get a simple summary, important points,
                                key concepts, exam questions and quick revision.
                            </p>

                            <div className="ai-study-controls">

                                <label
                                    htmlFor="ai-pdf"
                                    className="ai-file-button"
                                >
                                    Choose PDF
                                </label>

                                <input
                                    id="ai-pdf"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handlePdfChange}
                                />

                                {selectedPdf && (
                                    <span className="ai-selected-file">
                                        {selectedPdf.name}
                                    </span>
                                )}

                            </div>

                            <button
                                className="ai-summarize-button"
                                onClick={handleSummarize}
                                disabled={!selectedPdf || aiLoading}
                            >
                                {aiLoading
                                    ? 'Testing PDF...'
                                    : 'Test PDF with AI'}
                            </button>

                            {aiError && (
                                <p className="ai-error">
                                    {aiError}
                                </p>
                            )}

                        </div>

                    </div>


                    {aiLoading && (

                        <div className="ai-loading">

                            <div className="ai-loading-spinner"></div>

                            <div>
                                <strong>
                                    AI is reading your PDF...
                                </strong>

                                <p>
                                    This may take a few moments.
                                </p>
                            </div>

                        </div>

                    )}


                    {summary && (

                        <div className="ai-summary">

                            <div className="ai-summary-header">

                                <span>
                                    ✨
                                </span>

                                <div>
                                    <strong>
                                        AI PDF Test Result
                                    </strong>

                                    <p>
                                        Temporary PDF test
                                    </p>
                                </div>

                            </div>

                            <div className="ai-summary-content">
                                {summary}
                            </div>

                        </div>

                    )}

                </div>

            </section>


            {/* STATISTICS */}

            <section className="student-stats">

                <div className="student-stat-card">

                    <div className="student-stat-icon">
                        📝
                    </div>

                    <div>
                        <span>
                            Total Assignments
                        </span>

                        <strong>
                            {totalAssignments}
                        </strong>
                    </div>

                </div>


                <div className="student-stat-card">

                    <div className="student-stat-icon">
                        ⏳
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingAssignments}
                        </strong>
                    </div>

                </div>


                <div className="student-stat-card">

                    <div className="student-stat-icon">
                        ✅
                    </div>

                    <div>
                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedAssignments}
                        </strong>
                    </div>

                </div>


                <div className="student-stat-card">

                    <div className="student-stat-icon">
                        🏫
                    </div>

                    <div>
                        <span>
                            Classrooms
                        </span>

                        <strong>
                            {classrooms.length}
                        </strong>
                    </div>

                </div>

            </section>


            {/* OVERDUE NOTICE */}

            {overdueAssignments > 0 && (

                <div className="student-alert">

                    <div className="student-alert-icon">
                        !
                    </div>

                    <div>

                        <strong>
                            You have {overdueAssignments} overdue
                            {overdueAssignments === 1
                                ? ' assignment'
                                : ' assignments'}
                        </strong>

                        <p>
                            Review your assignments and complete
                            the overdue work as soon as possible.
                        </p>

                    </div>

                    <Link to="/assignments">
                        View Assignments →
                    </Link>

                </div>

            )}


            {/* CLASSROOMS */}

            <section className="student-section">

                <div className="student-section-header">

                    <div>

                        <span className="student-section-label">
                            LEARNING SPACE
                        </span>

                        <h2>
                            Your Classrooms
                        </h2>

                        <p>
                            Access your classes and learning
                            resources.
                        </p>

                    </div>

                    <Link
                        to="/student-classrooms"
                        className="student-view-button"
                    >
                        View All →
                    </Link>

                </div>


                {classrooms.length === 0 ? (

                    <div className="student-empty">

                        <div className="student-empty-icon">
                            🏫
                        </div>

                        <h3>
                            No classrooms yet
                        </h3>

                        <p>
                            Join your first classroom using
                            the code provided by your teacher.
                        </p>

                        <Link
                            to="/student-classrooms"
                            className="student-primary-button"
                        >
                            + Join Classroom
                        </Link>

                    </div>

                ) : (

                    <div className="student-classroom-grid">

                        {classrooms.slice(0, 3).map(
                            (classroom) => (

                                <Link
                                    to={`/classrooms/${classroom.id}`}
                                    className="student-classroom-card"
                                    key={classroom.id}
                                >

                                    <div className="classroom-card-top">

                                        <div className="classroom-icon">
                                            🏫
                                        </div>

                                        <span className="classroom-arrow">
                                            ↗
                                        </span>

                                    </div>

                                    <h3>
                                        {classroom.name}
                                    </h3>

                                    <p>
                                        {classroom.description ||
                                            'Welcome to your classroom.'}
                                    </p>

                                    <div className="classroom-teacher">

                                        <div className="mini-avatar">
                                            {classroom.teacher_name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div>

                                            <span>
                                                Teacher
                                            </span>

                                            <strong>
                                                {classroom.teacher_name}
                                            </strong>

                                        </div>

                                    </div>

                                </Link>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* UPCOMING ASSIGNMENTS */}

            <section className="student-section">

                <div className="student-section-header">

                    <div>

                        <span className="student-section-label">
                            STAY ON TRACK
                        </span>

                        <h2>
                            Upcoming Deadlines
                        </h2>

                        <p>
                            Keep an eye on your next assignments.
                        </p>

                    </div>

                    <Link
                        to="/assignments"
                        className="student-view-button"
                    >
                        View All →
                    </Link>

                </div>


                {upcomingAssignments.length === 0 ? (

                    <div className="student-empty small">

                        <div className="student-empty-icon">
                            🎉
                        </div>

                        <h3>
                            You're all caught up!
                        </h3>

                        <p>
                            There are no upcoming assignments
                            right now.
                        </p>

                    </div>

                ) : (

                    <div className="student-deadline-list">

                        {upcomingAssignments.map(
                            (assignment, index) => (

                                <div
                                    className="student-deadline-item"
                                    key={assignment.id}
                                >

                                    <div className="deadline-number">
                                        {String(index + 1).padStart(2, '0')}
                                    </div>

                                    <div className="deadline-info">

                                        <h3>
                                            {assignment.title}
                                        </h3>

                                        <span>
                                            {assignment.subject ||
                                                'General'}
                                        </span>

                                    </div>

                                    <div className="deadline-date">

                                        <span>
                                            DUE DATE
                                        </span>

                                        <strong>
                                            {assignment.due_date ||
                                                assignment.dueDate}
                                        </strong>

                                    </div>

                                    <div className="deadline-arrow">
                                        →
                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* QUICK ACTIONS */}

            <section className="student-section">

                <div className="student-section-header">

                    <div>

                        <span className="student-section-label">
                            QUICK ACCESS
                        </span>

                        <h2>
                            What would you like to do?
                        </h2>

                    </div>

                </div>

                <div className="student-quick-grid">

                    <Link
                        to="/student-classrooms"
                        className="student-quick-card"
                    >

                        <span>
                            🏫
                        </span>

                        <div>

                            <h3>
                                My Classrooms
                            </h3>

                            <p>
                                Access your joined classrooms.
                            </p>

                        </div>

                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/doubts"
                        className="student-quick-card"
                    >

                        <span>
                            💬
                        </span>

                        <div>

                            <h3>
                                Ask a Doubt
                            </h3>

                            <p>
                                Talk to your teacher or classmates.
                            </p>

                        </div>

                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/profile"
                        className="student-quick-card"
                    >

                        <span>
                            👤
                        </span>

                        <div>

                            <h3>
                                My Profile
                            </h3>

                            <p>
                                View your student account.
                            </p>

                        </div>

                        <b>
                            →
                        </b>

                    </Link>

                </div>

            </section>

        </main>

    </div>
)

}


export default Dashboard

