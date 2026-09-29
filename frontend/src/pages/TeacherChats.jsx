
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function TeacherChats() {

    const navigate = useNavigate()

    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const teacherId = localStorage.getItem('userId')

    useEffect(() => {
        loadChats()
    }, [])

    async function loadChats() {

        if (!teacherId) {
            setError('Teacher account not found. Please login again.')
            setLoading(false)
            return
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/chats/teacher/${teacherId}`
            )

            const data = await response.json()

            console.log('Teacher ID:', teacherId)
            console.log('Teacher chats:', data)

            if (response.ok) {
                setChats(data)
                setError('')
            } else {
                setError(
                    data.message ||
                    'Unable to load teacher chats.'
                )
            }

        } catch (error) {

            console.log(
                'Teacher chats error:',
                error
            )

            setError(
                'Unable to connect to the backend.'
            )

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

                    <h1>
                        Student Assistance
                    </h1>

                    <p>
                        Chat privately with students from your classrooms.
                    </p>

                </div>

            </header>


            <nav className="dashboard-nav">

                <Link to="/teacher-dashboard">
                    Dashboard
                </Link>

                <Link to="/classrooms">
                    Classrooms
                </Link>

                <Link to="/teacher-assignments">
                    Assignments
                </Link>

                <Link
                    to="/teacher-chats"
                    className="active"
                >
                    Chats
                </Link>

                <Link to="/teacher-profile">
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
                            TEACHER CHATS
                        </p>

                        <h2>
                            Student Conversations
                        </h2>

                        <p>
                            Select a student to open a private conversation.
                        </p>

                    </div>

                </div>


                <section className="teacher-section">

                    <div className="teacher-section-header">

                        <h2>
                            Private Chats
                        </h2>

                        <p>
                            Students who have started a private chat with you
                            will appear here.
                        </p>

                    </div>


                    {loading && (

                        <div className="empty-state">

                            <h3>
                                Loading chats...
                            </h3>

                        </div>

                    )}


                    {!loading && error && (

                        <div className="empty-state">

                            <div className="empty-large-icon">
                                ⚠️
                            </div>

                            <h3>
                                Unable to load chats
                            </h3>

                            <p className="error-message">
                                {error}
                            </p>

                        </div>

                    )}


                    {!loading &&
                        !error &&
                        chats.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-large-icon">
                                    
                                </div>

                                <h3>
                                    No private chats yet
                                </h3>

                                <p>
                                    When a student starts a private conversation
                                    with you, it will appear here.
                                </p>

                            </div>

                        )}


                    {!loading &&
                        !error &&
                        chats.length > 0 && (

                            <div className="teacher-action-grid">

                                {chats.map((chat) => (

                                    <div
                                        className="teacher-action-card"
                                        key={chat.id}
                                    >

                                        <div className="action-icon">
                                            💬
                                        </div>


                                        <div>

                                            <h3>
                                                {chat.student_name}
                                            </h3>


                                            <p>
                                                <strong>
                                                    Classroom:
                                                </strong>{' '}

                                                {chat.classroom_name}
                                            </p>


                                            <p>
                                                <strong>
                                                    Last message:
                                                </strong>{' '}

                                                {chat.last_message ||
                                                    'No messages yet'}
                                            </p>


                                            <Link
                                                to={`/teacher-chats/${chat.id}`}
                                                className="teacher-primary-button"
                                            >
                                                Open Chat →
                                            </Link>

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

export default TeacherChats

