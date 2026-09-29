
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function ClassroomAssignments() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [classroom, setClassroom] = useState(null)
    const [assignments, setAssignments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const role = localStorage.getItem('role')
    const teacherId = localStorage.getItem('userId')

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

            console.log(
                'Error loading classroom:',
                error
            )

            setError(
                'Unable to connect to the backend.'
            )
        }
    }

    async function loadAssignments() {

        try {

            const response = await fetch(
                `http://localhost:5000/api/classrooms/${id}/assignments`
            )

            const data = await response.json()

            if (response.ok) {

                setAssignments(
                    Array.isArray(data) ? data : []
                )

            } else {

                setError(
                    data.message ||
                    'Unable to load assignments.'
                )
            }

        } catch (error) {

            console.log(
                'Error loading assignments:',
                error
            )

            setError(
                'Unable to connect to the backend.'
            )

        } finally {

            setLoading(false)

        }
    }

    async function handleStatusChange(
        assignmentId,
        completed
    ) {

        try {

            const response = await fetch(
                `http://localhost:5000/api/assignments/${assignmentId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        completed: !completed
                    })
                }
            )

            const data = await response.json()

            if (response.ok) {

                setAssignments(
                    (currentAssignments) =>
                        currentAssignments.map(
                            (assignment) =>
                                assignment.id === assignmentId
                                    ? {
                                          ...assignment,
                                          completed:
                                              !completed
                                      }
                                    : assignment
                        )
                )

                setMessage(
                    !completed
                        ? 'Assignment marked as completed.'
                        : 'Assignment marked as pending.'
                )

            } else {

                setMessage(
                    data.message ||
                    'Assignment status could not be updated.'
                )
            }

        } catch (error) {

            console.log(
                'Error updating assignment status:',
                error
            )

            setMessage(
                'Unable to connect to the backend.'
            )
        }
    }

    function handleAddAssignment() {

        if (!teacherId) {
            navigate('/login')
            return
        }

        navigate(
            `/assignments?classroomId=${id}`
        )
    }

    function handleLogout() {

        localStorage.removeItem('loggedIn')
        localStorage.removeItem('userId')
        localStorage.removeItem('role')
        localStorage.removeItem('name')
        localStorage.removeItem('userName')
        localStorage.removeItem('userRole')

        navigate('/login')
    }

    if (loading) {

        return (
            <div className="dashboard-container">

                <main className="dashboard-main">

                    <h2>
                        Loading assignments...
                    </h2>

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
                        Classroom assignments
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

                        <Link to="/teacher-assignments">
                            Assignments
                        </Link>

                        <Link to="/teacher-profile">
                            Profile
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

                        <Link to="/profile">
                            Profile
                        </Link>
                    </>

                )}

                <button onClick={handleLogout}>
                    Logout
                </button>

            </nav>

            <main className="dashboard-main">

                {classroom && (

                    <div className="teacher-welcome">

                        <div>

                            <p className="teacher-small-title">
                                CLASSROOM ASSIGNMENTS
                            </p>

                            <h2>
                                {classroom.name}
                            </h2>

                            <p>
                                {classroom.description ||
                                    'Assignments shared by your teacher.'}
                            </p>

                        </div>

                    </div>

                )}

                {error && (

                    <p className="error-message">
                        {error}
                    </p>

                )}

                {message && (

                    <p className="success-message">
                        {message}
                    </p>

                )}

                <section className="teacher-section">

                    <div className="teacher-section-header">

                        <div>

                            <h2>
                                Assignments
                            </h2>

                            <p>
                                Assignments shared with this classroom.
                            </p>

                        </div>

                        {role === 'teacher' && (

                            <button
                                className="teacher-primary-button"
                                onClick={handleAddAssignment}
                            >
                                + Add Assignment
                            </button>

                        )}

                    </div>

                    {assignments.length === 0 ? (

                        <div className="empty-state">

                            <h3>
                                No assignments yet
                            </h3>

                            <p>
                                {role === 'teacher'
                                    ? 'Add an assignment to this classroom to get started.'
                                    : 'Your teacher has not added any assignments to this classroom yet.'
                                }
                            </p>

                            {role === 'teacher' && (

                                <button
                                    className="teacher-primary-button"
                                    onClick={handleAddAssignment}
                                >
                                    + Add First Assignment
                                </button>

                            )}

                        </div>

                    ) : (

                        <div className="teacher-action-grid">

                            {assignments.map(
                                (assignment) => {

                                    const isCompleted =
                                        assignment.completed === true ||
                                        assignment.completed === 1

                                    return (

                                        <div
                                            className="teacher-action-card"
                                            key={assignment.id}
                                        >

                                            <div className="action-icon">
                                                📝
                                            </div>

                                            <div>

                                                <h3>
                                                    {assignment.title}
                                                </h3>

                                                <p>
                                                    <strong>
                                                        Subject:
                                                    </strong>{' '}
                                                    {assignment.subject ||
                                                        'Not specified'}
                                                </p>

                                                <p>
                                                    <strong>
                                                        Due Date:
                                                    </strong>{' '}
                                                    {assignment.due_date ||
                                                        'Not specified'}
                                                </p>

                                                <p>
                                                    <strong>
                                                        Priority:
                                                    </strong>{' '}
                                                    {assignment.priority ||
                                                        'Medium'}
                                                </p>

                                                {assignment.description && (

                                                    <p>
                                                        {assignment.description}
                                                    </p>

                                                )}

                                                <p>

                                                    <strong>
                                                        Status:
                                                    </strong>{' '}

                                                    {isCompleted
                                                        ? 'Completed'
                                                        : 'Pending'}

                                                </p>

                                                {role === 'teacher' && (

                                                    <button
                                                        className="teacher-primary-button"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                assignment.id,
                                                                isCompleted
                                                            )
                                                        }
                                                    >
                                                        {isCompleted
                                                            ? 'Mark Pending'
                                                            : 'Mark Completed'}
                                                    </button>

                                                )}

                                                {role !== 'teacher' && (

                                                    <Link
                                                        to={`/assignments/${assignment.id}`}
                                                        className="teacher-primary-button"
                                                    >
                                                        View Assignment →
                                                    </Link>

                                                )}

                                            </div>

                                        </div>

                                    )
                                }
                            )}

                        </div>

                    )}

                </section>

                <Link
                    to={`/classrooms/${id}`}
                    className="teacher-primary-button"
                >
                    ← Back to Classroom
                </Link>

            </main>

        </div>
    )
}

export default ClassroomAssignments

