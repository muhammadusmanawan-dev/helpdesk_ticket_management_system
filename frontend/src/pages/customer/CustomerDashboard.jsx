import CustomerStatCards from '../../components/organisms/customer/CustomerStatCards'
import SplitText from '../../components/atoms/SplitText'
import AnimatedContent from '../../components/atoms/AnimatedContent'

function CustomerDashboard({ tickets = [], loading, error }) {
    if (loading) {
        return (
            <p className="text-sm text-slate-500">
                Loading your dashboard...
            </p>
        )
    }

    return (
        <AnimatedContent
            trigger="mount"
            distance={20}
            duration={0.5}
            ease="power3.out"
            initialOpacity={0}
            stagger={0.12}
            className="space-y-6"
        >
            {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Could not load tickets: {error}
                </p>
            )}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium tracking-wide text-indigo-600">
                    CUSTOMER WORKSPACE
                </p>

                <SplitText
                    text="My Dashboard"
                    tag="h2"
                    className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                    splitType="words"
                    from={{ opacity: 0, y: 25 }}
                    to={{ opacity: 1, y: 0 }}
                    duration={0.6}
                    delay={0.1}
                    stagger={0.08}
                    ease="power3.out"
                    textAlign="left"
                />

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Track your tickets and stay updated on their progress.
                </p>
            </section>
            <CustomerStatCards tickets={tickets} />
        </AnimatedContent>
    )
}

export default CustomerDashboard
