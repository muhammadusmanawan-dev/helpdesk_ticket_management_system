
import { useEffect, useState } from 'react'

import Sidebar from './components/organisms/Sidebar'
import LoginForm from './components/organisms/LoginForm'
import StatCard from './components/molecules/StatCard'
import SearchBar from './components/molecules/SearchBar'
import TicketTable from './components/organisms/TicketTable'
import CreateTicketForm from './components/organisms/CreateTicketForm'

import { loginUser, getAccessToken, logoutUser } from './services/authService'
import { getCustomerTickets, createCustomerTicket } from './services/ticketService'

import './App.css'

function App() {
  const [token, setToken] = useState(() => getAccessToken())
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')

  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [ticketsError, setTicketsError] = useState('')

  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  async function handleLogin(email, password) {
    setLoginLoading(true)
    setLoginError('')

    try {
      const data = await loginUser(email, password)
      setToken(data.access_token)
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setLoginLoading(false)
    }
  }

  function handleLogout() {
    logoutUser()
    setToken(null)
    setTickets([])
    setSearch('')
    setTicketsError('')
  }

  async function handleCreateTicket(ticketData) {
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    try {
      const newTicket = await createCustomerTicket(ticketData, token)

      setTickets((currentTickets) => [
        newTicket,
        ...currentTickets,
      ])

      setCreateSuccess('Ticket created successfully!')
      return true
    } catch (error) {
      setCreateError(error.message)
      return false
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function loadTickets() {
      setTicketsLoading(true)
      setTicketsError('')

      try {
        const data = await getCustomerTickets(token)

        if (!cancelled) {
          setTickets(data)
        }
      } catch (error) {
        if (!cancelled) {
          setTicketsError(error.message)

          if (error.message.includes('401')) {
            logoutUser()
            setToken(null)
          }
        }
      } finally {
        if (!cancelled) {
          setTicketsLoading(false)
        }
      }
    }

    loadTickets()

    return () => {
      cancelled = true
    }
  }, [token])

  const filteredTickets = tickets.filter((ticket) =>
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
            <span>User</span>
            <button
              className="logout-button"
              type="button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">TICKET WORKSPACE</p>
            <h2>Welcome back!</h2>
            <p>Here is an overview of your support tickets.</p>
          </div>
        </section>

        {ticketsError && (
          <p className="api-error">
            Could not load tickets: {ticketsError}
          </p>
        )}

        <section className="stats-grid">
          <StatCard
            title="Total tickets"
            value={tickets.length}
            description="Tickets loaded from backend"
          />

          <StatCard
            title="Open"
            value={tickets.filter((ticket) => ticket.status === 'Open').length}
            description="Waiting for action"
          />

          <StatCard
            title="In progress"
            value={tickets.filter((ticket) => ticket.status === 'In Progress').length}
            description="Currently being handled"
          />

          <StatCard
            title="Resolved"
            value={tickets.filter((ticket) => ticket.status === 'Resolved').length}
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

            <SearchBar value={search} onChange={setSearch} />
          </div>

          {ticketsLoading ? (
            <p>Loading tickets...</p>
          ) : (
            <TicketTable tickets={filteredTickets} />
          )}
        </section>
      </main>
    </div>
  )
}



export default App
