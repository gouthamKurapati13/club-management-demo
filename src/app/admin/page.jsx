'use client'

import { useEffect } from "react";
import SideNav from "../components/Sidenav";

export default async function ExtraPage() {
    useEffect(() => {
        window.location.href = '/admin/boards';
      }, []);
    
      return (
        <></>
      )

}