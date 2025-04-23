'use client'

import { useEffect } from "react";


export default async function Home() {

  useEffect(() => {
    window.location.href = '/api/auth/signin';
  }, []);

  return (
    <></>
  )
}