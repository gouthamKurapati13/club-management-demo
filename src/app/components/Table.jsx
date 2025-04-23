import React, { useEffect, useState, useRef } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Table({ tableTitle, tableName, startedAt, price, mode = "staff", id }) {
    const [time, setTime] = useState("00:00:00");
    const [totalPrice, setTotalPrice] = useState("0.00");
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (startedAt) {
            const startTime = new Date(startedAt).getTime();
            const updateElapsedTime = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                setElapsedTime(elapsed);
                setTime(formatTime(elapsed));
                setTotalPrice(calculatePrice(elapsed, price));
            };

            updateElapsedTime();
            timerRef.current = setInterval(updateElapsedTime, 1000);

            return () => clearInterval(timerRef.current);
        }
    }, [startedAt]);

    useEffect(() => {
        if (id) {
            fetchTotalPrice(id);
        }
    }, [id]);

    const fetchTotalPrice = async (id) => {
        try {
            const response = await fetch(`/api/boards?id=${id}`);
            if (!response.ok) {
                console.error('Failed to fetch total price');
                return;
            }
            const data = await response.json();
            setTotalPrice(data.totalPrice ? `${data.totalPrice} Rs` : "0.00 Rs");
        } catch (error) {
            console.error('Error fetching total price:', error);
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
        setTotalPrice("0.00 Rs");
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

    const calculatePrice = (milliseconds, pricePerHour) => {
        const hours = milliseconds / 3600000;
        const totalPrice = (hours * pricePerHour).toFixed(2);
        return parseFloat(totalPrice);
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
                setTotalPrice(calculatePrice(elapsed, data.price));
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

    return (
        <div className={`bg-white shadow-lg rounded-lg p-4 border ${startedAt ? 'border-blue-500 shadow-blue-500/50 ring-4' : 'border-gray-200'}`}>
            {/* Image Section */}
            <div className="relative">
                <img
                    src="https://www.sportsboom.com/_next/image?url=https%3A%2F%2Fassets.sportsboom.com%2FIMG_9385_cb671ea36b.JPG&w=3840&q=75"
                    alt="Table"
                    className="w-full h-40 object-cover rounded-lg"
                />
                <button className="absolute top-2 right-2 text-gray-500">
                    <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
                </button>

                {/* Edit/Remove Options */}
                <div className="absolute top-10 right-2 bg-white shadow-md rounded-md p-2 hidden group-hover:block">
                    <div
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-500 cursor-pointer"
                        data-bs-toggle="modal"
                        data-bs-target="#edit-modal"
                    >
                        <i className="fa fa-pencil"></i>
                        <span>Edit</span>
                    </div>
                    <div
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 cursor-pointer mt-2"
                        data-bs-toggle="modal"
                        data-bs-target="#remove-table-modal"
                    >
                        <i className="fa fa-trash-o"></i>
                        <span>Remove</span>
                    </div>
                </div>
            </div>

            <div className="text-center mt-4">
                <h3 className="text-lg font-bold text-gray-800 capitalize">{tableTitle}</h3>
                <span className="text-sm text-gray-500 capitalize">{tableName}</span>
            </div>

            {mode === "staff" && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-700">
                        <span>Timer:</span>
                        <span className="font-mono">{time}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 mt-1">
                        <span>Price:</span>
                        <span className="font-bold">Rs. {totalPrice}</span>
                    </div>
                </div>
            )}

            {mode === "admin" && (
                <div className="mt-1">
                    <div className="flex justify-center gap-2 text-sm text-gray-700 mt-1">
                        <span>Price (per hr.): </span>
                        <span className="font-bold">Rs. {price}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
