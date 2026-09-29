
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function StudentClassrooms() {

    const navigate = useNavigate()

    const [classrooms, setClassrooms] = useState([])
    const [classroomCode, setClassroomCode] = useState('')
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    const studentId = localStorage.getItem('userId')

    useEffect(() => {
        loadClassrooms()
    }, [])

    async function loadClassrooms() {

        if (!studentId) {
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
                setMessage(
                    data.message ||
                    'Unable to load classrooms.'
                )
                setMessageType('error')
            }

        } catch (error) {

            console.log(
                'Error loading classrooms:',
                error
            )

            setMessage(
                'Unable to connect to the backend.'
            )

            setMessageType('error')
        }
    }

    async function handleJoinClassroom(event) {

        event.preventDefault()

        setMessage('')
        setMessageType('')

        if (!classroomCode.trim()) {

            setMessage(
                'Please enter a classroom code.'
            )

            setMessageType('error')

            return
        }

        if (!studentId) {

            setMessage(
                'Student account not found. Please login again.'
            )

            setMessageType('error')

            return
        }

        try {

            const response = await fetch(
                'http://localhost:5000/api/classrooms/join',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        classroomCode:
                            classroomCode.trim(),
                        studentId: studentId
                    })
                }
            )

            const data = await response.json()

            if (response.ok) {

                setMessage(data.message)
                setMessageType('success')

                setClassroomCode('')

                await loadClassrooms()

            } else {

                setMessage(
                    data.message ||
                    'Unable to join classroom.'
                )

                setMessageType('error')
            }

        } catch (error) {

            console.log(error)

            setMessage(
                'Unable to connect to the backend.'
            )

            setMessageType('error')
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

                    <h1>
                        Student Assistance
                    </h1>

                    <p>
                        Join classrooms and access your
                        learning material.
                    </p>

                </div>

            </header>

            <nav className="dashboard-nav">

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

                <button onClick={handleLogout}>
                    Logout
                </button>

            </nav>

            <main className="dashboard-main">

                <div className="teacher-welcome">

                    <div>

                        <p className="teacher-small-title">
                            STUDENT CLASSROOMS
                        </p>

                        <h2>
                            My Classrooms
                        </h2>

                        <p>
                            Join and access the classrooms
                            shared by your teachers.
                        </p>

                    </div>

                </div>

                <section className="deadlines-card">

                    <div className="section-header">

                        <div>

                            <h2>
                                Join a Classroom
                            </h2>

                            <p>
                                Enter the classroom code
                                shared by your teacher.
                            </p>

                        </div>

                    </div>

                    <form onSubmit={handleJoinClassroom}>

                        <div className="form-group">

                            <label>
                                Classroom Code
                            </label>

                            <input
                                type="text"
                                placeholder="Example: CLS-ABC123"
                                value={classroomCode}
                                onChange={(event) =>
                                    setClassroomCode(
                                        event.target.value
                                    )
                                }
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            className="teacher-primary-button"
                        >
                            Join Classroom
                        </button>

                    </form>

                    {message && (

                        <p
                            className={
                                messageType === 'error'
                                    ? 'error-message'
                                    : 'success-message'
                            }
                        >
                            {message}
                        </p>

                    )}

                </section>

                <section className="teacher-section">

                    <div className="teacher-section-header">

                        <h2>
                            Joined Classrooms
                        </h2>

                        <p>
                            Click a classroom to open it.
                        </p>

                    </div>

                    {classrooms.length === 0 ? (

                        <div className="empty-state">

                            <h3>
                                No classrooms yet
                            </h3>

                            <p>
                                Enter a classroom code above
                                to join your first classroom.
                            </p>

                        </div>

                    ) : (

                        <div className="teacher-action-grid">

                            {classrooms.map((classroom) => (

                                <Link
                                    to={`/classrooms/${classroom.id}`}
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
                                                Classroom Code:
                                            </strong>{' '}
                                            {classroom.classroom_code}
                                        </p>

                                        <p>
                                            <strong>
                                                Teacher:
                                            </strong>{' '}
                                            {classroom.teacher_name}
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

            </main>

        </div>
    )
}

export default StudentClassrooms

