
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function StudentGroupChat() {
    const navigate = useNavigate()
    const { classroomId } = useParams()

    const [conversationId, setConversationId] = useState(null)
    const [classroomName, setClassroomName] = useState('')
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    const studentId = localStorage.getItem('userId')

    useEffect(() => {
        openStudentGroup()
    }, [classroomId])

    async function openStudentGroup() {
        if (!studentId) {
            setError('Student account not found. Please login again.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/chats/student-group/${classroomId}/${studentId}`
            )

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Unable to open student group.')
                setLoading(false)
                return
            }

            setConversationId(data.conversationId)
            setClassroomName(data.classroomName)

            await loadMessages(data.conversationId)

        } catch (error) {
            console.log('Student group error:', error)
            setError('Unable to connect to the backend.')
        } finally {
            setLoading(false)
        }
    }

    async function loadMessages(id) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/chats/${id}/messages`
            )

            const data = await response.json()

            if (response.ok) {
                setMessages(data)
            } else {
                setError(data.message || 'Unable to load messages.')
            }

        } catch (error) {
            console.log('Message loading error:', error)
            setError('Unable to load messages.')
        }
    }

    async function handleSendMessage(event) {
        event.preventDefault()

        if (!newMessage.trim()) {
            return
        }

        if (!conversationId || !studentId) {
            return
        }

        setSending(true)
        setError('')

        try {
            const response = await fetch(
                `http://localhost:5000/api/chats/${conversationId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        senderId: studentId,
                        message: newMessage.trim()
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Message could not be sent.')
                return
            }

            setNewMessage('')

            await loadMessages(conversationId)

        } catch (error) {
            console.log('Message sending error:', error)
            setError('Unable to send message.')
        } finally {
            setSending(false)
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
                    <p>Discuss questions with students in your classroom.</p>
                </div>
            </header>

            <nav className="dashboard-nav">

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/student-classrooms">
                    Classrooms
                </Link>

                <Link to="/doubts" className="active">
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

                <section className="deadlines-card">

                    <div className="section-header">

                        <div>
                            <p className="teacher-small-title">
                                STUDENT GROUP
                            </p>

                            <h2>Student Group</h2>

                            <p>
                                Discuss questions with students in this classroom.
                            </p>
                        </div>

                        <Link
                            to="/doubts"
                            className="add-button"
                        >
                            ← Back to Doubts
                        </Link>

                    </div>

                    {loading ? (

                        <div className="empty-state">
                            <h3>Opening student group...</h3>
                        </div>

                    ) : error ? (

                        <div className="empty-state">
                            <div className="empty-large-icon">
                                ⚠️
                            </div>

                            <h3>Unable to open group</h3>

                            <p className="error-message">
                                {error}
                            </p>
                        </div>

                    ) : (

                        <div
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                marginTop: '25px'
                            }}
                        >

                            <div
                                style={{
                                    padding: '18px',
                                    background: '#f8fafc',
                                    borderBottom: '1px solid #e5e7eb'
                                }}
                            >

                                <strong>
                                    👥 {classroomName} — Student Group
                                </strong>

                                <p
                                    style={{
                                        margin: '5px 0 0',
                                        color: '#6b7280'
                                    }}
                                >
                                    Group conversation for classroom students
                                </p>

                            </div>


                            <div
                                style={{
                                    minHeight: '350px',
                                    maxHeight: '450px',
                                    overflowY: 'auto',
                                    padding: '20px',
                                    background: '#ffffff'
                                }}
                            >

                                {messages.length === 0 ? (

                                    <div className="empty-state">

                                        <div className="empty-large-icon">
                                            👥
                                        </div>

                                        <h3>No messages yet</h3>

                                        <p>
                                            Start a discussion with your classmates.
                                        </p>

                                    </div>

                                ) : (

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}
                                    >

                                        {messages.map((message) => {

                                            const isMine =
                                                String(message.sender_id) === String(studentId)

                                            return (
                                                <div
                                                    key={message.id}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: isMine
                                                            ? 'flex-end'
                                                            : 'flex-start'
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            maxWidth: '70%',
                                                            padding: '10px 14px',
                                                            borderRadius: '12px',
                                                            background: isMine
                                                                ? '#2563eb'
                                                                : '#f1f5f9',
                                                            color: isMine
                                                                ? '#ffffff'
                                                                : '#1f2937'
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                fontSize: '12px',
                                                                marginBottom: '4px',
                                                                opacity: 0.75
                                                            }}
                                                        >
                                                            {message.sender_name}
                                                        </div>

                                                        <div>
                                                            {message.message}
                                                        </div>

                                                    </div>

                                                </div>
                                            )
                                        })}

                                    </div>

                                )}

                            </div>


                            <form
                                onSubmit={handleSendMessage}
                                style={{
                                    padding: '15px',
                                    borderTop: '1px solid #e5e7eb',
                                    display: 'flex',
                                    gap: '10px'
                                }}
                            >

                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(event) =>
                                        setNewMessage(event.target.value)
                                    }
                                    disabled={sending}
                                    style={{
                                        flex: 1
                                    }}
                                />

                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                >
                                    {sending ? 'Sending...' : 'Send'}
                                </button>

                            </form>

                        </div>

                    )}

                </section>

            </main>

        </div>
    )
}

export default StudentGroupChat

