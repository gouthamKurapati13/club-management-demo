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

export default function ExtraPage() {
    const [snacks, setSnacks] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast()

    useEffect(() => {
        fetchSnacks();
    }, []);

    const fetchSnacks = async () => {
        const response = await fetch('/api/snacks');
        if (!response.ok) {
            console.error('Failed to fetch snacks');
            return;
        }
        const data = await response.json();
        setSnacks(data);
    };

    const addSnack = async () => {
        if (!name || !price) {
            toast({
                variant: "destructive",
                title: "All fields are required.",
                description: "Please fill all the fields before adding a new snack to the database.",
            });
            return;
        }
        if (price < 0) {
            alert('Price cannot be negative.');
            return;
        }
        try {
            const response = await fetch('/api/snacks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, price }),
            });
            if (!response.ok) {
                console.error('Failed to add snack');
                return;
            }
            setName('');
            setPrice('');
            fetchSnacks();
        } catch (error) {
            console.error('Error adding snack:', error);
        }
    };

    const deleteSnack = async () => {
        try {
            const response = await fetch(`/api/snacks?id=${deleteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                console.error('Failed to delete snack');
                return;
            }
            fetchSnacks();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting snack:', error);
        }
    };

    const editSnack = async () => {
        if (!name || !price) {
            alert('All fields are required.');
            return;
        }
        if (price < 0) {
            alert('Price cannot be negative.');
            return;
        }
        try {
            const response = await fetch(`/api/snacks?id=${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, price }),
            });
            if (!response.ok) {
                console.error('Failed to edit snack');
                return;
            }
            setName('');
            setPrice('');
            setEditId(null);
            fetchSnacks();
        } catch (error) {
            console.error('Error editing snack:', error);
        }
    };

    const handleEdit = (snack) => {
        setName(snack.name);
        setPrice(snack.price);
        setEditId(snack.id);
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
                <h1 className="text-5xl">Snacks & Beverages Management</h1>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    {editId ? (
                        <button onClick={editSnack} className="bg-blue-500 text-white p-2">Edit Snack</button>
                    ) : (
                        <button onClick={addSnack} className="bg-green-500 text-white p-2">Add Snack</button>
                    )}
                </div>
                <table className="mt-4 w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2">Name</th>
                            <th className="border p-2">Price</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {snacks.length > 0 ? (
                            snacks.map((snack) => (
                                <tr key={snack.id} className="border">
                                    <td className="border p-2">{snack.name}</td>
                                    <td className="border p-2">Rs. {snack.price}</td>
                                    <td className="border p-2">
                                        <button onClick={() => handleEdit(snack)} className="bg-yellow-500 text-white p-2 mr-2">Edit</button>
                                        <button onClick={() => handleDelete(snack.id)} className="bg-red-500 text-white p-2">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="border p-2 text-center">No items</td>
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
                            This action cannot be undone. This will permanently delete the snack item.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={deleteSnack}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}