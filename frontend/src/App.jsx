import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import Sidebar from './components/organisms/Sidebar'
import LoginForm from './components/organisms/LoginForm'
import StatCard from './components/molecules/StatCard'
import SearchBar from './components/molecules/SearchBar'
import TicketTable from './components/organisms/TicketTable'
import CreateTicketForm from './components/organisms/CreateTicketForm'
import TicketDetails from './components/organisms/TicketDetails'

import { loginUser, getAccessToken, getCurrentUser, logoutUser } from './services/authService'
import { getCustomerTickets, getAssignedTickets, createCustomerTicket, updateCustomerTicket, updateAssignedTicketStatus } from './services/ticketService'

import AdminDashboard from './pages/admin/AdminDashboard'

import './App.css'

function App() {
  const queryClient = useQueryClient()

  const [token, setToken] = useState(() => getAccessToken())
  const [search, setSearch] = useState('')

  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)

  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const [currentUser, setCurrentUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState('')

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
    setSearch('')
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

  // Agent updates the status of an assigned ticket
  async function handleStatusUpdated(ticketId, status) {
    const updatedTicket = await updateAssignedTicketStatus(
      ticketId,
      status,
      token
    )

    await queryClient.invalidateQueries({
      queryKey: ['assignedTickets', token],
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

  // Search customer and agent tickets separately
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  )

  const filteredAssignedTickets = assignedTickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  )

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

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">SUPPORT WORKSPACE</p>
            <h1>Dashboard</h1>
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
                  {isCustomer ? 'TICKET WORKSPACE' : 'AGENT WORKSPACE'}
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

            {isCustomer && ticketsError && (
              <p className="api-error">
                Could not load tickets: {ticketsError}
              </p>
            )}

            {isAgent && assignedTicketsError && (
              <p className="api-error">
                Could not load assigned tickets: {assignedTicketsError}
              </p>
            )}

            {isCustomer ? (
              <>
                <section className="stats-grid">
                  <StatCard
                    title="Total tickets"
                    value={tickets.length}
                    description="Tickets loaded from backend"
                  />

                  <StatCard
                    title="Open"
                    value={tickets.filter(
                      (ticket) => ticket.status === 'Open'
                    ).length}
                    description="Waiting for action"
                  />

                  <StatCard
                    title="In progress"
                    value={tickets.filter(
                      (ticket) => ticket.status === 'In Progress'
                    ).length}
                    description="Currently being handled"
                  />

                  <StatCard
                    title="Resolved"
                    value={tickets.filter(
                      (ticket) => ticket.status === 'Resolved'
                    ).length}
                    description="Completed tickets"
                  />
                </section>

                <CreateTicketForm
                  onCreate={handleCreateTicket}
                  loading={createLoading}
                  error={createError}
                  success={createSuccess}
                />

                <section className="tickets-section">
                  <div className="section-heading">
                    <div>
                      <h2>Recent tickets</h2>
                      <p>Review and search support requests.</p>
                    </div>

                    <SearchBar
                      value={search}
                      onChange={setSearch}
                    />
                  </div>

                  {ticketsLoading ? (
                    <p>Loading tickets...</p>
                  ) : (
                    <TicketTable
                      tickets={filteredTickets}
                      onViewDetails={setSelectedTicket}
                    />
                  )}
                </section>
              </>
            ) : isAgent ? (
              <>
                <section className="stats-grid">
                  <StatCard
                    title="Assigned tickets"
                    value={assignedTickets.length}
                    description="Tickets assigned to you"
                  />

                  <StatCard
                    title="Open"
                    value={assignedTickets.filter(
                      (ticket) => ticket.status === 'Open'
                    ).length}
                    description="Waiting for action"
                  />

                  <StatCard
                    title="In progress"
                    value={assignedTickets.filter(
                      (ticket) => ticket.status === 'In Progress'
                    ).length}
                    description="Currently being handled"
                  />

                  <StatCard
                    title="Resolved"
                    value={assignedTickets.filter(
                      (ticket) => ticket.status === 'Resolved'
                    ).length}
                    description="Resolved tickets"
                  />
                </section>

                <section className="tickets-section">
                  <div className="section-heading">
                    <div>
                      <h2>My assigned tickets</h2>
                      <p>View tickets assigned to your account.</p>
                    </div>

                    <SearchBar
                      value={search}
                      onChange={setSearch}
                    />
                  </div>

                  {assignedTicketsLoading ? (
                    <p>Loading assigned tickets...</p>
                  ) : (
                    <TicketTable
                      tickets={filteredAssignedTickets}
                      onViewDetails={setSelectedTicket}
                    />
                  )}
                </section>
              </>
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
