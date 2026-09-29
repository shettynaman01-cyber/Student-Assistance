
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Doubts() {
    const navigate = useNavigate()

    const [classrooms, setClassrooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const studentId = localStorage.getItem('userId')

    useEffect(() => {
        loadClassrooms()
    }, [])

    async function loadClassrooms() {
        if (!studentId) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/classrooms/student/${studentId}`
            )

            const data = await response.json()

            if (response.ok) {
                setClassrooms(data)
            } else {
                setError(data.message || 'Unable to load classrooms.')
            }
        } catch (error) {
            console.log('Error loading classrooms:', error)
            setError('Unable to connect to the backend.')
        } finally {
            setLoading(false)
        }
    }

    function handleLogout() {
        localStorage.removeItem('loggedIn')
        localStorage.removeItem('userId')
        localStorage.removeItem('role')
        localStorage.removeItem('name')

        navigate('/login')
    }

    return (
        <div className="dashboard-container">

            <header className="dashboard-header">
                <div>
                    <h1>Student Assistance</h1>

                    <p>
                        Ask questions and discuss with your teachers
                        and classmates.
                    </p>
                </div>
            </header>

            <nav className="dashboard-nav">

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/student-classrooms">
                    Classrooms
                </Link>

                <Link
                    to="/doubts"
                    className="active"
                >
                    Doubts
                </Link>

                <Link to="/profile">
                    Profile
                </Link>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </nav>

            <main className="dashboard-main">

                <div className="teacher-welcome">

                    <div>
                        <p className="teacher-small-title">
                            STUDENT DOUBTS
                        </p>

                        <h2>Doubts</h2>

                        <p>
                            Choose a classroom to chat privately
                            with your teacher or discuss questions
                            with your classmates.
                        </p>
                    </div>

                </div>

                <section className="teacher-section">

                    <div className="teacher-section-header">

                        <h2>My Classrooms</h2>

                        <p>
                            Select a classroom to access its
                            conversations.
                        </p>

                    </div>

                    {loading ? (

                        <div className="empty-state">
                            <h3>Loading classrooms...</h3>
                        </div>

                    ) : error ? (

                        <div className="empty-state">
                            <h3>Unable to load classrooms</h3>

                            <p className="error-message">
                                {error}
                            </p>
                        </div>

                    ) : classrooms.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-large-icon">
                                🏫
                            </div>

                            <h3>No classrooms yet</h3>

                            <p>
                                Join a classroom first to use
                                the Doubts section.
                            </p>

                            <Link
                                to="/student-classrooms"
                                className="teacher-primary-button"
                            >
                                Join a Classroom
                            </Link>

                        </div>

                    ) : (

                        <div className="teacher-action-grid">

                            {classrooms.map((classroom) => (

                                <div
                                    className="teacher-action-card"
                                    key={classroom.id}
                                >

                                    <div className="action-icon">
                                        🏫
                                    </div>

                                    <div>

                                        <h3>
                                            {classroom.name}
                                        </h3>

                                        <p>
                                            {classroom.description ||
                                                'No description added.'}
                                        </p>

                                        <p>
                                            <strong>
                                                Teacher:
                                            </strong>{' '}
                                            {classroom.teacher_name}
                                        </p>

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '10px',
                                                marginTop: '15px',
                                                flexWrap: 'wrap'
                                            }}
                                        >

                                            <Link
                                                to={`/doubts/${classroom.id}/teacher`}
                                                className="teacher-primary-button"
                                            >
                                                👨‍🏫 Teacher Chat
                                            </Link>

                                            <Link
                                                to={`/doubts/${classroom.id}/students`}
                                                className="teacher-primary-button"
                                            >
                                                👥 Student Group
                                            </Link>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    )
}

export default Doubts

