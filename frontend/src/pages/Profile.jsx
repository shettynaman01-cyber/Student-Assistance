
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './Profile.css'

function Profile() {
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
        console.log('Profile error:', error)
      })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('loggedIn')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    localStorage.removeItem('name')

    navigate('/login')
  }

  if (!user) {
    return (
      <div className="student-profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div className="student-profile-page">

      {/* Header */}

      <header className="student-profile-header">

        <div>
          <h1>Student Assistance</h1>
          <p>Your student learning space</p>
        </div>

      </header>


      {/* Navigation */}

      <nav className="student-profile-nav">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? 'profile-nav-active' : ''
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/student-classrooms"
          className={({ isActive }) =>
            isActive ? 'profile-nav-active' : ''
          }
        >
          Classrooms
        </NavLink>

        <NavLink
          to="/doubts"
          className={({ isActive }) =>
            isActive ? 'profile-nav-active' : ''
          }
        >
          Doubts
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? 'profile-nav-active' : ''
          }
        >
          Profile
        </NavLink>

        <button onClick={handleLogout}>
          Logout
        </button>

      </nav>


      {/* Main */}

      <main className="student-profile-main">

        <div className="profile-heading">

          <div>
            <span>MY ACCOUNT</span>

            <h2>Profile</h2>

            <p>
              View your personal information and account details.
            </p>
          </div>

        </div>


        {/* Main Profile Card */}

        <section className="student-profile-card">

          <div className="profile-card-top">

            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="profile-user">

              <h3>{user.name}</h3>

              <p>{user.email}</p>

              <div className="student-badge">
                <span></span>
                Student Account
              </div>

            </div>

          </div>


          <div className="profile-line"></div>


          <div className="profile-section-title">

            <h3>Account Information</h3>

            <p>
              Your registered student account details.
            </p>

          </div>


          <div className="profile-information-grid">

            <div className="profile-information-box">

              <div className="information-icon">
                👤
              </div>

              <div>
                <span>Student Name</span>
                <strong>{user.name}</strong>
              </div>

            </div>


            <div className="profile-information-box">

              <div className="information-icon">
                ✉
              </div>

              <div>
                <span>Email Address</span>
                <strong>{user.email}</strong>
              </div>

            </div>


            <div className="profile-information-box">

              <div className="information-icon">
                🎓
              </div>

              <div>
                <span>Account Type</span>
                <strong>Student</strong>
              </div>

            </div>

          </div>

        </section>


        {/* Bottom Information */}

        <section className="profile-security-card">

          <div className="security-icon">
            ✓
          </div>

          <div>
            <h3>Student Account</h3>

            <p>
              This account is used to access your classrooms,
              assignments, doubts, and other student features.
            </p>
          </div>

        </section>

      </main>

    </div>
  )
}

export default Profile

