import { Ticket, Clock3, LoaderCircle, CircleCheck } from 'lucide-react'
import StatCard from '../../molecules/StatCard'

const statistics = [
    { key: 'total_tickets', title: 'Total tickets', description: 'Your support requests', icon: Ticket, color: 'bg-blue-50 text-blue-700' },
    { key: 'open_tickets', title: 'Open', description: 'Waiting for action', icon: Clock3, color: 'bg-amber-50 text-amber-700' },
    { key: 'in_progress_tickets', title: 'In progress', description: 'Currently being handled', icon: LoaderCircle, color: 'bg-cyan-50 text-cyan-700' },
    { key: 'resolved_tickets', title: 'Resolved', description: 'Resolved support requests', icon: CircleCheck, color: 'bg-emerald-50 text-emerald-700' },
]

function CustomerStatCards({ summary = {} }) {
    return (
        <section aria-label="Customer ticket statistics" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((stat) => (
                <StatCard key={stat.key} title={stat.title} value={summary[stat.key] ?? 0} description={stat.description} icon={stat.icon} color={stat.color} />
            ))}
        </section>
    )
}

export default CustomerStatCards
