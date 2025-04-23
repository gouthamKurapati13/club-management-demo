"use client";

import React, { useEffect } from 'react'
import { LibraryBig, MessageSquareMore, AreaChart, ShieldPlus, Dices, Users, Popcorn, HandCoins, SquareUser } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SideNav = () => {

    const menuList = [
        { id: 1, name: "Boards", icon: Dices, link: "/admin/boards" },
        { id: 2, name: "Snacks & Beverages", icon: Popcorn, link: "/admin/snacks" },
        { id: 3, name: "Subscriptions", icon: SquareUser, link: "/admin/subscriptions" },
        { id: 4, name: "Staff", icon: Users, link: "/admin/staff" },
        { id: 5, name: "Revenue", icon: HandCoins, link: "/admin/revenue" },
    ]

    const PathName = usePathname();

    useEffect(() => { }, [PathName]);

    return (
        <div className='h-screen shadow-lg border p-5 rounded-r-xl'>
            <div>
                {menuList.map((menu, index) => (
                    <Link key={index} href={menu.link} className={`flex items-center gap-3 p-3 hover:bg-blue-700 hover:text-white rounded-lg cursor-pointer mb-3 ${menu.link === PathName && 'bg-blue-700 text-white'}`}>
                        <menu.icon />
                        {menu.name}
                    </Link>
                ))}
            </div>
            <div className='fixed bottom-10 pr-10 w-64'>
                <Link href="/staff" target='_blank'><Button className='w-full bg-blue-700 hover:bg-blue-600 '>Staff Page</Button></Link>

                {/* <CreateForm className='w-full' isSideNav={true} /> */}
                {/* <h2 className='text-center my-2 leading-[1rem]'>Created by <br/> <Link href="https://gouthamkurapati.co/" target="_blank" className='underline text-blue-400 italic'>Goutham Kurapati</Link></h2> */}
            </div>
        </div>
    )
}

export default SideNav;