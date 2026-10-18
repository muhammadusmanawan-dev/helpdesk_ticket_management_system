import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import Sidebar from './components/organisms/Sidebar'
import LoginForm from './components/organisms/LoginForm'
import TicketDetails from './components/organisms/TicketDetails'

import { loginUser, getCurrentUser, logoutUser } from './services/authService'
import {
  getCustomerTickets,
  getAssignedTickets,
  createCustomerTicket,
  updateCustomerTicket,
  updateAssignedTicketStatus,
  updateAdminTicketStatus,
} from './services/ticketService'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTickets from './pages/admin/AdminTickets'
import AgentDashboard from './pages/agent/AgentDashboard'
import AgentTickets from './pages/agent/AgentTickets'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerTickets from './pages/customer/CustomerTickets'

import './App.css'

function App() {
  const queryClient = useQueryClient()

  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)

  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const [currentUser, setCurrentUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState('')

  const [activeAdminPage, setActiveAdminPage] = useState('Dashboard')
  const [activeAgentPage, setActiveAgentPage] = useState('Dashboard')
  const [activeCustomerPage, setActiveCustomerPage] = useState('Dashboard')

  // Load the current user from httpOnly session
  async function loadCurrentUser() {
    setUserLoading(true)
    setUserError('')

    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (error) {
      setCurrentUser(null)

      // No valid session means the user needs to log in.
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

  // Customer tickets
  const {
    data: tickets = [],
    isLoading: ticketsLoading,
    error: ticketsQueryError,
  } = useQuery({
    queryKey: ['customerTickets'],
    queryFn: getCustomerTickets,
    enabled: currentUser?.role === 'customer',
  })

  const ticketsError = ticketsQueryError?.message ?? ''

  // Agent tickets
  const {
    data: assignedTickets = [],
    isLoading: assignedTicketsLoading,
    error: assignedTicketsQueryError,
  } = useQuery({
    queryKey: ['assignedTickets'],
    queryFn: getAssignedTickets,
    enabled: currentUser?.role === 'agent',
  })

  const assignedTicketsError =
    assignedTicketsQueryError?.message ?? ''

  // Login
  async function handleLogin(email, password) {
    setLoginLoading(true)
    setLoginError('')
    setUserError('')

    try {
      // Cookie is set by the backend. Login does not return a token.
      await loginUser(email, password)

      // Fetch the logged-in user's details using the new cookie.
      const user = await getCurrentUser()
      setCurrentUser(user)
      setSelectedTicket(null)

      await queryClient.invalidateQueries()
    } catch (error) {
      setCurrentUser(null)
      setLoginError(error.message)
    } finally {
      setUserLoading(false)
      setLoginLoading(false)
    }
  }

  // Logout
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
      setSelectedTicket(null)
      setCreateError('')
      setCreateSuccess('')

      queryClient.clear()
    }
  }

  // Customer creates a ticket
  async function handleCreateTicket(ticketData) {
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    try {
      await createCustomerTicket(ticketData)

      await queryClient.invalidateQueries({
        queryKey: ['customerTickets'],
      })

      setCreateSuccess('Ticket created successfully!')
      return true
    } catch (error) {
      setCreateError(error.message)
      return false
    } finally {
      setCreateLoading(false)
    }
  }

  // Admin or agent updates ticket status
  async function handleStatusUpdated(ticketId, status) {
    let updatedTicket

    if (currentUser.role === 'admin') {
      updatedTicket = await updateAdminTicketStatus(ticketId, status)
    } else if (currentUser.role === 'agent') {
      updatedTicket = await updateAssignedTicketStatus(ticketId, status)
    } else {
      throw new Error('You are not allowed to update ticket status.')
    }

    await queryClient.invalidateQueries()
    setSelectedTicket(updatedTicket)

    return updatedTicket
  }

  // Customer updates ticket information
  async function handleUpdateTicket(ticketId, ticketData) {
    const updatedTicket = await updateCustomerTicket(
      ticketId,
      ticketData
    )

    await queryClient.invalidateQueries({
      queryKey: ['customerTickets'],
    })

    setSelectedTicket(updatedTicket)

    return updatedTicket
  }

  // Show loading while checking whether a session cookie exists.
  if (userLoading) {
    return <p>Loading user...</p>
  }

  // No authenticated user: show login.
  if (!currentUser) {
    if (userError) {
      return (
        <main className="login-page">
          <div className="login-card">
            <p className="api-error">{userError}</p>
            <button
              className="primary-button"
              type="button"
              onClick={loadCurrentUser}
            >
              Retry
            </button>
            <button
              className="logout-button"
              type="button"
              onClick={() => setUserError('')}
            >
              Back to login
            </button>
          </div>
        </main>
      )
    }

    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    )
  }

  const isCustomer = currentUser.role === 'customer'
  const isAgent = currentUser.role === 'agent'

  const activePage = isCustomer
    ? activeCustomerPage
    : isAgent
      ? activeAgentPage
      : activeAdminPage

  const setActivePage = isCustomer
    ? setActiveCustomerPage
    : isAgent
      ? setActiveAgentPage
      : setActiveAdminPage

  return (
    <div className="app-layout">
      <Sidebar
        currentUser={currentUser}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">SUPPORT WORKSPACE</p>
            <h1>{selectedTicket ? 'Ticket Details' : activePage}</h1>
          </div>

          <div className="topbar-user">
            <span>{currentUser.email}</span>
            <button
              className="logout-button"
              type="button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        {selectedTicket ? (
          <TicketDetails
            ticket={selectedTicket}
            currentUser={currentUser}
            onBack={() => setSelectedTicket(null)}
            onTicketUpdated={handleUpdateTicket}
            onStatusUpdated={handleStatusUpdated}
          />
        ) : (
          <>
            <section className="welcome-section">
              <div>
                <p className="eyebrow">
                  {isCustomer
                    ? 'CUSTOMER WORKSPACE'
                    : isAgent
                      ? 'AGENT WORKSPACE'
                      : 'ADMIN WORKSPACE'}
                </p>

                <h2>Welcome back!</h2>

                <p>
                  {isCustomer
                    ? 'Here is an overview of your support tickets.'
                    : isAgent
                      ? 'Review and manage tickets assigned to you.'
                      : 'Welcome to the support workspace.'}
                </p>
              </div>
            </section>

            {isCustomer ? (
              activeCustomerPage === 'My Tickets' ? (
                <CustomerTickets
                  tickets={tickets}
                  loading={ticketsLoading}
                  error={ticketsError}
                  onCreate={handleCreateTicket}
                  createLoading={createLoading}
                  createError={createError}
                  createSuccess={createSuccess}
                  onViewDetails={setSelectedTicket}
                />
              ) : (
                <CustomerDashboard
                  tickets={tickets}
                  loading={ticketsLoading}
                  error={ticketsError}
                />
              )
            ) : isAgent ? (
              activeAgentPage === 'My Tickets' ? (
                <AgentTickets
                  assignedTickets={assignedTickets}
                  loading={assignedTicketsLoading}
                  error={assignedTicketsError}
                  onViewDetails={setSelectedTicket}
                />
              ) : (
                <AgentDashboard
                  assignedTickets={assignedTickets}
                  loading={assignedTicketsLoading}
                  error={assignedTicketsError}
                />
              )
            ) : activeAdminPage === 'Tickets' ? (
              <AdminTickets
                onViewDetails={setSelectedTicket}
              />
            ) : (
              <AdminDashboard />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
