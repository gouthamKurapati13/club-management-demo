'use client'

import SideNav from "@/app/components/Sidenav";
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import * as XLSX from 'xlsx';
import ReCAPTCHA from "react-google-recaptcha";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function RevenuePage() {
    const [historyData, setHistoryData] = useState([]);
    const [filter, setFilter] = useState('day'); // Default filter is 'day'
    const [filteredData, setFilteredData] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [productsSold, setProductsSold] = useState([]);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchHistoryData();
        fetchStaff();
    }, []);

    useEffect(() => {
        filterData();
    }, [filter, historyData, selectedStaff]);

    const fetchHistoryData = async () => {
        const response = await fetch('/api/history');
        if (!response.ok) {
            console.error('Failed to fetch history data');
            return;
        }
        const data = await response.json();
        setHistoryData(data);
    };

    const fetchStaff = async () => {
        const response = await fetch('/api/staff');
        if (!response.ok) {
            console.error('Failed to fetch staff data');
            return;
        }
        const data = await response.json();
        setStaff(data); // Store only staff names and IDs
    };

    const filterData = () => {
        let filtered = historyData;

        if (selectedStaff) {
            filtered = filtered.filter(item => item.staffId === parseInt(selectedStaff));
        }

        const groupedData = groupDataByFilter(filtered, filter);
        setFilteredData(groupedData);

        const products = getProductsSold(filtered);
        setProductsSold(products);
    };

    const groupDataByFilter = (data, filter) => {
        const grouped = {};

        data.forEach(item => {
            const date = new Date(item.createdAt);
            let key;

            switch (filter) {
                case 'day':
                    key = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format: YYYY-MM
                    break;
                case 'year':
                    key = date.getFullYear().toString(); // Format: YYYY
                    break;
                default:
                    key = date.toISOString().split('T')[0];
            }

            if (!grouped[key]) {
                grouped[key] = 0;
            }
            grouped[key] += item.totalPrice;
        });

        return Object.entries(grouped).map(([key, value]) => ({ date: key, totalPrice: value }));
    };

    const getProductsSold = (data) => {
        const products = {};

        data.forEach(item => {
            const productsList = JSON.parse(item.products);

            if (typeof productsList === 'object' && productsList !== null) {
                Object.values(productsList).forEach(product => {
                    if (typeof product === 'object' && product !== null) {
                        if (!products[product.name]) {
                            products[product.name] = 0;
                        }
                        products[product.name] += product.quantity;
                    }
                });
            }
        });

        return Object.entries(products).map(([name, quantity]) => ({ name, quantity }));
    };

    const handleDownload = () => {
        const worksheetData = historyData.map((item, index) => ({
            "S. no.": index + 1,
            "Billing Date": new Date(item.createdAt).toLocaleDateString(),
            "Billing Time": new Date(item.createdAt).toLocaleTimeString(),
            "Board ID": item.boardId,
            "Total Price": item.totalPrice,
            "Products": item.products,
            "Staff ID": item.staffId,
            "Customer Phone No": item.phoneNo,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Revenue Data");
        const currentDate = new Date();
        const dateString = currentDate.toLocaleDateString().replace(/\//g, '-');
        const timeString = currentDate.toLocaleTimeString().replace(/:/g, '-');
        const timestamp = `${dateString}_${timeString}`;
        XLSX.writeFile(workbook, `revenue_data_${timestamp}.xlsx`);
    };

    const handleClearHistory = async () => {
        if (!captchaVerified) {
            alert("Please complete the CAPTCHA");
            return;
        }

        const response = await fetch('/api/history', {
            method: 'DELETE',
        });
        if (!response.ok) {
            console.error('Failed to clear history');
            return;
        }
        fetchHistoryData();
        setIsDialogOpen(false);
    };

    const onCaptchaChange = (value) => {
        setCaptchaVerified(!!value);
    };

    const chartData = {
        labels: filteredData.map(item => item.date).reverse(), // Reverse order for correct month display
        datasets: [
            {
                label: 'Revenue',
                data: filteredData.map(item => item.totalPrice).reverse(), // Reverse data points too
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };


    const totalRevenue = filteredData.reduce((acc, item) => acc + item.totalPrice, 0);

    return (
        <div className="flex w-full overflow-hidden">
            <div className="w-64 h-screen fixed">
                <SideNav />
            </div>

            <div className="ml-64 flex-1 p-4 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-5xl">Revenue Management</h1>
                    <div className="flex space-x-4">
                        <button onClick={handleDownload} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                            Download as XLSX
                        </button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300">Clear History</button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Clear History</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to clear all history? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4">
                                    <ReCAPTCHA
                                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                        onChange={onCaptchaChange}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleClearHistory} disabled={!captchaVerified} className="bg-blue-600 text-white hover:bg-blue-700">Confirm</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex justify-center items-center mb-4">
                    <div className="mb-4">
                        <label className="mr-2">Filter by:</label>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="mr-4">
                            <option value="day">Day</option>
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="mr-2">Filter by Staff:</label>
                        <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)} className="mr-4">
                            <option value="">All Staff</option>
                            {staff.map((s) => (
                                <option key={s.id} value={s.id}>{s.username}</option>
                            ))}
                        </select>
                    </div>

                </div>



                <div className="w-full max-w-5xl mx-auto">
                    <Line data={chartData} />
                </div>

                <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-center text-green-600">Total Revenue: {totalRevenue} Rs</h2>
                </div>
                <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-center text-blue-600">Products Sold</h2>
                    {productsSold.length > 0 ? (
                        <ul className="mt-4">
                            {productsSold.map((product, index) => (
                                <li key={index} className="text-lg">
                                    {product.name}: <span className="font-bold">{product.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500">No products sold in the selected period.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
