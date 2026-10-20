
import { useEffect, useState } from 'react'
import {
    loginUser,
    getCurrentUser,
    logoutUser,
} from '../services/authService'

function useAuth() {
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [currentUser, setCurrentUser] = useState(null)
    const [userLoading, setUserLoading] = useState(true)
    const [userError, setUserError] = useState('')

    async function loadCurrentUser() {
        setUserLoading(true)
        setUserError('')

        try {
            const user = await getCurrentUser()
            setCurrentUser(user)
        } catch (error) {
            setCurrentUser(null)

            if (
                error.message.includes('401') ||
                error.message.includes('403')
            ) {
                setUserError('')
            } else {
                setUserError(error.message)
            }
        } finally {
            setUserLoading(false)
        }
    }

    useEffect(() => {
        loadCurrentUser()
    }, [])

    async function handleLogin(email, password) {
        setLoginLoading(true)
        setLoginError('')
        setUserError('')

        try {
            await loginUser(email, password)

            const user = await getCurrentUser()
            setCurrentUser(user)

            return user
        } catch (error) {
            setCurrentUser(null)
            setLoginError(error.message)
            throw error
        } finally {
            setUserLoading(false)
            setLoginLoading(false)
        }
    }

    async function handleLogout() {
        try {
            await logoutUser()
        } catch (error) {
            console.error('Backend logout failed:', error)
        } finally {
            setCurrentUser(null)
            setUserLoading(false)
            setUserError('')
            setLoginError('')
        }
    }

    return {
        currentUser,
        userLoading,
        userError,
        loginLoading,
        loginError,
        loadCurrentUser,
        handleLogin,
        handleLogout,
        setCurrentUser,
        setLoginError,
        setUserError,
    }
}

export default useAuth
