export default function Card({ user, pagetype }) {
    // console.log(user);

    const greeting = user?.name ? (
        <div className="flex flex-col items-center p-6 bg-white rounded-lg font-bold text-5xl text-black">
            Hello {user?.name}!
        </div>
    ) : null;

    return (
        <section className="flex flex-col gap-4">
            {greeting}
            <p className="text-2xl text-center">{pagetype} Page!</p>
            <p className="text-2xl text-center">Role: {user?.role}</p>
        </section>
    );
}
