import { Ticket, Clock3, ArrowUpRight, LoaderCircle, CircleCheck, Archive } from 'lucide-react'
import StatCard from '../../molecules/StatCard'

const statistics = [
    { key: 'total', title: 'Total Assigned', description: 'Tickets assigned to you', icon: Ticket, color: 'bg-blue-50 text-blue-700' },
    { key: 'open', title: 'Open', description: 'Waiting for action', icon: Clock3, color: 'bg-amber-50 text-amber-700' },
    { key: 'assigned', title: 'Assigned', description: 'Tickets awaiting work', icon: ArrowUpRight, color: 'bg-violet-50 text-violet-700' },
    { key: 'inProgress', title: 'In Progress', description: 'Currently being handled', icon: LoaderCircle, color: 'bg-cyan-50 text-cyan-700' },
    { key: 'resolved', title: 'Resolved', description: 'Successfully resolved', icon: CircleCheck, color: 'bg-emerald-50 text-emerald-700' },
    { key: 'closed', title: 'Closed', description: 'Closed tickets', icon: Archive, color: 'bg-slate-100 text-slate-700' },
]

function AgentStatCards({ tickets = [] }) {
    const counts = { total: tickets.length, open: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0 }

    tickets.forEach((ticket) => {
        const status = ticket.status?.toLowerCase()
        if (status === 'open') counts.open++
        else if (status === 'assigned') counts.assigned++
        else if (status === 'in progress') counts.inProgress++
        else if (status === 'resolved') counts.resolved++
        else if (status === 'closed') counts.closed++
    })

    return (
        <section aria-label="Agent ticket statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statistics.map((stat) => (
                <StatCard key={stat.key} title={stat.title} value={counts[stat.key]} description={stat.description} icon={stat.icon} color={stat.color} />
            ))}
        </section>
    )
}

export default AgentStatCards
