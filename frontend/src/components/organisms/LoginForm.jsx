
import { useState } from 'react'

function LoginForm({ onLogin, loading, error }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(event) {
        event.preventDefault()
        onLogin(email, password)
    }

    return (
        <main className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <p className="eyebrow">SUPPORT WORKSPACE</p>
                <h1>Welcome back</h1>
                <p>Sign in to manage your support tickets.</p>

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                />

                {error && <p className="login-error">{error}</p>}

                <button
                    className="primary-button"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </main>
    )
}

export default LoginForm
