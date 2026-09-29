
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './TeacherProfile.css'

function TeacherProfile() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      navigate('/login')
      return
    }

    fetch(`http://localhost:5000/api/profile?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data)
      })
      .catch((error) => {
        console.log('Teacher profile error:', error)
      })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('loggedIn')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')

    navigate('/login')
  }

  if (!user) {
    return (
      <div className="teacher-profile-page">
        <div className="teacher-profile-loading">
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div className="teacher-profile-page">

      {/* HEADER */}

      <header className="teacher-profile-header">

        <div>
          <h1>Student Assistance</h1>
          <p>Your teacher workspace</p>
        </div>

        <div className="teacher-profile-user">
          <strong>{user.name}</strong>
          <span>Teacher</span>
        </div>

      </header>


      {/* NAVIGATION */}

      <nav className="teacher-profile-nav">

        <NavLink
          to="/teacher-dashboard"
          className={({ isActive }) =>
            isActive ? 'teacher-profile-nav-active' : ''
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/classrooms"
          className={({ isActive }) =>
            isActive ? 'teacher-profile-nav-active' : ''
          }
        >
          Classrooms
        </NavLink>

        <NavLink
          to="/teacher-assignments"
          className={({ isActive }) =>
            isActive ? 'teacher-profile-nav-active' : ''
          }
        >
          Assignments
        </NavLink>

        <NavLink
          to="/teacher-chats"
          className={({ isActive }) =>
            isActive ? 'teacher-profile-nav-active' : ''
          }
        >
          Chats
        </NavLink>

        <NavLink
          to="/teacher-profile"
          className={({ isActive }) =>
            isActive ? 'teacher-profile-nav-active' : ''
          }
        >
          Profile
        </NavLink>

        <button onClick={handleLogout}>
          Logout
        </button>

      </nav>


      {/* MAIN */}

      <main className="teacher-profile-main">

        <div className="teacher-profile-heading">

          <div>
            <span>TEACHER ACCOUNT</span>

            <h2>Profile</h2>

            <p>
              View your personal information and teacher account details.
            </p>
          </div>

        </div>


        {/* MAIN PROFILE CARD */}

        <section className="teacher-profile-card">

          <div className="teacher-profile-card-top">

            <div className="teacher-profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="teacher-profile-user-info">

              <h3>{user.name}</h3>

              <p>{user.email}</p>

              <div className="teacher-badge">
                <span></span>
                Teacher Account
              </div>

            </div>

          </div>


          <div className="teacher-profile-line"></div>


          <div className="teacher-profile-section-title">

            <h3>Account Information</h3>

            <p>
              Your registered teacher account details.
            </p>

          </div>


          <div className="teacher-profile-information-grid">

            <div className="teacher-profile-information-box">

              <div className="teacher-information-icon">
                👤
              </div>

              <div>
                <span>Teacher Name</span>
                <strong>{user.name}</strong>
              </div>

            </div>


            <div className="teacher-profile-information-box">

              <div className="teacher-information-icon">
                ✉
              </div>

              <div>
                <span>Email Address</span>
                <strong>{user.email}</strong>
              </div>

            </div>


            <div className="teacher-profile-information-box">

              <div className="teacher-information-icon">
                🎓
              </div>

              <div>
                <span>Account Type</span>
                <strong>Teacher</strong>
              </div>

            </div>

          </div>

        </section>


        {/* BOTTOM INFORMATION */}

        <section className="teacher-profile-security-card">

          <div className="teacher-security-icon">
            ✓
          </div>

          <div>
            <h3>Teacher Account</h3>

            <p>
              This account is used to manage classrooms,
              assignments, student communication, and teacher features.
            </p>
          </div>

        </section>

      </main>

    </div>
  )
}

export default TeacherProfile

