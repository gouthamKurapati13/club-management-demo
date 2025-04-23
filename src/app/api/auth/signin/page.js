'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await signIn('credentials', {
            redirect: false,
            username,
            password,
        });

        if (res?.error) {
            setError('Invalid credentials');
        } else {
            if (username === "admin") {
                window.location.href = '/admin/boards';
            } else {
                window.location.href = '/staff';
            }
        }
    };

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
            <div className="w-full min-h-screen lg:grid lg:grid-cols-12 bg-white shadow-lg">
                {/* Left Section - Full Height on Large Screens */}
                <section className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 items-center justify-center">
                    <img
                        alt="Sign In"
                        src="https://www.sportsboom.com/_next/image?url=https%3A%2F%2Fassets.sportsboom.com%2FIMG_8948_262fd04423.JPG&w=3840&q=75"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                </section>

                {/* Right Section - Form */}
                <main className="w-full flex items-center justify-center px-6 py-8 sm:px-12 lg:col-span-7 xl:col-span-6">
                    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-gray-900 text-center">Sign In</h2>
                        <p className="mt-2 text-sm text-gray-600 text-center">
                            Enter your credentials to access your account
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4 w-full">
                            {/* Username Field */}
                            <div>
                                <label htmlFor="Username" className="block text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="Username"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 w-full p-3 rounded-md border border-gray-300 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="Password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="Password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 w-full p-3 rounded-md border border-gray-300 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-md transition duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            >
                                Sign In
                            </button>
                        </form>

                        {/* Pre-fill Buttons */}
                        <div className="flex justify-between mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setUsername('admin');
                                    setPassword('password123');
                                }}
                                className="w-1/2 mr-2 py-3 bg-green-600 text-white font-semibold rounded-md transition duration-300 hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                            >
                                Admin Credentials (DEMO)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setUsername('staff');
                                    setPassword('password123');
                                }}
                                className="w-1/2 ml-2 py-3 bg-yellow-600 text-white font-semibold rounded-md transition duration-300 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                            >
                                Staff Credentials (DEMO)
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </section>
    );
}
