'use client'

import { useState, useEffect } from 'react';
import SideNav from "@/app/components/Sidenav";
import Table from "@/app/components/Table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
} from "@/components/ui/alert-dialog"


export default function BoardsPage() {
    const [boards, setBoards] = useState([]);
    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [editId, setEditId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        const response = await fetch('/api/boards');
        if (!response.ok) {
            console.error('Failed to fetch boards');
            return;
        }
        const data = await response.json();
        setBoards(data);
    };

    const validateFields = () => {
        if (!title || !name || price <= 0) {
            setError("All fields are required and price must be greater than zero.");
            return false;
        }
        setError("");
        return true;
    };

    const addBoard = async () => {
        if (!validateFields()) return;

        const response = await fetch('/api/boards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, name, price: parseInt(price, 10) }),
        });
        if (!response.ok) {
            console.error('Failed to add board');
            return;
        }
        setTitle('');
        setName('');
        setPrice(0);
        fetchBoards();
        setIsDialogOpen(false);
    };

    const deleteBoard = async (id) => {
        const response = await fetch(`/api/boards?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            console.error('Failed to delete board');
            return;
        }
        fetchBoards();
    };

    const editBoard = async () => {
        if (!validateFields()) return;

        const response = await fetch(`/api/boards?id=${editId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, name, price: parseInt(price, 10) }),
        });
        if (!response.ok) {
            console.error('Failed to edit board');
            return;
        }
        setTitle('');
        setName('');
        setPrice(0);
        setEditId(null);
        fetchBoards();
        setIsDialogOpen(false);
    };

    const handleEdit = (board) => {
        setTitle(board.title);
        setName(board.name);
        setPrice(board.price);
        setEditId(board.id);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setTitle('');
        setName('');
        setPrice(0);
        setEditId(null);
        setIsDialogOpen(false);
        setError("");
    };

    return (
        <div className="flex w-full h-screen overflow-hidden">
            <div className="w-64 h-full fixed">
                <SideNav />
            </div>

            <div className="ml-64 flex-1 p-4 overflow-y-auto max-h-[90vh] pb-8">

                <div className='flex justify-between align-center gap-2 sticky top-0 z-10'>
                    <h1 className="text-5xl">Boards Management</h1>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700 mt-auto" onClick={() => setIsDialogOpen(true)}>Add Board</Button>
                </div>


                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editId ? 'Edit board' : 'Add new board'}</DialogTitle>
                            {/* <DialogDescription>
                                {editId ? 'Edit the board details here.' : 'Add a new board here.'}
                            </DialogDescription> */}
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">
                                    Price (per hour)
                                </Label>
                                <Input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" required min="1" />
                            </div>
                            {error && (
                                <div className="col-span-4 text-red-500 text-sm mt-2">
                                    {error}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            {editId ? (
                                <Button type="submit" className="bg-blue-700 hover:bg-blue-600" onClick={(e) => { e.preventDefault(); editBoard() }}>Edit Board</Button>
                            ) : (
                                <Button type="submit" className="bg-blue-700 hover:bg-blue-600" onClick={(e) => { e.preventDefault(); addBoard() }}>Add Board</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    {boards.length > 0 ? (
                        boards.map((board) => (
                            <div key={board.id} className="relative">
                                <Table tableTitle={board.title} tableName={board.name} price={board.price} mode="admin" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(board)}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>
                                    <AlertDialog>
                                        <AlertDialogTrigger className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                                            Delete
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the board for the available boards.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-blue-700 hover:bg-blue-600 text-white hover:text-white">Cancel</AlertDialogCancel>
                                                <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteBoard(board.id)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>


                                </div>
                                {/* <div className="absolute bottom-0 left-12 text-sm text-gray-700">
                                    <span>Price per hour: {board.price} Rs</span><br />
                                </div> */}
                            </div>
                        ))
                    ) : (
                        <p>No boards available</p>
                    )}
                </div>
            </div>
        </div>
    );
}