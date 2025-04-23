import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';

export default function TablePage() {
    const router = useRouter();
    const { id } = router.query;
    const [table, setTable] = useState(null);
    const [time, setTime] = useState("00:00:00");
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchTable();
        }
    }, [id]);

    const fetchTable = async () => {
        const response = await fetch(`/api/boards?id=${id}`);
        if (!response.ok) {
            console.error('Failed to fetch table');
            return;
        }
        const data = await response.json();
        setTable(data);
        if (data.startedAt) {
            const startTime = new Date(data.startedAt).getTime();
            const updateElapsedTime = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                setElapsedTime(elapsed);
                setTime(formatTime(elapsed));
            };

            updateElapsedTime();
            timerRef.current = setInterval(updateElapsedTime, 1000);

            return () => clearInterval(timerRef.current);
        }
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const handleReset = async () => {
        clearInterval(timerRef.current);
        setTime("00:00:00");
        setIsRunning(false);
        setElapsedTime(0);

        // Update startedAt in the database to null
        try {
            await fetch(`/api/boards?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ startedAt: null })
            });
        } catch (error) {
            console.error('Error resetting startedAt:', error.message);
        }
    };

    const handleStartStop = async () => {
        if (isRunning) {
            clearInterval(timerRef.current);
        } else {
            const startTime = Date.now() - elapsedTime;
            timerRef.current = setInterval(() => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                setElapsedTime(elapsed);
                setTime(formatTime(elapsed));
            }, 1000);

            // Update startedAt in the database
            try {
                await fetch(`/api/boards?id=${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ startedAt: new Date().toISOString() })
                });
            } catch (error) {
                console.error('Error updating startedAt:', error.message);
            }
        }
        setIsRunning(!isRunning);
    };

    if (!table) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">{table.title}</h1>
            <p className="text-lg">{table.name}</p>
            <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-700">
                    <span>Timer:</span>
                    <span className="font-mono">{time}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 mt-1">
                    <span>Price:</span>
                    <span className="font-bold">{table.price} Rs</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <button
                        onClick={handleReset}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleStartStop}
                        className={`px-4 py-2 rounded-lg transition ${isRunning ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {isRunning ? 'Stop' : 'Start'}
                    </button>
                </div>
            </div>
        </div>
    );
}
