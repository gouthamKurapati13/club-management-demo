import fs from 'fs/promises';
import path from 'path';

const staffFilePath = path.join(process.cwd(), 'mock-data', 'staff.json');

export async function GET(req, res) {
    const staff = await fetchStaffFromFile();
    return new Response(JSON.stringify(staff), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(req, res) {
    const { username, password } = await req.json();
    await addStaffToFile({ username, password });
    return new Response(null, { status: 201 });
}

export async function DELETE(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    await deleteStaffFromFile(id);
    return new Response(null, { status: 204 });
}

export async function PUT(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    const { username, password } = await req.json();
    await updateStaffInFile(id, { username, password });
    return new Response(null, { status: 200 });
}

async function fetchStaffFromFile() {
    const data = await fs.readFile(staffFilePath, 'utf-8');
    return JSON.parse(data);
}

async function addStaffToFile(staff) {
    const staffList = await fetchStaffFromFile();
    const newStaff = { id: staffList.length + 1, ...staff, role: 'manager' };
    staffList.push(newStaff);
    await fs.writeFile(staffFilePath, JSON.stringify(staffList, null, 2));
}

async function deleteStaffFromFile(id) {
    let staffList = await fetchStaffFromFile();
    staffList = staffList.filter(staff => staff.id !== id);
    await fs.writeFile(staffFilePath, JSON.stringify(staffList, null, 2));
}

async function updateStaffInFile(id, updatedStaff) {
    const staffList = await fetchStaffFromFile();
    const index = staffList.findIndex(staff => staff.id === id);
    if (index !== -1) {
        staffList[index] = { ...staffList[index], ...updatedStaff };
        await fs.writeFile(staffFilePath, JSON.stringify(staffList, null, 2));
    }
}
