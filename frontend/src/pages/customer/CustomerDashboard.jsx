import StatCard from '../../components/molecules/StatCard'
import CustomerStatCards from '../../components/organisms/customer/CustomerStatCards'

function CustomerDashboard({ tickets = [], loading, error }) {
    if (loading) {
        return (
            <p className="text-sm text-slate-500">
                Loading your dashboard...
            </p>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Could not load tickets: {error}
                </p>
            )}
            <CustomerStatCards tickets={tickets} />
        </div>
    )
}

export default CustomerDashboard
