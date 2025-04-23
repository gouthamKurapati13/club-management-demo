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

export default function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [editId, setEditId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast()

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        const response = await fetch('/api/staff');
        if (!response.ok) {
            console.error('Failed to fetch staff');
            return;
        }
        const data = await response.json();
        setStaff(data);
    };

    const addStaff = async () => {
        if (!username || !password) {
            toast({
                variant: "destructive",
                title: "All fields are required.",
                description: "Please fill all the fields before adding a new staff to the database.",
            });
            return;
        }
        try {
            const response = await fetch('/api/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                console.error('Failed to add staff');
                return;
            }
            setUsername('');
            setPassword('');
            fetchStaff();
        } catch (error) {
            console.error('Error adding staff:', error);
        }
    };

    const deleteStaff = async () => {
        try {
            const response = await fetch(`/api/staff?id=${deleteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                console.error('Failed to delete staff');
                return;
            }
            fetchStaff();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const editStaff = async () => {
        if (!username || !password) {
            alert('All fields are required.');
            return;
        }
        try {
            const response = await fetch(`/api/staff?id=${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                console.error('Failed to edit staff');
                return;
            }
            setUsername('');
            setPassword('');
            setEditId(null);
            fetchStaff();
        } catch (error) {
            console.error('Error editing staff:', error);
        }
    };

    const handleEdit = (staff) => {
        setUsername(staff.username);
        setPassword(staff.password);
        setEditId(staff.id);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex w-full h-screen overflow-hidden">
            <div className="w-64 h-full fixed">
                <SideNav />
            </div>

            <div className="ml-64 flex-1 p-4 overflow-auto">
                <h1 className="text-5xl">Staff Management</h1>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <button onClick={toggleShowPassword} className="border p-2 mr-2">
                        {showPassword ? "Hide" : "Show"}
                    </button>
                    {editId ? (
                        <button onClick={editStaff} className="bg-blue-500 text-white p-2">Edit Staff</button>
                    ) : (
                        <button onClick={addStaff} className="bg-green-500 text-white p-2">Add Staff</button>
                    )}
                </div>
                <table className="mt-4 w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2">Username</th>
                            <th className="border p-2">Password</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.length > 0 ? (
                            staff.map((staff) => (
                                <tr key={staff.id} className="border">
                                    <td className="border p-2">{staff.username}</td>
                                    <td className="border p-2">{showPassword ? staff.password : "******"}</td>
                                    <td className="border p-2">
                                        <button onClick={() => handleEdit(staff)} className="bg-yellow-500 text-white p-2 mr-2">Edit</button>
                                        <button onClick={() => handleDelete(staff.id)} className="bg-red-500 text-white p-2">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="border p-2 text-center">No staff</td>
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
                            This action cannot be undone. This will permanently delete the staff member.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={deleteStaff}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}