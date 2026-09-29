
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './TeacherPrivateChat.css'

function TeacherPrivateChat() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')

    const teacherId = localStorage.getItem('userId')

    useEffect(() => {
        loadMessages()
    }, [id])

    async function loadMessages() {

        try {

            const response = await fetch(
                `http://localhost:5000/api/chats/${id}/messages`
            )

            const data = await response.json()

            if (response.ok) {
                setMessages(data)
                setError('')
            } else {
                setError(
                    data.message ||
                    'Unable to load messages.'
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


    async function handleSend(event) {

        event.preventDefault()

        if (!newMessage.trim()) {
            return
        }

        if (!teacherId) {
            setError('Teacher account not found. Please login again.')
            return
        }

        setSending(true)

        try {

            const response = await fetch(
                `http://localhost:5000/api/chats/${id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        senderId: teacherId,
                        message: newMessage
                    })
                }
            )

            const data = await response.json()

            if (response.ok) {

                setMessages((previousMessages) => [
                    ...previousMessages,
                    data
                ])

                setNewMessage('')

            } else {

                setError(
                    data.message ||
                    'Unable to send message.'
                )

            }

        } catch (error) {

            console.log(error)

            setError(
                'Unable to connect to the backend.'
            )

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
        <div className="teacher-private-chat-page">

            <header className="teacher-private-header">

                <div className="teacher-private-brand">

                    <div className="teacher-private-brand-icon">
                        SA
                    </div>

                    <div>
                        <h1>
                            Student Assistance
                        </h1>

                        <p>
                            Teacher Portal
                        </p>
                    </div>

                </div>

            </header>


            <nav className="teacher-private-nav">

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


            <main className="teacher-private-main">

                <div className="teacher-private-top">

                    <div>

                        <span className="teacher-private-label">
                            PRIVATE CONVERSATION
                        </span>

                        <h2>
                            Student Conversation
                        </h2>

                        <p>
                            Communicate privately with your student.
                        </p>

                    </div>

                    <Link
                        to="/teacher-chats"
                        className="teacher-private-back"
                    >
                        ← Back to Chats
                    </Link>

                </div>


                <section className="teacher-private-card">


                    <div className="student-chat-user">

                        <div className="student-avatar">
                            S
                        </div>

                        <div className="student-user-info">

                            <h3>
                                Student
                            </h3>

                            <div className="student-chat-status">
                                <span></span>
                                Private conversation
                            </div>

                        </div>

                        <div className="private-chat-badge">
                            🔒 Private
                        </div>

                    </div>


                    <div className="teacher-private-messages">

                        {loading && (

                            <div className="private-chat-loading">

                                <div className="private-loading-icon">
                                    💬
                                </div>

                                <h3>
                                    Loading conversation...
                                </h3>

                                <p>
                                    Please wait while the messages are loaded.
                                </p>

                            </div>

                        )}


                        {!loading &&
                            messages.length === 0 && (

                                <div className="private-chat-empty">

                                    <div className="private-empty-icon">
                                        💬
                                    </div>

                                    <h3>
                                        No messages yet
                                    </h3>

                                    <p>
                                        Start the conversation with your student.
                                    </p>

                                </div>

                            )}


                        {!loading &&
                            messages.length > 0 && (

                                <div className="private-messages-list">

                                    {messages.map((message) => {

                                        const isMine =
                                            Number(message.sender_id) ===
                                            Number(teacherId)

                                        return (

                                            <div
                                                key={message.id}
                                                className={
                                                    isMine
                                                        ? 'private-message-row mine'
                                                        : 'private-message-row'
                                                }
                                            >

                                                <div className="private-message-content">

                                                    <div className="private-message-bubble">

                                                        {!isMine && (
                                                            <div className="private-message-sender">
                                                                Student
                                                            </div>
                                                        )}

                                                        <div className="private-message-text">
                                                            {message.message}
                                                        </div>

                                                        <small className="private-message-time">
                                                            {message.created_at}
                                                        </small>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    })}

                                </div>

                            )}

                    </div>


                    {error && (

                        <div className="private-chat-error">
                            {error}
                        </div>

                    )}


                    <form
                        className="teacher-private-input-area"
                        onSubmit={handleSend}
                    >

                        <div className="private-input-wrapper">

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
                            className="private-send-button"
                            disabled={sending || !newMessage.trim()}
                        >

                            <span>
                                {sending ? 'Sending...' : 'Send'}
                            </span>

                            {!sending && (
                                <span className="private-send-icon">
                                    ➤
                                </span>
                            )}

                        </button>

                    </form>

                </section>

            </main>

        </div>
    )
}

export default TeacherPrivateChat

