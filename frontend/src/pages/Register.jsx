
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [message, setMessage] = useState('')

  async function handleRegister(event) {
    event.preventDefault()

    const user = {
      name: name,
      email: email,
      password: password,
      role: role
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      })

      const data = await response.json()

      setMessage(data.message)

      if (response.ok) {
        setTimeout(() => {
          navigate('/login')
        }, 1000)
      }
    } catch (error) {
      console.log(error)
      setMessage('Unable to connect to the backend.')
    }
  }

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="brand">
          <h1>Student Assistance</h1>
          <p>Manage your academic work with ease</p>
        </div>

        <h2>Create Account</h2>

        <p className="login-text">
          Register to get started
        </p>

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button type="submit">
            Create Account
          </button>

        </form>

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        <p className="register-text">
          Already have an account?{' '}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  )
}

export default Register

