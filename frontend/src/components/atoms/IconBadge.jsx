function IconBadge({ icon, color }) {
    return (
        <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${color}`}
            aria-hidden="true"
        >
            {icon}
        </span>
    )
}

export default IconBadge
