import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';
import AuthProvider from './context/AuthProvider';
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Club Management',
  description: 'Club Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + ' lg:overflow-hidden'}>
        <AuthProvider>
          <div className='sticky top-0 z-50'>
          <Navbar />
          </div>
          <Toaster />
          <main className="flex justify-center items-start min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
