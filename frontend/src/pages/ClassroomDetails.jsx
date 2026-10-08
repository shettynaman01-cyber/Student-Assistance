
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function ClassroomDetails() {
    const { id } = useParams()

    const [classroom, setClassroom] = useState(null)
    const [assignments, setAssignments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('userId')

    useEffect(() => {
        loadClassroom()
        loadAssignments()
    }, [id])

    async function loadClassroom() {
        try {
            const response = await fetch(
                `http://localhost:5000/api/classrooms/${id}`
            )

            const data = await response.json()

            if (response.ok) {
                setClassroom(data)
            } else {
                setError(
                    data.message ||
                    'Unable to load classroom.'
                )
            }
        } catch (error) {
            console.log(error)
            setError(
                'Unable to connect to the backend.'
            )
        } finally {
            setLoading(false)
        }
    }

    async function loadAssignments() {
        try {
            const response = await fetch(
                `http://localhost:5000/api/classrooms/${id}/assignments`
            )

            const data = await response.json()

            if (response.ok && Array.isArray(data)) {
                setAssignments(data)
            }
        } catch (error) {
            console.log(
                'Error loading assignments:',
                error
            )
        }
    }

    // ================================
    // DELETE CLASSROOM
    // ================================

    async function deleteClassroom() {

        const confirmed = window.confirm(
            'Are you sure you want to delete this classroom? This will remove the classroom and its classroom data.'
        )

        if (!confirmed) {
            return
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/classrooms/${id}`,
                {
                    method: 'DELETE',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        teacherId: userId
                    })
                }
            )

            const data =
                await response.json()

            if (!response.ok) {

                alert(
                    data.message ||
                    'Unable to delete classroom.'
                )

                return
            }

            alert(
                'Classroom deleted successfully.'
            )

            window.location.href =
                '/classrooms'

        } catch (error) {

            console.log(
                'Delete classroom error:',
                error
            )

            alert(
                'Unable to connect to the backend.'
            )
        }
    }

    // ================================
    // LEAVE CLASSROOM
    // ================================

    async function leaveClassroom() {

        const confirmed = window.confirm(
            'Are you sure you want to leave this classroom?'
        )

        if (!confirmed) {
            return
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/classrooms/${id}/leave`,
                {
                    method: 'DELETE',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        studentId: userId
                    })
                }
            )

            const data =
                await response.json()

            if (!response.ok) {

                alert(
                    data.message ||
                    'Unable to leave classroom.'
                )

                return
            }

            alert(
                'You have left the classroom successfully.'
            )

            window.location.href =
                '/student-classrooms'

        } catch (error) {

            console.log(
                'Leave classroom error:',
                error
            )

            alert(
                'Unable to connect to the backend.'
            )
        }
    }

    if (loading) {
        return (
            <div className="dashboard-container">

                <main className="dashboard-main">

                    <h2>
                        Loading classroom...
                    </h2>

                </main>

            </div>
        )
    }

    if (error) {
        return (
            <div className="dashboard-container">

                <main className="dashboard-main">

                    <h2>
                        Unable to load classroom
                    </h2>

                    <p className="error-message">
                        {error}
                    </p>

                    <Link
                        to={
                            role === 'teacher'
                                ? '/classrooms'
                                : '/student-classrooms'
                        }
                        className="teacher-primary-button"
                    >
                        Back to Classrooms
                    </Link>

                </main>

            </div>
        )
    }

    return (
        <div className="dashboard-container">

            <header className="dashboard-header">

                <div>

                    <h1>
                        Student Assistance
                    </h1>

                    <p>
                        Classroom learning space
                    </p>

                </div>

            </header>

            <nav className="dashboard-nav">

                {role === 'teacher' ? (

                    <>
                        <Link to="/teacher-dashboard">
                            Dashboard
                        </Link>

                        <Link
                            to="/classrooms"
                            className="active"
                        >
                            Classrooms
                        </Link>

                        <Link to="/assignments">
                            Assignments
                        </Link>
                    </>

                ) : (

                    <>
                        <Link to="/dashboard">
                            Dashboard
                        </Link>

                        <Link
                            to="/student-classrooms"
                            className="active"
                        >
                            Classrooms
                        </Link>

                        <Link to="/doubts">
                            Doubts
                        </Link>
                    </>

                )}

                <Link to="/profile">
                    Profile
                </Link>

                <button
                    onClick={() => {
                        localStorage.clear()
                        window.location.href = '/login'
                    }}
                >
                    Logout
                </button>

            </nav>

            <main className="dashboard-main">

                <div className="teacher-welcome">

                    <div>

                        <p className="teacher-small-title">
                            CLASSROOM
                        </p>

                        <h2>
                            {classroom.name}
                        </h2>

                        <p>
                            {classroom.description ||
                                'Welcome to your classroom.'}
                        </p>

                    </div>

                </div>

                <div className="teacher-stats">

                    <div className="teacher-stat-card">

                        <div className="teacher-stat-icon">
                            👨‍🏫
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

                    <div className="teacher-stat-card">

                        <div className="teacher-stat-icon">
                            👥
                        </div>

                        <div>

                            <span>
                                Students Joined
                            </span>

                            <strong>
                                {classroom.student_count}
                            </strong>

                        </div>

                    </div>

                    <div className="teacher-stat-card">

                        <div className="teacher-stat-icon">
                            🔑
                        </div>

                        <div>

                            <span>
                                Classroom Code
                            </span>

                            <strong>
                                {classroom.classroom_code}
                            </strong>

                        </div>

                    </div>

                    <div className="teacher-stat-card">

                        <div className="teacher-stat-icon">
                            📝
                        </div>

                        <div>

                            <span>
                                Assignments
                            </span>

                            <strong>
                                {assignments.length}
                            </strong>

                        </div>

                    </div>

                </div>

                <section className="teacher-section">

                    <div className="teacher-section-header">

                        <div>

                            <h2>
                                Assignments
                            </h2>

                            <p>
                                Assignments shared in this classroom.
                            </p>

                        </div>

                        {role === 'teacher' && (

                            <Link
                                to={`/classrooms/${id}/assignments`}
                                className="teacher-primary-button"
                            >
                                + Create Assignment
                            </Link>

                        )}

                    </div>

                    {assignments.length === 0 ? (

                        <div className="empty-state">

                            <h3>
                                No assignments yet
                            </h3>

                            <p>
                                {role === 'teacher'
                                    ? 'Create an assignment to post it in this classroom.'
                                    : 'Your teacher has not added any assignments to this classroom yet.'
                                }
                            </p>

                        </div>

                    ) : (

                        <div className="teacher-action-grid">

                            {assignments.map((assignment) => (

                                <Link
                                    key={assignment.id}
                                    to={`/assignments/${assignment.id}`}
                                    className="teacher-action-card"
                                >

                                    <div className="action-icon">
                                        📝
                                    </div>

                                    <div>

                                        <h3>
                                            {assignment.title}
                                        </h3>

                                        <p>
                                            {assignment.subject}
                                        </p>

                                        <p>
                                            <strong>
                                                Due Date:
                                            </strong>{' '}
                                            {assignment.due_date}
                                        </p>

                                        <p>
                                            <strong>
                                                Priority:
                                            </strong>{' '}
                                            {assignment.priority}
                                        </p>

                                    </div>

                                    <span className="action-arrow">
                                        →
                                    </span>

                                </Link>

                            ))}

                        </div>

                    )}

                </section>

                <section className="teacher-section">

                    <div className="teacher-section-header">

                        <h2>
                            Classroom Resources
                        </h2>

                        <p>
                            Access other learning resources.
                        </p>

                    </div>

                    <div className="teacher-action-grid">

                        <div className="teacher-action-card">

                            <div className="action-icon">
                                📄
                            </div>

                            <div>

                                <h3>
                                    Notes & PDFs
                                </h3>

                                <p>
                                    Access notes, PDFs and study
                                    material shared by the teacher.
                                </p>

                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </div>

                        <div className="teacher-action-card">

                            <div className="action-icon">
                                🤖
                            </div>

                            <div>

                                <h3>
                                    AI Study Assistant
                                </h3>

                                <p>
                                    Use AI to summarize notes,
                                    find important points and
                                    prepare for exams.
                                </p>

                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </div>

                    </div>

                </section>

                {/* ================================
                    CLASSROOM ACTION
                ================================ */}

                <div
                    style={{
                        marginTop: '30px',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}
                >

                    {role === 'teacher' ? (

                        <button
                            onClick={deleteClassroom}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                borderRadius: '8px',
                                background: '#dc2626',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}
                        >
                            🗑️ Delete Classroom
                        </button>

                    ) : (

                        <button
                            onClick={leaveClassroom}
                            style={{
                                padding: '12px 20px',
                                border: 'none',
                                borderRadius: '8px',
                                background: '#dc2626',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}
                        >
                            🚪 Leave Classroom
                        </button>

                    )}

                </div>

                <Link
                    to={
                        role === 'teacher'
                            ? '/classrooms'
                            : '/student-classrooms'
                    }
                    className="teacher-primary-button"
                >
                    ← Back to Classrooms
                </Link>

            </main>

        </div>
    )
}

export default ClassroomDetails

