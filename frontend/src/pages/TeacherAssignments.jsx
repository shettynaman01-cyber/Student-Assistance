
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './TeacherAssignments.css'

function TeacherAssignments() {
    const navigate = useNavigate()

    const [classrooms, setClassrooms] = useState([])
    const [selectedClassroom, setSelectedClassroom] = useState('')
    const [assignments, setAssignments] = useState([])
    const [loadingClassrooms, setLoadingClassrooms] = useState(true)
    const [loadingAssignments, setLoadingAssignments] = useState(false)
    const [message, setMessage] = useState('')

    const teacherId = localStorage.getItem('userId')

    const teacherName =
        localStorage.getItem('name') ||
        localStorage.getItem('userName') ||
        'Teacher'

    useEffect(() => {
        loadClassrooms()
    }, [])

    useEffect(() => {
        if (selectedClassroom) {
            loadAssignments(selectedClassroom)
        } else {
            setAssignments([])
        }
    }, [selectedClassroom])

    async function loadClassrooms() {
        if (!teacherId) {
            setLoadingClassrooms(false)
            return
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/classrooms/teacher/${teacherId}`
            )

            const data = await response.json()

            if (response.ok) {
                setClassrooms(data)

                if (data.length > 0) {
                    setSelectedClassroom(String(data[0].id))
                }
            } else {
                setMessage(
                    data.message || 'Unable to load classrooms.'
                )
            }
        } catch (error) {
            console.log('Error loading classrooms:', error)
            setMessage('Unable to connect to the backend.')
        } finally {
            setLoadingClassrooms(false)
        }
    }

    async function loadAssignments(classroomId) {
        setLoadingAssignments(true)
        setMessage('')

        try {
            const response = await fetch(
                `http://localhost:5000/api/classrooms/${classroomId}/assignments`
            )

            const data = await response.json()

            if (response.ok) {
                setAssignments(data)
            } else {
                setAssignments([])
                setMessage(
                    data.message || 'Unable to load assignments.'
                )
            }
        } catch (error) {
            console.log('Error loading assignments:', error)
            setAssignments([])
            setMessage('Unable to connect to the backend.')
        } finally {
            setLoadingAssignments(false)
        }
    }

    async function handleStatusChange(assignmentId, completed) {
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
                setAssignments((currentAssignments) =>
                    currentAssignments.map((assignment) =>
                        assignment.id === assignmentId
                            ? {
                                  ...assignment,
                                  completed: !completed
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
        if (!selectedClassroom) {
            navigate('/classrooms')
            return
        }

        navigate(
            `/assignments?classroomId=${selectedClassroom}`
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

    const selectedClassroomData = classrooms.find(
        (classroom) =>
            String(classroom.id) === String(selectedClassroom)
    )

    return (
        <div className="teacher-assignments-page">

            {/* HEADER */}

            <header className="teacher-assignments-header">

                <div className="teacher-assignments-brand">
                    <h1>Student Assistance</h1>
                    <p>Teacher Portal</p>
                </div>

                <div className="teacher-assignments-user">

                    <div>
                        <strong>{teacherName}</strong>
                        <span>Teacher</span>
                    </div>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                </div>

            </header>


            {/* NAVIGATION */}

            <nav className="teacher-assignments-nav">

                <Link to="/teacher-dashboard">
                    Dashboard
                </Link>

                <Link to="/classrooms">
                    Classrooms
                </Link>

                <Link
                    to="/teacher-assignments"
                    className="active"
                >
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

            <main className="teacher-assignments-main">

                {/* INTRO */}

                <section className="teacher-assignments-intro">

                    <div>
                        <span>ASSIGNMENT MANAGEMENT</span>

                        <h2>Classroom Assignments</h2>

                        <p>
                            Create and manage assignments for your
                            classrooms.
                        </p>
                    </div>

                    <button
                        className="teacher-add-assignment-button"
                        onClick={handleAddAssignment}
                    >
                        + Add Assignment
                    </button>

                </section>


                {/* CLASSROOM SELECTOR */}

                <section className="teacher-assignment-selector">

                    <div>
                        <span>SELECT CLASSROOM</span>

                        <h3>
                            Choose a classroom to manage its
                            assignments
                        </h3>
                    </div>

                    {loadingClassrooms ? (

                        <p>Loading classrooms...</p>

                    ) : classrooms.length === 0 ? (

                        <div className="teacher-no-classrooms">

                            <h3>No classrooms yet</h3>

                            <p>
                                Create a classroom first before
                                adding assignments.
                            </p>

                            <button
                                onClick={() =>
                                    navigate('/classrooms')
                                }
                            >
                                Go to Classrooms
                            </button>

                        </div>

                    ) : (

                        <select
                            value={selectedClassroom}
                            onChange={(event) =>
                                setSelectedClassroom(
                                    event.target.value
                                )
                            }
                        >

                            {classrooms.map((classroom) => (

                                <option
                                    key={classroom.id}
                                    value={classroom.id}
                                >
                                    {classroom.name}
                                </option>

                            ))}

                        </select>

                    )}

                </section>


                {/* MESSAGE */}

                {message && (
                    <div className="teacher-assignment-message">
                        {message}
                    </div>
                )}


                {/* SELECTED CLASSROOM */}

                {selectedClassroomData && (

                    <section className="teacher-selected-classroom">

                        <div>

                            <span>CLASSROOM</span>

                            <h2>
                                {selectedClassroomData.name}
                            </h2>

                            <p>
                                {selectedClassroomData.description ||
                                    'No description added.'}
                            </p>

                        </div>

                        <div className="teacher-classroom-code">

                            <span>CLASSROOM CODE</span>

                            <strong>
                                {selectedClassroomData.classroom_code}
                            </strong>

                        </div>

                    </section>

                )}


                {/* ASSIGNMENTS */}

                <section className="teacher-assignment-list">

                    <div className="teacher-assignment-list-heading">

                        <div>

                            <span>ASSIGNMENTS</span>

                            <h2>
                                Classroom Assignments
                            </h2>

                        </div>

                        <strong>
                            {assignments.length} assignment
                            {assignments.length !== 1 ? 's' : ''}
                        </strong>

                    </div>


                    {loadingAssignments ? (

                        <div className="teacher-assignment-empty">

                            <h3>
                                Loading assignments...
                            </h3>

                        </div>

                    ) : !selectedClassroom ? (

                        <div className="teacher-assignment-empty">

                            <h3>
                                Select a classroom
                            </h3>

                            <p>
                                Choose a classroom above to view
                                its assignments.
                            </p>

                        </div>

                    ) : assignments.length === 0 ? (

                        <div className="teacher-assignment-empty">

                            <div className="teacher-empty-icon">
                                📝
                            </div>

                            <h3>
                                No assignments yet
                            </h3>

                            <p>
                                Add an assignment for this classroom
                                to get started.
                            </p>

                            <button
                                onClick={handleAddAssignment}
                            >
                                + Add First Assignment
                            </button>

                        </div>

                    ) : (

                        <div className="teacher-assignment-cards">

                            {assignments.map((assignment) => {

                                const isCompleted =
                                    assignment.completed === true ||
                                    assignment.completed === 1

                                return (
                                    <article
                                        className="teacher-assignment-card"
                                        key={assignment.id}
                                    >

                                        <div className="teacher-assignment-card-top">

                                            <div>

                                                <span>
                                                    {assignment.subject ||
                                                        'General'}
                                                </span>

                                                <h3>
                                                    {assignment.title}
                                                </h3>

                                            </div>

                                            <strong
                                                className={`priority-${String(
                                                    assignment.priority ||
                                                        'Medium'
                                                ).toLowerCase()}`}
                                            >
                                                {assignment.priority ||
                                                    'Medium'}
                                            </strong>

                                        </div>


                                        <p>
                                            {assignment.description ||
                                                'No description added.'}
                                        </p>


                                        <div className="teacher-assignment-card-bottom">

                                            <span>
                                                Due:{' '}

                                                {assignment.due_date
                                                    ? new Date(
                                                          assignment.due_date
                                                      ).toLocaleDateString()
                                                    : 'No due date'}
                                            </span>

                                            <span>
                                                {isCompleted
                                                    ? 'Completed'
                                                    : 'Pending'}
                                            </span>

                                        </div>


                                        <button
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

                                    </article>
                                )
                            })}

                        </div>

                    )}

                </section>

            </main>

        </div>
    )
}

export default TeacherAssignments

