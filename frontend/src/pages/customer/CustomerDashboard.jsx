import { useQuery } from '@tanstack/react-query'
import { getCustomerDashboardSummary } from '../../services/ticketService'
import CustomerStatCards from '../../components/organisms/customer/CustomerStatCards'
import SplitText from '../../components/atoms/SplitText'
import AnimatedContent from '../../components/atoms/AnimatedContent'

function CustomerDashboard() {
    const { data: summary, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['customerDashboardSummary'],
        queryFn: getCustomerDashboardSummary,
    })

    if (isLoading) return <p className="text-sm text-slate-500">Loading your dashboard...</p>

    if (error) {
        return <section className="rounded-2xl border border-red-200 bg-red-50 p-6"><p className="text-sm text-red-700">Could not load dashboard: {error.message}</p><button type="button" onClick={() => refetch()} className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white">Try again</button></section>
    }

    return (
        <AnimatedContent trigger="mount" distance={20} duration={0.5} ease="power3.out" initialOpacity={0} stagger={0.12} className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium tracking-wide text-indigo-600">CUSTOMER WORKSPACE</p>
                        <SplitText text="My Dashboard" tag="h2" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" splitType="words" from={{ opacity: 0, y: 25 }} to={{ opacity: 1, y: 0 }} duration={0.6} delay={0.1} stagger={0.08} ease="power3.out" textAlign="left" />
                        <p className="mt-2 text-sm leading-6 text-slate-500">Track your tickets and stay updated on their progress.</p>
                    </div>
                    <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{isFetching ? 'Refreshing...' : 'Refresh data'}</button>
                </div>
            </section>
            <CustomerStatCards summary={summary} />
        </AnimatedContent>
    )
}

export default CustomerDashboard
