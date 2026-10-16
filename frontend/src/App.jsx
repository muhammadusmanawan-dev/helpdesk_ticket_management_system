import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import Sidebar from './components/organisms/Sidebar'
import LoginForm from './components/organisms/LoginForm'
import TicketDetails from './components/organisms/TicketDetails'

import { loginUser, getAccessToken, getCurrentUser, logoutUser } from './services/authService'
import { getCustomerTickets, getAssignedTickets, createCustomerTicket, updateCustomerTicket, updateAssignedTicketStatus, updateAdminTicketStatus } from './services/ticketService'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTickets from './pages/admin/AdminTickets'
import AgentDashboard from './pages/agent/AgentDashboard'
import AgentTickets from './pages/agent/AgentTickets'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CustomerTickets from './pages/customer/CustomerTickets'

import './App.css'

function App() {
  const queryClient = useQueryClient()

  const [token, setToken] = useState(() => getAccessToken())

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


  // Customer: Retrieving Customer tickets
  const {
    data: tickets = [],
    isLoading: ticketsLoading,
    error: ticketsQueryError,
  } = useQuery({
    queryKey: ['customerTickets', token],
    queryFn: async () => {
      try {
        return await getCustomerTickets(token)
      } catch (error) {
        if (error.message.includes('401')) {
          logoutUser()
          setToken(null)
          setCurrentUser(null)
          setSelectedTicket(null)
        }

        throw error
      }
    },
    enabled: Boolean(token && currentUser?.role === 'customer'),
  })

  const ticketsError = ticketsQueryError?.message ?? ''

  //Agent: Retrieving Tickets assigned to the logged-in agent
  const {
    data: assignedTickets = [],
    isLoading: assignedTicketsLoading,
    error: assignedTicketsQueryError,
  } = useQuery({
    queryKey: ['assignedTickets', token],
    queryFn: () => getAssignedTickets(token),
    enabled: Boolean(token && currentUser?.role === 'agent'),
  })

  const assignedTicketsError =
    assignedTicketsQueryError?.message ?? ''

  // Login
  async function handleLogin(email, password) {
    setLoginLoading(true)
    setLoginError('')
    setUserError('')
    setUserLoading(true)
    setCurrentUser(null)

    try {
      const data = await loginUser(email, password)
      setToken(data.access_token)
    } catch (error) {
      setLoginError(error.message)
      setUserLoading(false)
    } finally {
      setLoginLoading(false)
    }
  }

  // Logout
  function handleLogout() {
    logoutUser()
    setToken(null)
    setCurrentUser(null)
    setUserLoading(false)
    setUserError('')
    setSelectedTicket(null)
    setCreateError('')
    setCreateSuccess('')

    queryClient.removeQueries({
      queryKey: ['customerTickets'],
    })

    queryClient.removeQueries({
      queryKey: ['assignedTickets'],
    })
  }

  // Customer creates a ticket
  async function handleCreateTicket(ticketData) {
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    try {
      await createCustomerTicket(ticketData, token)

      await queryClient.invalidateQueries({
        queryKey: ['customerTickets', token],
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

  // Customer updates ticket information
  async function handleStatusUpdated(ticketId, status) {
    let updatedTicket

    if (currentUser.role === 'admin') {
      updatedTicket = await updateAdminTicketStatus(
        ticketId,
        status,
        token
      )
    } else if (currentUser.role === 'agent') {
      updatedTicket = await updateAssignedTicketStatus(
        ticketId,
        status,
        token
      )
    } else {
      throw new Error('You are not allowed to update ticket status.')
    }

    await queryClient.invalidateQueries({
      queryKey: ['adminTickets', token],
    })

    await queryClient.invalidateQueries({
      queryKey: ['assignedTickets', token],
    })

    await queryClient.invalidateQueries({
      queryKey: ['customerTickets', token],
    })

    setSelectedTicket(updatedTicket)

    return updatedTicket
  }

  // Customer updates ticket information
  async function handleUpdateTicket(ticketId, ticketData) {
    const updatedTicket = await updateCustomerTicket(
      ticketId,
      ticketData,
      token
    )

    await queryClient.invalidateQueries({
      queryKey: ['customerTickets', token],
    })

    setSelectedTicket(updatedTicket)

    return updatedTicket
  }

  // Load logged-in user's information
  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadCurrentUser() {
      setUserLoading(true)
      setUserError('')

      try {
        const user = await getCurrentUser(token)

        if (!cancelled) {
          setCurrentUser(user)
        }
      } catch (error) {
        if (!cancelled) {
          setUserError(error.message)
          setCurrentUser(null)

          if (error.message.includes('401')) {
            logoutUser()
            setToken(null)
          }
        }
      } finally {
        if (!cancelled) {
          setUserLoading(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [token])

  // if token is not already availble (user havent logged in)
  if (!token) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    )
  }

  if (userLoading) {
    return <p>Loading user...</p>
  }

  if (userError || !currentUser) {
    return (
      <div className="app-layout">
        <main className="main-content">
          <p className="api-error">
            {userError || 'Could not load user information.'}
          </p>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </main>
      </div>
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
            token={token}
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
                token={token}
                onViewDetails={setSelectedTicket}
              />
            ) : (
              <AdminDashboard token={token} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
