import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm({
    onLogin,
    loading = false,
    error = '',
    connectionError = '',
    onRetry,
}) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(event) {
        event.preventDefault()
        onLogin(email, password)
    }

    if (connectionError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
                    <p className="mb-3 text-xs font-bold tracking-[2px] text-indigo-600">
                        SUPPORT WORKSPACE
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Connection problem
                    </h1>

                    <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {connectionError}
                    </p>

                    <Button
                        type="button"
                        onClick={onRetry}
                        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        Retry
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="mt-3 w-full"
                    >
                        Back to login
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 md:grid-cols-2">
                {/* Left panel */}
                <section className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white md:flex">
                    <div>
                        <p className="text-sm font-semibold tracking-[2px] text-indigo-100">
                            SUPPORT WORKSPACE
                        </p>

                        <h2 className="mt-16 text-4xl font-bold leading-tight">
                            Support your team.
                            <br />
                            Resolve issues faster.
                        </h2>

                        <p className="mt-5 max-w-sm text-sm leading-6 text-indigo-100">
                            Manage support tickets and keep every conversation
                            organized in one place.
                        </p>
                    </div>

                    <p className="text-sm text-indigo-100">
                        Helpdesk Ticket Management System
                    </p>
                </section>

                {/* Login form */}
                <section className="p-7 sm:p-10 md:p-12">
                    <p className="text-xs font-bold tracking-[2px] text-indigo-600 md:hidden">
                        SUPPORT WORKSPACE
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to manage your support tickets.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-slate-700"
                            >
                                Email
                            </label>

                            <Input
                                id="email"
                                type="email"
                                autoComplete="username"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="you@qbatch.com"
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                required
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full bg-indigo-600 font-semibold hover:bg-indigo-700"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </section>
            </div>
        </main>
    )
}

export default LoginForm
