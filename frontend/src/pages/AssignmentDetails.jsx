
import './AssignmentDetails.css'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function AssignmentDetails() {

    const { id } = useParams()

    const [assignment, setAssignment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [selectedFile, setSelectedFile] = useState(null)
    const [submission, setSubmission] = useState(null)
    const [submissionLoading, setSubmissionLoading] = useState(false)
    const [submissionMessage, setSubmissionMessage] = useState('')
    const [submissionError, setSubmissionError] = useState('')

    const role = localStorage.getItem('role')
    const studentId = localStorage.getItem('userId')

    useEffect(() => {
        loadAssignment()
    }, [id])

    useEffect(() => {
        if (role === 'student' && studentId) {
            loadSubmission()
        }
    }, [id, role, studentId])

    async function loadAssignment() {
        try {
            const response = await fetch(
                `http://localhost:5000/api/assignments/${id}`
            )

            const data = await response.json()

            if (response.ok) {
                setAssignment(data)
            } else {
                setError(
                    data.message ||
                    'Unable to load assignment.'
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

    async function loadSubmission() {
        try {
            const response = await fetch(
                `http://localhost:5000/api/assignments/${id}/submission/${studentId}`
            )

            const data = await response.json()

            if (response.ok && data.submitted) {
                setSubmission(data.submission)
            } else {
                setSubmission(null)
            }

        } catch (error) {
            console.log(
                'Submission loading failed:',
                error
            )
        }
    }

    function handleFileChange(event) {
        const file = event.target.files[0]

        setSubmissionMessage('')
        setSubmissionError('')

        if (!file) {
            setSelectedFile(null)
            return
        }

        if (file.type !== 'application/pdf') {
            setSelectedFile(null)

            setSubmissionError(
                'Only PDF files are allowed.'
            )

            event.target.value = ''

            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setSelectedFile(null)

            setSubmissionError(
                'PDF file must be 10 MB or smaller.'
            )

            event.target.value = ''

            return
        }

        setSelectedFile(file)
    }

    async function handleSubmission(event) {
        event.preventDefault()

        setSubmissionMessage('')
        setSubmissionError('')

        if (!selectedFile) {
            setSubmissionError(
                'Please select a PDF file first.'
            )

            return
        }

        if (!studentId) {
            setSubmissionError(
                'Student account information was not found.'
            )

            return
        }

        setSubmissionLoading(true)

        try {
            const formData = new FormData()

            formData.append(
                'submission',
                selectedFile
            )

            formData.append(
                'studentId',
                studentId
            )

            const response = await fetch(
                `http://localhost:5000/api/assignments/${id}/submission`,
                {
                    method: 'POST',
                    body: formData
                }
            )

            const data = await response.json()

            if (response.ok) {
                setSubmissionMessage(
                    data.message ||
                    'Assignment submitted successfully!'
                )

                setSubmission({
                    id: data.submissionId,
                    assignment_id: id,
                    student_id: studentId,
                    file_name: data.fileName,
                    file_path: data.filePath
                })

                setSelectedFile(null)

                const fileInput =
                    document.getElementById(
                        'assignment-pdf'
                    )

                if (fileInput) {
                    fileInput.value = ''
                }

            } else {
                setSubmissionError(
                    data.message ||
                    'Assignment submission failed.'
                )
            }

        } catch (error) {
            console.log(error)

            setSubmissionError(
                'Unable to connect to the backend.'
            )

        } finally {
            setSubmissionLoading(false)
        }
    }

    function getBackPath() {
        if (role === 'teacher') {
            return '/classrooms'
        }

        return '/student-classrooms'
    }

    if (loading) {
        return (
            <div className="dashboard-container">

                <main className="dashboard-main">

                    <h2>
                        Loading assignment...
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
                        Unable to load assignment
                    </h2>

                    <p className="error-message">
                        {error}
                    </p>

                    <Link
                        to={getBackPath()}
                        className="teacher-primary-button"
                    >
                        ← Back to Classrooms
                    </Link>

                </main>

            </div>
        )
    }

    if (!assignment) {
        return (
            <div className="dashboard-container">

                <main className="dashboard-main">

                    <h2>
                        Assignment not found
                    </h2>

                    <Link
                        to={getBackPath()}
                        className="teacher-primary-button"
                    >
                        ← Back to Classrooms
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
                        Assignment Details
                    </p>

                </div>

            </header>

            <nav className="dashboard-nav">

                {role === 'teacher' ? (

                    <>
                        <Link to="/teacher-dashboard">
                            Dashboard
                        </Link>

                        <Link to="/classrooms">
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

                        <Link to="/student-classrooms">
                            Classrooms
                        </Link>

                        <Link to="/assignments">
                            Assignments
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
                            ASSIGNMENT
                        </p>

                        <h2>
                            {assignment.title}
                        </h2>

                        <p>
                            View the complete assignment
                            information below.
                        </p>

                    </div>

                </div>

                <section className="deadlines-card">

                    <div className="section-header">

                        <div>

                            <h2>
                                Assignment Details
                            </h2>

                            <p>
                                Complete information about this
                                assignment.
                            </p>

                        </div>

                    </div>

                    <div className="teacher-action-grid">

                        <div className="teacher-action-card">

                            <div className="action-icon">
                                📚
                            </div>

                            <div>

                                <h3>
                                    Subject
                                </h3>

                                <p>
                                    {assignment.subject ||
                                        'Not specified'}
                                </p>

                            </div>

                        </div>

                        <div className="teacher-action-card">

                            <div className="action-icon">
                                📅
                            </div>

                            <div>

                                <h3>
                                    Due Date
                                </h3>

                                <p>
                                    {assignment.due_date ||
                                        assignment.dueDate ||
                                        'Not specified'}
                                </p>

                            </div>

                        </div>

                        <div className="teacher-action-card">

                            <div className="action-icon">
                                ⚡
                            </div>

                            <div>

                                <h3>
                                    Priority
                                </h3>

                                <p>
                                    {assignment.priority ||
                                        'Not specified'}
                                </p>

                            </div>

                        </div>

                        <div className="teacher-action-card">

                            <div className="action-icon">
                                ✓
                            </div>

                            <div>

                                <h3>
                                    Status
                                </h3>

                                <p>
                                    {assignment.completed
                                        ? 'Completed'
                                        : 'Pending'}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                <section className="deadlines-card">

                    <div className="section-header">

                        <div>

                            <h2>
                                Description
                            </h2>

                        </div>

                    </div>

                    <div className="empty-state">

                        <p>
                            {assignment.description ||
                                'No description was added for this assignment.'}
                        </p>

                    </div>

                </section>

                {role === 'student' && (

                    <section className="deadlines-card assignment-submission-card">

                        <div className="section-header">

                            <div>

                                <h2>
                                    Assignment Submission
                                </h2>

                                <p>
                                    Upload your completed assignment
                                    as a PDF file.
                                </p>

                            </div>

                        </div>

                        <div className="assignment-submission-content">

                            {submission ? (

                                <div className="assignment-submitted-box">

                                    <div className="assignment-submitted-header">

                                        <div className="assignment-submitted-icon">
                                            ✓
                                        </div>

                                        <div>

                                            <h3>
                                                Assignment Submitted
                                            </h3>

                                            <p>
                                                Your assignment has been
                                                submitted successfully.
                                            </p>

                                        </div>

                                    </div>

                                    <div className="assignment-submitted-file">

                                        <div className="assignment-submitted-file-icon">
                                            📄
                                        </div>

                                        <div className="assignment-submitted-file-info">

                                            <span className="assignment-submitted-file-label">
                                                Submitted PDF
                                            </span>

                                            <span className="assignment-submitted-file-name">
                                                {submission.file_name}
                                            </span>

                                        </div>

                                    </div>

                                    <a
                                        href={`http://localhost:5000${submission.file_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="teacher-primary-button assignment-view-button"
                                    >
                                        View Submitted PDF
                                    </a>

                                </div>

                            ) : (

                                <form
                                    onSubmit={handleSubmission}
                                >

                                    <div className="assignment-upload-box">

                                        <div className="assignment-upload-icon">
                                            📄
                                        </div>

                                        <h3>
                                            Upload Your Assignment
                                        </h3>

                                        <p>
                                            Select your completed assignment
                                            as a PDF file.
                                        </p>

                                        <input
                                            id="assignment-pdf"
                                            className="assignment-file-input"
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={handleFileChange}
                                        />

                                        {selectedFile && (

                                            <div className="assignment-selected-file">

                                                <div className="assignment-selected-file-icon">
                                                    📄
                                                </div>

                                                <div className="assignment-selected-file-info">

                                                    <span className="assignment-selected-file-label">
                                                        Selected file
                                                    </span>

                                                    <span className="assignment-selected-file-name">
                                                        {selectedFile.name}
                                                    </span>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                    {submissionError && (

                                        <p className="assignment-error-message">
                                            {submissionError}
                                        </p>

                                    )}

                                    {submissionMessage && (

                                        <p className="assignment-success-message">
                                            {submissionMessage}
                                        </p>

                                    )}

                                    <button
                                        type="submit"
                                        className="teacher-primary-button assignment-submit-button"
                                        disabled={submissionLoading}
                                    >
                                        {submissionLoading
                                            ? 'Submitting...'
                                            : 'Submit Assignment'}
                                    </button>

                                </form>

                            )}

                        </div>

                    </section>

                )}

                <Link
                    to={getBackPath()}
                    className="teacher-primary-button"
                >
                    ← Back to Classrooms
                </Link>

            </main>

        </div>
    )
}

export default AssignmentDetails

