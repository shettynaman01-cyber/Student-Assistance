
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './TeacherChat.css'

function TeacherChat() {
    const navigate = useNavigate()
    const { classroomId } = useParams()

    const [conversationId, setConversationId] = useState(null)
    const [teacherName, setTeacherName] = useState('')
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    const studentId = localStorage.getItem('userId')

    useEffect(() => {
        openTeacherChat()
    }, [classroomId])

    async function openTeacherChat() {
        if (!studentId) {
            setError('Student account not found. Please login again.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/chats/teacher/${classroomId}/${studentId}`
            )

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Unable to open teacher chat.')
                setLoading(false)
                return
            }

            setConversationId(data.conversationId)
            setTeacherName(data.teacherName)

            await loadMessages(data.conversationId)

        } catch (error) {
            console.log('Teacher chat error:', error)
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
        <div className="teacher-chat-page">

            <header className="teacher-chat-header">

                <div className="teacher-chat-brand">
                    <div className="teacher-chat-brand-icon">
                        SA
                    </div>

                    <div>
                        <h1>Student Assistance</h1>
                        <p>Private Teacher Conversation</p>
                    </div>
                </div>

            </header>


            <nav className="teacher-chat-nav">

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


            <main className="teacher-chat-main">

                <div className="teacher-chat-top">

                    <div>
                        <span className="teacher-chat-label">
                            PRIVATE CONVERSATION
                        </span>

                        <h2>Teacher Chat</h2>

                        <p>
                            Ask questions and communicate privately with your classroom teacher.
                        </p>
                    </div>

                    <Link
                        to="/doubts"
                        className="teacher-chat-back"
                    >
                        ← Back to Doubts
                    </Link>

                </div>


                {loading ? (

                    <section className="teacher-chat-card">

                        <div className="teacher-chat-loading">
                            <div className="chat-loading-icon">
                                💬
                            </div>

                            <h3>Opening your chat...</h3>

                            <p>
                                Connecting you with your classroom teacher.
                            </p>
                        </div>

                    </section>

                ) : error ? (

                    <section className="teacher-chat-card">

                        <div className="teacher-chat-error">

                            <div className="chat-error-icon">
                                ⚠️
                            </div>

                            <h3>Unable to open chat</h3>

                            <p>
                                {error}
                            </p>

                        </div>

                    </section>

                ) : (

                    <section className="teacher-chat-card">

                        <div className="teacher-chat-user">

                            <div className="teacher-avatar">
                                {teacherName
                                    ? teacherName.charAt(0).toUpperCase()
                                    : 'T'}
                            </div>

                            <div className="teacher-user-info">

                                <h3>
                                    {teacherName}
                                </h3>

                                <div className="teacher-online">
                                    <span></span>
                                    Classroom Teacher
                                </div>

                            </div>

                            <div className="private-badge">
                                🔒 Private
                            </div>

                        </div>


                        <div className="teacher-chat-messages">

                            {messages.length === 0 ? (

                                <div className="teacher-chat-empty">

                                    <div className="empty-chat-icon">
                                        💬
                                    </div>

                                    <h3>No messages yet</h3>

                                    <p>
                                        Start the conversation with your teacher.
                                    </p>

                                </div>

                            ) : (

                                <div className="messages-list">

                                    {messages.map((message) => {

                                        const isMine =
                                            String(message.sender_id) === String(studentId)

                                        return (
                                            <div
                                                key={message.id}
                                                className={
                                                    isMine
                                                        ? 'message-row mine'
                                                        : 'message-row'
                                                }
                                            >

                                                <div className="message-content">

                                                    <div className="message-bubble">

                                                        {!isMine && (
                                                            <div className="message-sender">
                                                                {message.sender_name}
                                                            </div>
                                                        )}

                                                        <div className="message-text">
                                                            {message.message}
                                                        </div>

                                                    </div>

                                                </div>

                                            </div>
                                        )
                                    })}

                                </div>

                            )}

                        </div>


                        <form
                            className="teacher-chat-input-area"
                            onSubmit={handleSendMessage}
                        >

                            <div className="message-input-wrapper">

                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(event) =>
                                        setNewMessage(event.target.value)
                                    }
                                    disabled={sending}
                                />

                            </div>

                            <button
                                type="submit"
                                className="send-message-button"
                                disabled={sending || !newMessage.trim()}
                            >
                                <span>
                                    {sending ? 'Sending...' : 'Send'}
                                </span>

                                {!sending && (
                                    <span className="send-icon">
                                        ➤
                                    </span>
                                )}
                            </button>

                        </form>

                    </section>

                )}

            </main>

        </div>
    )
}

export default TeacherChat

