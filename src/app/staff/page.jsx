'use client'
// Remember you must use an AuthProvider for
// client components to useSession
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import UserCard from '../components/UserCard'
import Table from '../components/Table'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientPage() {
    // const { data: session } = useSession({
    //     required: true,
    //     onUnauthenticated() {
    //         redirect('/api/auth/signin?callbackUrl=/client')
    //     }
    // })

    // if (!session?.user) return


    const [boards, setBoards] = useState([]);

    const fetchBoards = async () => {
        const response = await fetch('/api/boards');
        if (!response.ok) {
            console.error('Failed to fetch boards');
            return;
        }
        const data = await response.json();
        data.map((board) => (
            console.log(board)
        ))
        setBoards(data);
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    return (
        <section className="flex flex-wrap gap-6 p-6 overflow-y-auto max-h-[90vh] justify-center">
            {boards.length > 0 ? (
                boards.map((board) => (
                    <Link key={board.id} href={`/tables/${board.id}`}>
                        <Table 
                            id={board.id} 
                            tableTitle={board.title} 
                            tableName={board.name} 
                            price={board.price} 
                            startedAt={board.startedAt} 
                        />
                    </Link>
                ))
            ) : (
                <p>No boards available</p>
            )}
        </section>
    )
}