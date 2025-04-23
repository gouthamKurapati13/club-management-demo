'use client'
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSession } from 'next-auth/react';

export default function TablePage() {
    const pathname = usePathname();
    const id = pathname.split('/').pop();
    const [table, setTable] = useState(null);
    const [time, setTime] = useState("00:00:00");
    const [price, setPrice] = useState("0.00 Rs");
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [snacks, setSnacks] = useState([]);
    const [cart, setCart] = useState({});
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [discount, setDiscount] = useState(0);
    const [totalPrice, setTotalPrice] = useState("0.00 Rs");
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [isGenerateInvoice, setGenerateInvoice] = useState(false);
    const timerRef = useRef(null);
    const { data: session } = useSession();

    useEffect(() => {
        if (id) {
            fetchTable();
            fetchSnacks();
        }
    }, [id]);

    useEffect(() => {
        setTotalPrice(calculateTotalPrice(cart));
        console.log(cart);
        if (cart.timerPrice) {
            setGenerateInvoice(true);
            setIsRunning(true);
        } else {
            setGenerateInvoice(false);
            setIsRunning(false);
        }
    }, [cart, discount]);

    const fetchTable = async () => {
        const response = await fetch(`/api/boards?id=${id}`);
        if (!response.ok) {
            console.error('Failed to fetch table');
            return;
        }
        const data = await response.json();
        setTable(data);
        if (data.products) {
            setCart(JSON.parse(data.products));
            console.log(cart);
        }
        if (data.startedAt && !data.endedAt) {
            const startTime = new Date(data.startedAt).getTime();
            const updateElapsedTime = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                setElapsedTime(elapsed);
                setTime(formatTime(elapsed));
                setPrice(calculatePrice(elapsed, data.price));
            };

            updateElapsedTime();
            timerRef.current = setInterval(updateElapsedTime, 1000);
            setIsRunning(true);
            return () => clearInterval(timerRef.current);
        } else {
            setTime("00:00:00");
            setPrice("0.00 Rs");
            setIsRunning(false);
        }
    };

    const fetchSnacks = async () => {
        const response = await fetch('/api/snacks');
        if (!response.ok) {
            console.error('Failed to fetch snacks');
            return;
        }
        const data = await response.json();
        setSnacks(data);
    };

    const fetchCustomerDiscount = async (phone) => {
        const response = await fetch(`/api/customers?phone=${phone}`);
        if (response.status === 404) {
            setDiscount(0);
            setIsCustomerDialogOpen(true);
            return;
        }
        if (!response.ok) {
            console.error('Failed to fetch customer discount');
            return;
        }
        const text = await response.text();
        if (!text) {
            console.error('Empty response body');
            return;
        }
        const data = JSON.parse(text);
        setDiscount(data.discount || 0);
        setCustomerName(data.name);
    };

    const addCustomer = async () => {
        try {
            await fetch(`/api/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: customerName, phoneNo: customerPhone, discount: 0 })
            });
            setIsCustomerDialogOpen(false);
        } catch (error) {
            console.error('Error adding customer:', error.message);
        }
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const calculatePrice = (milliseconds, pricePerHour) => {
        const hours = milliseconds / 3600000;
        const totalPrice = (hours * pricePerHour).toFixed(2);
        return parseFloat(totalPrice);
    };

    const calculateTotalPrice = (cart) => {
        let total = 0;
        Object.keys(cart).forEach(key => {
            if (key !== 'timerDuration' && key !== 'timerPrice') {
                total += cart[key].price * cart[key].quantity;
            }
        });
        if (cart.timerPrice) {
            total += cart.timerPrice * (1 - discount / 100);
        }
        return total.toFixed(2);
    };

    const handleReset = async () => {
        clearInterval(timerRef.current);
        setTime("00:00:00");
        setPrice("0.00 Rs");
        setIsRunning(false);
        setElapsedTime(0);
        timerRef.current = null;

        // Calculate total price and floor it to the nearest integer
        const totalPrice = Math.floor(elapsedTime / 3600000 * table.price);

        // Add timer duration and price to products JSON
        const updatedCart = {
            ...cart,
            timerDuration: formatTime(elapsedTime),
            timerPrice: totalPrice
        };

        console.log(updatedCart);

        if (!updatedCart.timerPrice) {
            await fetch(`/api/boards?id=${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startedAt: null,
                    endedAt: null,
                    products: null,
                    totalPrice: 0,
                }),
            });
            window.location.href = '/staff';
        } else {
            // Update startedAt, endedAt, totalPrice, and products in the database
            try {
                await fetch(`/api/boards?id=${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ startedAt: table.startedAt, endedAt: new Date().toISOString(), totalPrice: parseInt(calculateTotalPrice(updatedCart), 10), products: JSON.stringify(updatedCart) })
                });
                setTable((prevTable) => ({ ...prevTable, startedAt: table.startedAt, endedAt: new Date().toISOString(), totalPrice: parseInt(calculateTotalPrice(updatedCart), 10), products: JSON.stringify(updatedCart) }));
            } catch (error) {
                console.error('Error resetting startedAt:', error.message);
            }
            window.location.reload();
        }
    };

    const handleStart = async () => {
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            setElapsedTime(elapsed);
            setTime(formatTime(elapsed));
            setPrice(calculatePrice(elapsed, table.price));
            window.location.reload();
        }, 1000);

        // Update startedAt in the database
        try {
            await fetch(`/api/boards?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ startedAt: new Date().toISOString(), endedAt: null, products: JSON.stringify(cart), totalPrice: 0 })
            });
        } catch (error) {
            console.error('Error updating startedAt:', error.message);
        }
        setIsRunning(true);
    };

    const handleAddSnack = async (snack) => {
        const newCart = { ...cart };
        if (newCart[snack.id]) {
            newCart[snack.id].quantity += 1;
        } else {
            newCart[snack.id] = { ...snack, quantity: 1 };
        }
        setCart(newCart);

        // Update products and totalPrice in the database
        try {
            await fetch(`/api/boards?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ products: JSON.stringify(newCart), totalPrice: parseInt(calculateTotalPrice(newCart), 10), startedAt: table.startedAt })
            });
        } catch (error) {
            console.error('Error updating products:', error.message);
        }
    };

    const handleRemoveSnack = async (snack) => {
        const newCart = { ...cart };
        if (newCart[snack.id]) {
            newCart[snack.id].quantity -= 1;
            if (newCart[snack.id].quantity === 0) {
                delete newCart[snack.id];
            }
        }
        setCart(newCart);

        // Update products and totalPrice in the database
        try {
            await fetch(`/api/boards?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ products: JSON.stringify(newCart), totalPrice: parseInt(calculateTotalPrice(newCart), 10), startedAt: table.startedAt })
            });
        } catch (error) {
            console.error('Error updating products:', error.message);
        }
    };

    const handleClearCart = async () => {
        setCart({});
        setTotalPrice("0.00 Rs");

        // Update products and totalPrice in the database
        try {
            await fetch(`/api/boards?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ products: null, totalPrice: 0, startedAt: table.startedAt })
            });
        } catch (error) {
            console.error('Error clearing cart:', error.message);
        }
    };

    const handleGenerateInvoice = async () => {
        const invoice = new jsPDF();

        // Title
        invoice.setFont("helvetica", "bold");
        invoice.setFontSize(22);
        invoice.text("INVOICE", 105, 20, { align: "center" });

        // Prepare the Table Data
        const tableData = [
            // Customer & Payment Details (Box Layout)
            [{ content: "Customer Details", colSpan: 4, styles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" } }],
            ["Customer Name", customerName || "N/A", "Phone", customerPhone || "N/A"],
            ["Payment Method", paymentMethod || "N/A", "Billing Date", new Date().toLocaleString()],

            // Empty Row for Spacing
            [{ content: "", colSpan: 4, styles: { fillColor: [255, 255, 255] } }],

            // Purchased Items Header
            [{ content: "Purchased Items", colSpan: 4, styles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" } }],
            ["Item", "Quantity", "Price per Unit (Rs)", "Total Price (Rs)"],
            ...Object.keys(cart)
                .filter(key => key !== "timerDuration" && key !== "timerPrice")
                .map(key => [
                    cart[key].name,
                    cart[key].quantity,
                    cart[key].price,
                    (cart[key].price * cart[key].quantity).toFixed(2)
                ]),

            // Empty Row for Spacing
            [{ content: "", colSpan: 4, styles: { fillColor: [255, 255, 255] } }]
        ];

        // Timer Details (If applicable)
        if (cart.timerDuration && cart.timerPrice !== undefined) {
            tableData.push(
                [{ content: "Timer Details", colSpan: 4, styles: { fillColor: [243, 156, 18], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" } }],
                ["Started At", new Date(table.startedAt).toLocaleString(), "Ended At", new Date(table.endedAt).toLocaleString()],
                ["Timer Duration", cart.timerDuration, "Timer Price (Rs)", cart.timerPrice]
            );
            tableData.push([{ content: "", colSpan: 4, styles: { fillColor: [255, 255, 255] } }]); // Spacer
        }

        // Summary Section (Discount & Total)
        tableData.push(
            [{ content: "Summary", colSpan: 4, styles: { fillColor: [192, 57, 43], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" } }],
            ["Discount (%)", discount, "Total Amount (Rs)", calculateTotalPrice(cart)]
        );

        // Generate Table
        invoice.autoTable({
            startY: 30,
            body: tableData,
            theme: "grid",
            styles: { halign: "center", fontSize: 12, cellPadding: 5 },
            columnStyles: { 0: { fontStyle: "bold" } }
        });

        // Save Invoice with Timestamp
        const currentDate = new Date();
        const timestamp = currentDate.toISOString().replace(/[-:]/g, "_").split(".")[0];
        invoice.save(`invoice_${timestamp}.pdf`);

        // Store details in the history table and clear the cart
        try {
            await fetch(`/api/history`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boardId: id,
                    totalPrice: parseInt(calculateTotalPrice(cart), 10),
                    products: JSON.stringify(cart),
                    staffName: session.user.name,
                    customer: customerPhone,
                    createdAt: new Date().toISOString(),
                }),
            });

            console.log("History updated!");

            await fetch(`/api/boards?id=${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startedAt: null,
                    endedAt: null,
                    products: null,
                    totalPrice: 0,
                }),
            });

            setCart({});
            setTotalPrice("0.00 Rs");
        } catch (error) {
            console.error("Error storing details in history:", error.message);
        }

        window.location.href = '/staff';
    };




    if (!table) return <p>Loading...</p>;

    return (
        <div className="p-6 w-full overflow-y-auto max-h-[90vh]">
            <h1 className="text-3xl font-bold text-center mb-4 mt-4 capitalize">{table.title}</h1>
            <p className="text-xl text-center text-gray-600 mb-6 capitalize">{table.name}</p>
            <div className="mt-4 flex flex-col lg:flex-row justify-between align-center gap-4">
                <div className='w-full lg:w-1/2 mx-auto bg-white p-6 rounded-lg shadow-lg'>
                    <div className="flex justify-between text-lg text-gray-700 mb-2">
                        <span>Timer:</span>
                        <span className="font-mono">
                            {table.startedAt && table.endedAt && cart.timerDuration}
                            {((table.startedAt && !table.endedAt) || (!table.startedAt && !table.endedAt)) && time}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg text-gray-700 mb-2">
                        <span>Price per hour:</span>
                        <span>Rs. {table.price}</span>
                    </div>
                    <div className="flex justify-between text-lg text-gray-700 mb-2">
                        <span>Total Price:</span>
                        <span className="font-bold">
                            {table.startedAt && table.endedAt && 'Rs. ' + cart.timerPrice}
                            {((table.startedAt && !table.endedAt) || (!table.startedAt && !table.endedAt)) && 'Rs. ' + price}
                        </span>
                    </div>
                    {table.startedAt && (
                        <div className="flex justify-between text-lg text-gray-700 mb-2">
                            <span>Started At:</span>
                            <span className="font-mono">{new Date(table.startedAt).toLocaleString()}</span>
                        </div>
                    )}
                    {table.endedAt && (
                        <div className="flex justify-between text-lg text-gray-700 mb-2">
                            <span>Ended At:</span>
                            <span className="font-mono">{new Date(table.endedAt).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <button
                            onClick={handleStart}
                            className="px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={table.startedAt}
                        >
                            Start
                        </button>
                        <AlertDialog>
                            <AlertDialogTrigger className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={isGenerateInvoice || (!table.startedAt && !table.endedAt)}>Stop</AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        The timer will be reset completely and cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleReset} className="bg-blue-600 text-white hover:bg-blue-700">Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold mb-4">Snacks</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {snacks.map((snack) => (
                                <div key={snack.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                                    <span>{snack.name}</span>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleRemoveSnack(snack)}
                                            className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                                        >
                                            -
                                        </button>
                                        <span className="mx-2">{cart[snack.id]?.quantity || 0}</span>
                                        <button
                                            onClick={() => handleAddSnack(snack)}
                                            className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 mx-auto bg-white p-6 rounded-lg shadow-lg">
                    <div>
                        <div className='flex justify-between mb-5'>
                            <h2 className="text-2xl font-bold">Cart</h2>
                            <button
                                onClick={handleClearCart}
                                className="mt-4 px-4 py-2 rounded-lg transition bg-red-600 text-white hover:bg-red-700 mt-auto"
                            >
                                Clear Cart
                            </button>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <table className="min-w-full bg-white border rounded-lg shadow-md">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 border text-left px-4">Product</th>
                                        <th className="py-2 border text-left px-4">Quantity</th>
                                        <th className="py-2 border text-left px-4">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(cart).filter(key => key !== 'timerDuration' && key !== 'timerPrice').length > 0 ? (
                                        Object.keys(cart).filter(key => key !== 'timerDuration' && key !== 'timerPrice').map((key) => (
                                            <tr key={key} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2 capitalize">{cart[key].name}</td>
                                                <td className="border px-4 py-2">{cart[key].quantity}</td>
                                                <td className="border px-4 py-2">{(cart[key].price * cart[key].quantity).toFixed(2)} Rs</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="border px-4 py-2 text-center text-gray-500">No items in cart</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {cart.timerDuration && cart.timerPrice !== undefined && (
                                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-md mt-4">
                                    <span className="text-lg font-semibold text-gray-700">Timer Duration: {cart.timerDuration}</span>
                                    <span className="text-lg font-bold text-black-600">Rs. {cart.timerPrice}</span>
                                </div>

                            )}
                            <div className="flex justify-between mt-4 font-bold text-lg">
                                <span>Discount:</span>
                                <span>{discount}%</span>
                            </div>
                            <div className="flex justify-between mt-4 font-bold text-lg">
                                <span>Total:</span>
                                <span>{totalPrice} Rs</span>
                            </div>
                            <div className="flex justify-between mt-4 font-bold text-lg">
                                <span>Customer Name:</span>
                                <span>{customerName}</span>
                            </div>
                            <div className="mt-4 flex justify-between align-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter customer phone number"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="border p-2 rounded-lg w-full"
                                    required
                                />
                                <button
                                    onClick={() => fetchCustomerDiscount(customerPhone)}
                                    className="mt-2 px-4 py-2 rounded-lg transition bg-blue-600 text-white hover:bg-blue-700 mt-auto"
                                >
                                    Check
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
                        <div className="flex items-center mb-4">
                            <input
                                type="radio"
                                id="cash"
                                name="paymentMethod"
                                value="cash"
                                checked={paymentMethod === "cash"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-2"
                            />
                            <label htmlFor="cash" className="mr-4">Cash</label>
                            <input
                                type="radio"
                                id="online"
                                name="paymentMethod"
                                value="online"
                                checked={paymentMethod === "online"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-2"
                            />
                            <label htmlFor="online">Online</label>
                        </div>
                        <div className='flex justify-center align-center'>
                            <button
                                onClick={handleGenerateInvoice}
                                className="px-4 py-2 rounded-lg transition bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!isGenerateInvoice}
                            >
                                Generate Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <AlertDialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Enter Customer Name</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please enter the customer name to add them to the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Enter customer name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="border p-2 rounded-lg w-full"
                            required
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-blue-600 text-white hover:bg-blue-700" onClick={addCustomer}>Add Customer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
