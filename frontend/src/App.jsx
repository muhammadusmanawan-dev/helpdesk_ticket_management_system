
import { useState } from 'react'
import Sidebar from './components/organisms/Sidebar'
import StatCard from './components/molecules/StatCard'
import SearchBar from './components/molecules/SearchBar'
import TicketTable from './components/organisms/TicketTable'
import './App.css'

const sampleTickets = [
  {
    id: 104,
    title: 'Internet is not working',
    customer: 'Ali Khan',
    priority: 'High',
    status: 'Open',
  },
  {
    id: 103,
    title: 'Unable to reset password',
    customer: 'Sara Ahmed',
    priority: 'Medium',
    status: 'In Progress',
  },
  {
    id: 102,
    title: 'Request for account access',
    customer: 'Usman Malik',
    priority: 'Low',
    status: 'Resolved',
  },
  {
    id: 101,
    title: 'Application is running slowly',
    customer: 'Ayesha Noor',
    priority: 'High',
    status: 'Open',
  },
]

function App() {
  const [search, setSearch] = useState('')

  const filteredTickets = sampleTickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  )

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
            <div className="avatar">U</div>
            <div>User</div>
          </div>
        </header>


        <section className="welcome-section">
          <div>
            <p className="eyebrow">TICKET WORKSPACE</p>
            <h2>Welcome back!</h2>
            <p>Here is an overview of your support tickets.</p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => alert('We will build ticket creation next.')}
          >
            + Create ticket
          </button>
        </section>


        <section className="stats-grid">
          <StatCard
            title="Total tickets"
            value={sampleTickets.length}
            description="All sample tickets"
          />

          <StatCard
            title="Open"
            value={sampleTickets.filter((ticket) => ticket.status === 'Open').length}
            description="Waiting for action"
          />

          <StatCard
            title="In progress"
            value={sampleTickets.filter((ticket) => ticket.status === 'In Progress').length}
            description="Currently being handled"
          />

          <StatCard
            title="Resolved"
            value={sampleTickets.filter((ticket) => ticket.status === 'Resolved').length}
            description="Completed tickets"
          />
        </section>


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

          <TicketTable tickets={filteredTickets} />
        </section>
      </main>
    </div>
  )
}

export default App
