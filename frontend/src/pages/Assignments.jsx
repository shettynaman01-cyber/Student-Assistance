
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Assignments.css'

function Assignments() {
  const [searchParams] = useSearchParams()
  const classroomId = searchParams.get('classroomId')

  const [showForm, setShowForm] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [classroom, setClassroom] = useState(null)

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')

  const [editingId, setEditingId] = useState(null)

  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')

  // LOAD CLASSROOM
  useEffect(() => {
    if (!classroomId) return

    fetch(`http://localhost:5000/api/classrooms/${classroomId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.id) {
          setClassroom(data)
        }
      })
      .catch((error) => {
        console.log('Error loading classroom:', error)
      })
  }, [classroomId])

  // LOAD ASSIGNMENTS
  useEffect(() => {
    const userId = localStorage.getItem('userId')

    if (!userId) return

    const url = classroomId
      ? `http://localhost:5000/api/classrooms/${classroomId}/assignments`
      : `http://localhost:5000/api/assignments?userId=${userId}`

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAssignments(data)
        }
      })
      .catch((error) => {
        console.log('Error loading assignments:', error)
      })
  }, [classroomId])

  // CLEAR FORM
  function clearForm() {
    setTitle('')
    setSubject('')
    setDueDate('')
    setPriority('Medium')
    setDescription('')
    setEditingId(null)
    setShowForm(false)
  }

  // SUBMIT
  async function handleSubmit(event) {
    event.preventDefault()

    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')

    if (editingId !== null) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/assignments/${editingId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title,
              subject,
              dueDate,
              priority,
              description
            })
          }
        )

        const data = await response.json()

        if (response.ok) {
          setAssignments(
            assignments.map((assignment) =>
              assignment.id === editingId
                ? {
                    ...assignment,
                    title,
                    subject,
                    dueDate,
                    due_date: dueDate,
                    priority,
                    description
                  }
                : assignment
            )
          )

          console.log(data.message)
        } else {
          console.log(data.message)
        }
      } catch (error) {
        console.log('Update error:', error)
      }

      clearForm()
      return
    }

    const newAssignment = {
      userId,
      title,
      subject,
      dueDate,
      priority,
      description,
      completed: false,
      classroomId: classroomId || null,
      createdBy:
        classroomId && role === 'teacher'
          ? userId
          : null
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/assignments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newAssignment)
        }
      )

      const data = await response.json()

      if (response.ok) {
        const savedAssignment = {
          id: data.assignmentId,
          title,
          subject,
          dueDate,
          due_date: dueDate,
          priority,
          description,
          completed: false,
          classroom_id: classroomId || null,
          created_by:
            classroomId && role === 'teacher'
              ? userId
              : null
        }

        setAssignments([
          ...assignments,
          savedAssignment
        ])
      } else {
        console.log(data.message)
      }
    } catch (error) {
      console.log('Save error:', error)
    }

    clearForm()
  }

  // EDIT
  function handleEdit(assignment) {
    setTitle(assignment.title || '')
    setSubject(assignment.subject || '')
    setDueDate(
      assignment.dueDate ||
        assignment.due_date ||
        ''
    )
    setPriority(assignment.priority || 'Medium')
    setDescription(assignment.description || '')
    setEditingId(assignment.id)
    setShowForm(true)
  }

  // COMPLETE / PENDING
  async function handleComplete(id) {
    const assignment = assignments.find(
      (item) => item.id === id
    )

    if (!assignment) return

    const newCompletedStatus = !assignment.completed

    try {
      const response = await fetch(
        `http://localhost:5000/api/assignments/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            completed: newCompletedStatus
          })
        }
      )

      const data = await response.json()

      if (response.ok) {
        setAssignments(
          assignments.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completed: newCompletedStatus
                }
              : item
          )
        )

        console.log(data.message)
      }
    } catch (error) {
      console.log('Status update error:', error)
    }
  }

  // DELETE
  async function handleDelete(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/assignments/${id}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (response.ok) {
        setAssignments(
          assignments.filter(
            (assignment) => assignment.id !== id
          )
        )

        console.log(data.message)
      }
    } catch (error) {
      console.log('Delete error:', error)
    }
  }

  // SUBJECTS
  const subjects = [
    ...new Set(
      assignments
        .map((assignment) => assignment.subject)
        .filter(Boolean)
    )
  ]

  // FILTER + SORT
  const filteredAssignments = assignments
    .filter((assignment) => {
      const assignmentTitle =
        assignment.title || ''

      const matchesSearch =
        assignmentTitle
          .toLowerCase()
          .includes(searchText.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Completed' &&
          assignment.completed) ||
        (statusFilter === 'Pending' &&
          !assignment.completed)

      const matchesPriority =
        priorityFilter === 'All' ||
        assignment.priority === priorityFilter

      const matchesSubject =
        subjectFilter === 'All' ||
        assignment.subject === subjectFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesSubject
      )
    })
    .sort((a, b) => {
      const dateA =
        a.dueDate ||
        a.due_date ||
        ''

      const dateB =
        b.dueDate ||
        b.due_date ||
        ''

      if (sortBy === 'Due Date') {
        return dateA.localeCompare(dateB)
      }

      if (sortBy === 'Priority') {
        const priorityOrder = {
          High: 1,
          Medium: 2,
          Low: 3
        }

        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        )
      }

      if (sortBy === 'Title') {
        return (a.title || '').localeCompare(
          b.title || ''
        )
      }

      return b.id - a.id
    })

  return (
    <div className="assignment-page">

      {/* HEADER */}
      <header className="assignment-header">
        <div>
          <p className="assignment-brand">
            STUDENT ASSISTANCE
          </p>

          <h1>
            {classroomId
              ? 'Classroom Assignments'
              : 'Assignments'}
          </h1>

          <p className="assignment-header-text">
            {classroomId
              ? 'Create and manage assignments for your students.'
              : 'Keep your academic tasks organized.'}
          </p>
        </div>

        <Link
          to={
            classroomId
              ? `/classrooms/${classroomId}`
              : '/dashboard'
          }
          className="assignment-back-button"
        >
          ← Back to Classroom
        </Link>
      </header>


      <main className="assignment-main">

        {/* CLASSROOM HERO */}
        {classroomId && classroom && (
          <section className="assignment-classroom-card">

            <div className="classroom-card-top">
              <span className="classroom-label">
                CLASSROOM
              </span>

              <span className="classroom-code">
                {classroom.classroom_code}
              </span>
            </div>

            <h2>
              {classroom.name}
            </h2>

            <p>
              {classroom.description ||
                'Manage assignments and learning tasks for this classroom.'}
            </p>

          </section>
        )}


        {/* PAGE TITLE */}
        <section className="assignment-section-heading">

          <div>
            <span className="section-label">
              ASSIGNMENT MANAGEMENT
            </span>

            <h2>
              {editingId !== null
                ? 'Edit Assignment'
                : 'Create an Assignment'}
            </h2>

            <p>
              Add clear instructions and a deadline
              for your students.
            </p>
          </div>

          <div className="assignment-count">
            {assignments.length}
            <span>
              {assignments.length === 1
                ? ' Assignment'
                : ' Assignments'}
            </span>
          </div>

        </section>


        {/* FORM */}
        {showForm && (
          <section className="assignment-form">

            <div className="form-header">
              <div className="form-icon">
                +
              </div>

              <div>
                <h3>
                  {editingId !== null
                    ? 'Edit Assignment'
                    : 'New Assignment'}
                </h3>

                <p>
                  Fill in the details below.
                </p>
              </div>
            </div>


            <form onSubmit={handleSubmit}>

              <div className="form-row">

                <div className="assignment-field field-large">
                  <label>
                    Assignment Title
                  </label>

                  <input
                    type="text"
                    placeholder="Enter assignment title"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    required
                  />
                </div>


                <div className="assignment-field">
                  <label>
                    Subject
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Java"
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    required
                  />
                </div>

              </div>


              <div className="form-row">

                <div className="assignment-field">
                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(event.target.value)
                    }
                    required
                  />
                </div>


                <div className="assignment-field">
                  <label>
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value)
                    }
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>
                  </select>
                </div>

              </div>


              <div className="assignment-field">
                <label>
                  Description
                </label>

                <textarea
                  placeholder="Write the assignment instructions or additional details..."
                  rows="5"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </div>


              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-button"
                >
                  {editingId !== null
                    ? 'Update Assignment'
                    : 'Create Assignment'}
                </button>

              </div>

            </form>

          </section>
        )}


        {/* OPEN FORM BUTTON */}
        {!showForm && (
          <div className="create-assignment-area">

            <button
              className="main-create-button"
              onClick={() => {
                setEditingId(null)
                setShowForm(true)
              }}
            >
              <span>+</span>
              Create Assignment
            </button>

          </div>
        )}


        {/* FILTERS */}
        {assignments.length > 0 && (
          <section className="assignment-tools">

            <div className="search-box">
              <label>Search</label>

              <input
                type="text"
                placeholder="Search assignments..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
              />
            </div>


            <div className="tool-field">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>


            <div className="tool-field">
              <label>Priority</label>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>


            <div className="tool-field">
              <label>Subject</label>

              <select
                value={subjectFilter}
                onChange={(event) =>
                  setSubjectFilter(event.target.value)
                }
              >
                <option value="All">All</option>

                {subjects.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>


            <div className="tool-field">
              <label>Sort</label>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="Newest">
                  Newest
                </option>

                <option value="Due Date">
                  Due Date
                </option>

                <option value="Priority">
                  Priority
                </option>

                <option value="Title">
                  Title
                </option>
              </select>
            </div>

          </section>
        )}


        {/* EMPTY STATE */}
        {assignments.length === 0 && !showForm && (
          <section className="empty-assignment">

            <div className="empty-assignment-icon">
              ✓
            </div>

            <h3>
              No assignments created yet
            </h3>

            <p>
              Create the first assignment for
              {classroom
                ? ` ${classroom.name}.`
                : ' your students.'}
            </p>

            <button
              className="empty-create-button"
              onClick={() => setShowForm(true)}
            >
              + Create First Assignment
            </button>

          </section>
        )}


        {/* NO RESULTS */}
        {assignments.length > 0 &&
          filteredAssignments.length === 0 && (
            <section className="empty-assignment">
              <h3>
                No matching assignments
              </h3>

              <p>
                Try changing your search or filters.
              </p>
            </section>
          )}


        {/* ASSIGNMENT LIST */}
        {filteredAssignments.length > 0 && (
          <section className="assignment-list">

            {filteredAssignments.map(
              (assignment) => (

                <article
                  className={
                    assignment.completed
                      ? 'assignment-card completed'
                      : 'assignment-card'
                  }
                  key={assignment.id}
                >

                  <div className="assignment-card-content">

                    <div className="assignment-card-title">
                      <span className="assignment-dot"></span>

                      <h3>
                        {assignment.title}
                      </h3>
                    </div>

                    <p className="assignment-description">
                      {assignment.description ||
                        'No description provided.'}
                    </p>

                    <div className="assignment-meta">

                      <span>
                        Subject: {assignment.subject}
                      </span>

                      <span>
                        Due: {assignment.dueDate ||
                          assignment.due_date}
                      </span>

                      <span>
                        Priority: {assignment.priority}
                      </span>

                    </div>

                    {assignment.completed && (
                      <span className="completed-label">
                        ✓ Completed
                      </span>
                    )}

                  </div>


                  <div className="assignment-card-actions">

                    <button
                      className="edit-action"
                      onClick={() =>
                        handleEdit(assignment)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="complete-action"
                      onClick={() =>
                        handleComplete(
                          assignment.id
                        )
                      }
                    >
                      {assignment.completed
                        ? 'Mark Pending'
                        : 'Mark Complete'}
                    </button>

                    <button
                      className="delete-action"
                      onClick={() =>
                        handleDelete(
                          assignment.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>
              )
            )}

          </section>
        )}

      </main>

    </div>
  )
}

export default Assignments

