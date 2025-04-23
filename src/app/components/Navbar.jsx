'use client'

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { FaUserCircle } from 'react-icons/fa'

export default function Navbar() {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/staff'}>
                <Image src="/assets/logo.png" alt="Logo" width={50} height={50} />
                <span className="text-blue-800 text-xl font-semibold ml-2">Club Management (DEMO)</span>
            </div>
            <ul className="flex justify-evenly text-xl font-semibold text-blue-800">
                {/* <li className="mx-4 hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105"><Link href="/">Home</Link></li>
                {!session && (
                    <li className="mx-4 hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105"><Link href="/api/auth/signin">Sign In</Link></li>
                )}
                <li className="mx-4 hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105"><Link href="/staff">Staff</Link></li>
                <li className="mx-4 hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105"><Link href="/admin">Admin</Link></li> */}
                {session && (
                    <li className="relative mx-4">
                        <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
                            <FaUserCircle size={40} className="text-blue-800" />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                                <div className="px-4 py-2 text-gray-800">{session.user.name}</div>
                                <hr className="my-2 border-gray-700" />
                                <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200">Sign Out</button>
                            </div>
                        )}
                    </li>
                )}
            </ul>
        </nav>
    )
}