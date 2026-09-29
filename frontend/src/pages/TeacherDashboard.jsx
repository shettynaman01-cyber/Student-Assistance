
import { NavLink, Link, useNavigate } from 'react-router-dom'
import './TeacherDashboard.css'

function TeacherDashboard() {
    const navigate = useNavigate()

    const name = localStorage.getItem('name') || 'Teacher'

    function handleLogout() {
        localStorage.removeItem('loggedIn')
        localStorage.removeItem('userId')
        localStorage.removeItem('role')
        localStorage.removeItem('name')
        localStorage.removeItem('userName')
        localStorage.removeItem('userRole')

        navigate('/login')
    }

    const firstLetter = name.charAt(0).toUpperCase()

    return (
        <div className="teacher-dashboard">

            {/* Header */}

            <header className="teacher-header">

                <Link
                    to="/teacher-dashboard"
                    className="teacher-brand"
                >
                    <div className="brand-mark">
                        SA
                    </div>

                    <div>
                        <h1>Student Assistance</h1>
                        <p>Teacher Portal</p>
                    </div>
                </Link>


                <div className="teacher-user">

                    <div className="teacher-avatar">
                        {firstLetter}
                    </div>

                    <div className="teacher-user-info">
                        <strong>{name}</strong>
                        <span>Teacher Account</span>
                    </div>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                </div>

            </header>


            {/* Navigation */}

            <nav className="teacher-nav">

                <NavLink
                    to="/teacher-dashboard"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>⌂</span>
                    Dashboard
                </NavLink>

                <NavLink
                    to="/classrooms"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>▦</span>
                    Classrooms
                </NavLink>

                <NavLink
                    to="/teacher-assignments"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>✓</span>
                    Assignments
                </NavLink>

                <NavLink
                    to="/teacher-chats"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>◌</span>
                    Chats
                </NavLink>

                <NavLink
                    to="/teacher-profile"
                    className={({ isActive }) =>
                        isActive ? 'active' : ''
                    }
                >
                    <span>◎</span>
                    Profile
                </NavLink>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </nav>


            {/* Main Content */}

            <main className="teacher-main">


                {/* HERO */}

                <section className="teacher-hero">

                    <div className="hero-decoration hero-decoration-one"></div>
                    <div className="hero-decoration hero-decoration-two"></div>
                    <div className="hero-decoration hero-decoration-three"></div>

                    <div className="hero-content">

                        <div className="hero-badge">
                            <span className="online-dot"></span>
                            TEACHER DASHBOARD
                        </div>

                        <h2>
                            Welcome back,
                            <br />
                            <span>{name}</span>
                        </h2>

                        <p>
                            Everything you need to manage your classrooms,
                            assignments and students — all in one place.
                        </p>

                        <div className="hero-buttons">

                            <Link
                                to="/classrooms"
                                className="hero-primary-button"
                            >
                                Create Classroom
                                <span>→</span>
                            </Link>

                            <Link
                                to="/teacher-assignments"
                                className="hero-secondary-button"
                            >
                                View Assignments
                            </Link>

                        </div>

                    </div>


                    <div className="hero-visual">

                        <div className="floating-orbit orbit-one"></div>
                        <div className="floating-orbit orbit-two"></div>

                        <div className="hero-teacher-card">

                            <div className="hero-avatar">
                                {firstLetter}
                            </div>

                            <div>
                                <span>Logged in as</span>
                                <strong>{name}</strong>
                            </div>

                            <div className="hero-check">
                                ✓
                            </div>

                        </div>

                        <div className="floating-mini-card mini-card-one">
                            <span>Classes</span>
                            <strong>Ready</strong>
                        </div>

                        <div className="floating-mini-card mini-card-two">
                            <span>Students</span>
                            <strong>Learning</strong>
                        </div>

                    </div>

                </section>


                {/* STATISTICS */}

                <section className="teacher-stats">

                    <div className="teacher-stat-card">

                        <div className="stat-top">
                            <div className="stat-icon classroom-icon">
                                ▦
                            </div>

                            <span className="stat-badge">
                                Active
                            </span>
                        </div>

                        <div className="stat-number">
                            0
                        </div>

                        <div className="stat-label">
                            Classrooms
                        </div>

                        <div className="stat-line">
                            <span></span>
                        </div>

                    </div>


                    <div className="teacher-stat-card">

                        <div className="stat-top">
                            <div className="stat-icon student-icon">
                                ◉
                            </div>

                            <span className="stat-badge">
                                Enrolled
                            </span>
                        </div>

                        <div className="stat-number">
                            0
                        </div>

                        <div className="stat-label">
                            Students
                        </div>

                        <div className="stat-line">
                            <span></span>
                        </div>

                    </div>


                    <div className="teacher-stat-card">

                        <div className="stat-top">
                            <div className="stat-icon assignment-icon">
                                ✓
                            </div>

                            <span className="stat-badge">
                                Created
                            </span>
                        </div>

                        <div className="stat-number">
                            0
                        </div>

                        <div className="stat-label">
                            Assignments
                        </div>

                        <div className="stat-line">
                            <span></span>
                        </div>

                    </div>


                    <div className="teacher-stat-card">

                        <div className="stat-top">
                            <div className="stat-icon material-icon">
                                ◇
                            </div>

                            <span className="stat-badge">
                                Resources
                            </span>
                        </div>

                        <div className="stat-number">
                            0
                        </div>

                        <div className="stat-label">
                            Study Material
                        </div>

                        <div className="stat-line">
                            <span></span>
                        </div>

                    </div>

                </section>


                {/* QUICK ACTIONS */}

                <section className="teacher-section">

                    <div className="teacher-section-header">

                        <div>
                            <span className="section-kicker">
                                WORKSPACE
                            </span>

                            <h2>
                                What would you like to do?
                            </h2>

                            <p>
                                Quickly access your most important teaching tools.
                            </p>
                        </div>

                    </div>


                    <div className="teacher-action-grid">


                        <Link
                            to="/classrooms"
                            className="teacher-action-card action-blue"
                        >

                            <div className="action-card-top">
                                <div className="action-icon">
                                    ▦
                                </div>

                                <span className="action-number">
                                    01
                                </span>
                            </div>

                            <h3>
                                Manage Classrooms
                            </h3>

                            <p>
                                Create classrooms, share codes and
                                organize your students.
                            </p>

                            <span className="action-arrow">
                                Explore →
                            </span>

                        </Link>


                        <Link
                            to="/teacher-assignments"
                            className="teacher-action-card action-purple"
                        >

                            <div className="action-card-top">
                                <div className="action-icon">
                                    ✓
                                </div>

                                <span className="action-number">
                                    02
                                </span>
                            </div>

                            <h3>
                                Manage Assignments
                            </h3>

                            <p>
                                Create assignments and keep track of
                                classroom work.
                            </p>

                            <span className="action-arrow">
                                Manage →
                            </span>

                        </Link>


                        <div className="teacher-action-card action-cyan">

                            <div className="action-card-top">
                                <div className="action-icon">
                                    ◇
                                </div>

                                <span className="action-number">
                                    03
                                </span>
                            </div>

                            <h3>
                                Notes & PDFs
                            </h3>

                            <p>
                                Share notes and study material with
                                your classrooms.
                            </p>

                            <span className="action-arrow">
                                Coming soon →
                            </span>

                        </div>


                        <div className="teacher-action-card action-green">

                            <div className="action-card-top">
                                <div className="action-icon">
                                    ◉
                                </div>

                                <span className="action-number">
                                    04
                                </span>
                            </div>

                            <h3>
                                Students
                            </h3>

                            <p>
                                View students and manage classroom
                                participation.
                            </p>

                            <span className="action-arrow">
                                Coming soon →
                            </span>

                        </div>


                        <Link
                            to="/teacher-chats"
                            className="teacher-action-card action-orange"
                        >

                            <div className="action-card-top">
                                <div className="action-icon">
                                    ◌
                                </div>

                                <span className="action-number">
                                    05
                                </span>
                            </div>

                            <h3>
                                Student Chats
                            </h3>

                            <p>
                                Communicate privately with students
                                from your classrooms.
                            </p>

                            <span className="action-arrow">
                                Open Chats →
                            </span>

                        </Link>


                        <Link
                            to="/teacher-profile"
                            className="teacher-action-card action-dark"
                        >

                            <div className="action-card-top">
                                <div className="action-icon">
                                    ◎
                                </div>

                                <span className="action-number">
                                    06
                                </span>
                            </div>

                            <h3>
                                Teacher Profile
                            </h3>

                            <p>
                                View and manage your teacher account
                                information.
                            </p>

                            <span className="action-arrow">
                                View Profile →
                            </span>

                        </Link>

                    </div>

                </section>


                {/* BOTTOM INFORMATION */}

                <section className="teacher-info-card">

                    <div className="info-content">

                        <span className="teacher-info-label">
                            STUDENT ASSISTANCE
                        </span>

                        <h2>
                            A smarter workspace for teaching.
                        </h2>

                        <p>
                            Manage classrooms, assignments, learning
                            resources and student communication from a
                            single platform designed for a smoother
                            teaching experience.
                        </p>

                    </div>

                    <div className="info-decoration">
                        <div>SA</div>
                    </div>

                </section>

            </main>

        </div>
    )
}

export default TeacherDashboard

