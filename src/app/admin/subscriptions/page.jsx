'use client'
import { useState, useEffect } from 'react';
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
import SideNav from "@/app/components/Sidenav";
import { useToast } from "@/hooks/use-toast"

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [name, setName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [discount, setDiscount] = useState('');
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast()

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const response = await fetch('/api/customers');
        if (!response.ok) {
            console.error('Failed to fetch customers');
            return;
        }
        const data = await response.json();
        setCustomers(data);
    };

    const addCustomer = async () => {
        if (!name || !phoneNo || !discount) {
            toast({
                variant: "destructive",
                title: "All fields are required.",
                description: "Please fill all the fields before adding a new customer to the database.",
            });
            return;
        }
        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, phoneNo, discount }),
            });
            if (!response.ok) {
                console.error('Failed to add customer');
                return;
            }
            setName('');
            setPhoneNo('');
            setDiscount('');
            fetchCustomers();
        } catch (error) {
            console.error('Error adding customer:', error);
        }
    };

    const deleteCustomer = async () => {
        try {
            const response = await fetch(`/api/customers?id=${deleteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                console.error('Failed to delete customer');
                return;
            }
            fetchCustomers();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    const editCustomer = async () => {
        if (!name || !phoneNo || !discount) {
            alert('All fields are required.');
            return;
        }
        if (discount < 0) {
            alert('Discount cannot be negative.');
            return;
        }
        try {
            const response = await fetch(`/api/customers?id=${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, phoneNo, discount }),
            });
            if (!response.ok) {
                console.error('Failed to edit customer');
                return;
            }
            setName('');
            setPhoneNo('');
            setDiscount('');
            setEditId(null);
            fetchCustomers();
        } catch (error) {
            console.error('Error editing customer:', error);
        }
    };

    const handleEdit = (customer) => {
        setName(customer.name);
        setPhoneNo(customer.phoneNo);
        setDiscount(customer.discount);
        setEditId(customer.id);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="flex w-full h-screen overflow-hidden">
            <div className="w-64 h-full fixed">
                <SideNav />
            </div>

            <div className="ml-64 flex-1 p-4 overflow-auto">
                <h1 className="text-5xl">Customers Management</h1>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <input
                        type="text"
                        placeholder="Phone No"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <input
                        type="number"
                        placeholder="Discount"
                        value={discount}
                        min={0}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    {editId ? (
                        <button onClick={editCustomer} className="bg-blue-500 text-white p-2">Edit Customer</button>
                    ) : (
                        <button onClick={addCustomer} className="bg-green-500 text-white p-2">Add Customer</button>
                    )}
                </div>
                <table className="mt-4 w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Phone No</th>
                            <th className="border p-2">Discount</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length > 0 ? (
                            customers.map((customer) => (
                                <tr key={customer.id} className="border">
                                    <td className="border p-2">{customer.name}</td>
                                    <td className="border p-2">{customer.phoneNo}</td>
                                    <td className="border p-2">{customer.discount}%</td>
                                    <td className="border p-2">
                                        <button onClick={() => handleEdit(customer)} className="bg-yellow-500 text-white p-2 mr-2">Edit</button>
                                        <button onClick={() => handleDelete(customer.id)} className="bg-red-500 text-white p-2">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="border p-2 text-center">No customers</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={deleteCustomer}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
