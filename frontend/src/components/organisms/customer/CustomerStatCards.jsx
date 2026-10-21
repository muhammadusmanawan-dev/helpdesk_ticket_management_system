import { Ticket, Clock3, LoaderCircle, CircleCheck } from 'lucide-react'
import StatCard from '../../molecules/StatCard'

const statistics = [
    { key: 'total', title: 'Total tickets', description: 'Your support requests', icon: Ticket, color: 'bg-blue-50 text-blue-700' },
    { key: 'open', title: 'Open', description: 'Waiting for action', icon: Clock3, color: 'bg-amber-50 text-amber-700' },
    { key: 'inProgress', title: 'In progress', description: 'Currently being handled', icon: LoaderCircle, color: 'bg-cyan-50 text-cyan-700' },
    { key: 'resolved', title: 'Resolved', description: 'Resolved support requests', icon: CircleCheck, color: 'bg-emerald-50 text-emerald-700' },
]

function CustomerStatCards({ tickets = [] }) {
    const counts = { total: tickets.length, open: 0, inProgress: 0, resolved: 0 }

    tickets.forEach((ticket) => {
        const status = ticket.status?.toLowerCase()
        if (status === 'open') counts.open++
        else if (status === 'in progress') counts.inProgress++
        else if (status === 'resolved') counts.resolved++
    })

    return (
        <section aria-label="Customer ticket statistics" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((stat) => (
                <StatCard key={stat.key} title={stat.title} value={counts[stat.key]} description={stat.description} icon={stat.icon} color={stat.color} />
            ))}
        </section>
    )
}

export default CustomerStatCards
