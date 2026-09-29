
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    async function handleLogin(event) {
        event.preventDefault()

        const user = {
            email: email,
            password: password
        }

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('loggedIn', 'true')
                localStorage.setItem('userId', data.userId)
                localStorage.setItem('role', data.role)
                localStorage.setItem('name', data.name)

                setError('')

                if (data.role === 'teacher') {
                    navigate('/teacher-dashboard')
                } else {
                    navigate('/dashboard')
                }
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.log(error)
            setError('Unable to connect to the backend.')
        }
    }

    return (
        <div className="auth-container">

            <div className="auth-card">

                <div className="brand">
                    <h1>Student Assistance</h1>
                    <p>Manage your academic work with ease</p>
                </div>

                <h2>Welcome Back</h2>

                <p className="login-text">
                    Login to continue to your account
                </p>

                <form onSubmit={handleLogin}>

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
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">
                        Login
                    </button>

                </form>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <p className="register-text">
                    Don't have an account?{' '}
                    <Link to="/register">
                        Create Account
                    </Link>
                </p>

            </div>

        </div>
    )
}

export default Login

