
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Classrooms.css'

function Classrooms() {
    const navigate = useNavigate()

    const [classrooms, setClassrooms] = useState([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(true)

    const teacherId = localStorage.getItem('userId')
    const teacherName = localStorage.getItem('userName') || 'Teacher'

    useEffect(() => {
        loadClassrooms()
    }, [])

    async function loadClassrooms() {
        if (!teacherId) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/classrooms/teacher/${teacherId}`
            )

            const data = await response.json()

            if (response.ok) {
                setClassrooms(data)
            } else {
                setMessage(data.message || 'Unable to load classrooms.')
                setMessageType('error')
            }
        } catch (error) {
            console.log('Error loading classrooms:', error)
            setMessage('Unable to connect to the backend.')
            setMessageType('error')
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateClassroom(event) {
        event.preventDefault()

        setMessage('')
        setMessageType('')

        if (!name.trim()) {
            setMessage('Please enter a classroom name.')
            setMessageType('error')
            return
        }

        if (!teacherId) {
            setMessage('Teacher account not found. Please login again.')
            setMessageType('error')
            return
        }

        const classroom = {
            name: name.trim(),
            description: description.trim(),
            teacherId: teacherId
        }

        try {
            const response = await fetch(
                'http://localhost:5000/api/classrooms',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(classroom)
                }
            )

            const data = await response.json()

            if (response.ok) {
                setMessage(
                    `Classroom created successfully! Code: ${data.classroomCode}`
                )

                setMessageType('success')

                setName('')
                setDescription('')
                setShowForm(false)

                await loadClassrooms()
            } else {
                setMessage(data.message || 'Unable to create classroom.')
                setMessageType('error')
            }
        } catch (error) {
            console.log('Classroom creation error:', error)
            setMessage('Unable to connect to the backend.')
            setMessageType('error')
        }
    }

    async function copyClassroomCode(code) {
        try {
            await navigator.clipboard.writeText(code)

            setMessage(`Classroom code ${code} copied successfully!`)
            setMessageType('success')
        } catch (error) {
            console.log('Copy failed:', error)
            setMessage('Unable to copy the classroom code.')
            setMessageType('error')
        }
    }

    function handleLogout() {
        localStorage.removeItem('loggedIn')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userRole')

        navigate('/login')
    }

    return (
        <div className="teacher-classrooms-page">

            {/* HEADER */}
            <header className="teacher-classrooms-header">

                <div className="teacher-brand">
                    <h1>Student Assistance</h1>
                    <p>Teacher Portal</p>
                </div>

                <div className="teacher-user">
                    <div className="teacher-user-info">
                        <strong>{teacherName}</strong>
                        <span>Teacher</span>
                    </div>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>

            </header>

            {/* NAVIGATION */}
            <nav className="teacher-classrooms-nav">

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

                <Link to="/teacher-chats">
                    Chats
                </Link>

                <Link to="/teacher-profile">
                    Profile
                </Link>

            </nav>

            {/* MAIN */}
            <main className="teacher-classrooms-main">

                {/* PAGE INTRO */}
                <section className="classrooms-intro">

                    <div>
                        <span className="classrooms-eyebrow">
                            CLASSROOM MANAGEMENT
                        </span>

                        <h2>My Classrooms</h2>

                        <p>
                            Create and manage your classrooms,
                            students, and classroom access.
                        </p>
                    </div>

                    <button
                        className="classrooms-create-button"
                        onClick={() => {
                            setShowForm(!showForm)
                            setMessage('')
                        }}
                    >
                        {showForm ? 'Cancel' : '+ Create Classroom'}
                    </button>

                </section>

                {/* MESSAGE */}
                {message && (
                    <div
                        className={
                            messageType === 'error'
                                ? 'classrooms-message classrooms-error'
                                : 'classrooms-message classrooms-success'
                        }
                    >
                        {message}
                    </div>
                )}

                {/* CREATE FORM */}
                {showForm && (
                    <section className="classrooms-form-card">

                        <div className="classrooms-section-heading">
                            <span>NEW CLASSROOM</span>

                            <h2>Create New Classroom</h2>

                            <p>
                                Add the basic information for your classroom.
                            </p>
                        </div>

                        <form onSubmit={handleCreateClassroom}>

                            <div className="classrooms-form-grid">

                                <div className="classrooms-form-group">
                                    <label>
                                        Classroom Name
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Example: BCA Web Development"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="classrooms-form-group">
                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        placeholder="Example: Full Stack Development class"
                                        value={description}
                                        onChange={(event) =>
                                            setDescription(event.target.value)
                                        }
                                        rows="4"
                                    />
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="classrooms-create-button"
                            >
                                Create Classroom
                            </button>

                        </form>

                    </section>
                )}

                {/* CLASSROOMS */}
                <section className="classrooms-section">

                    <div className="classrooms-section-heading">

                        <span>YOUR CLASSROOMS</span>

                        <h2>Created Classrooms</h2>

                        <p>
                            Manage the classrooms you have created.
                        </p>

                    </div>

                    {loading ? (

                        <div className="classrooms-empty-card">

                            <div className="classrooms-empty-icon">
                                ⌛
                            </div>

                            <h3>
                                Loading classrooms...
                            </h3>

                        </div>

                    ) : classrooms.length === 0 ? (

                        <div className="classrooms-empty-card">

                            <div className="classrooms-empty-icon">
                                🏫
                            </div>

                            <h3>
                                No classrooms yet
                            </h3>

                            <p>
                                Create your first classroom to start
                                teaching and managing students.
                            </p>

                            <button
                                className="classrooms-create-button"
                                onClick={() => setShowForm(true)}
                            >
                                + Create Your First Classroom
                            </button>

                        </div>

                    ) : (

                        <div className="classrooms-grid">

                            {classrooms.map((classroom) => (

                                <article
                                    className="classroom-card"
                                    key={classroom.id}
                                >

                                    {/* CARD HEADER */}
                                    <div className="classroom-card-header">

                                        <div className="classroom-icon">
                                            🏫
                                        </div>

                                        <span className="classroom-status">
                                            ACTIVE
                                        </span>

                                    </div>

                                    {/* CLASSROOM NAME */}
                                    <div className="classroom-title">

                                        <h3>
                                            {classroom.name}
                                        </h3>

                                        <p>
                                            {classroom.description ||
                                                'No description added.'}
                                        </p>

                                    </div>

                                    {/* DETAILS */}
                                    <div className="classroom-details">

                                        <div className="classroom-detail">

                                            <span>
                                                STUDENTS
                                            </span>

                                            <strong>
                                                —
                                            </strong>

                                        </div>

                                        <div className="classroom-detail">

                                            <span>
                                                CLASSROOM CODE
                                            </span>

                                            <strong>
                                                {classroom.classroom_code}
                                            </strong>

                                        </div>

                                    </div>

                                    {/* CODE AREA */}
                                    <div className="classroom-code-area">

                                        <div>

                                            <span>
                                                Share this code
                                            </span>

                                            <strong>
                                                {classroom.classroom_code}
                                            </strong>

                                        </div>

                                        <button
                                            onClick={() =>
                                                copyClassroomCode(
                                                    classroom.classroom_code
                                                )
                                            }
                                        >
                                            Copy
                                        </button>

                                    </div>

                                    {/* OPEN BUTTON */}
                                    <button
                                        className="classroom-open-button"
                                        onClick={() =>
                                            navigate(
                                                `/classrooms/${classroom.id}`
                                            )
                                        }
                                    >
                                        Open Classroom

                                        <span>
                                            →
                                        </span>
                                    </button>

                                </article>

                            ))}

                        </div>

                    )}

                </section>

                {/* INVITE STUDENTS */}
                {classrooms.length > 0 && (

                    <section className="classrooms-invite-card">

                        <div className="invite-icon">
                            👥
                        </div>

                        <div className="invite-content">

                            <span>
                                SHARE WITH STUDENTS
                            </span>

                            <h2>
                                Invite students to your classroom
                            </h2>

                            <p>
                                Copy a classroom code and share it with
                                your students. They can use the code to
                                join the classroom from their student account.
                            </p>

                        </div>

                    </section>

                )}

            </main>

        </div>
    )
}

export default Classrooms

