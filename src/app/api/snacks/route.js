import fs from 'fs/promises';
import path from 'path';

const snacksFilePath = path.join(process.cwd(), 'mock-data', 'snacks.json');

export async function GET(req, res) {
    const snacks = await fetchSnacksFromFile();
    return new Response(JSON.stringify(snacks), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(req, res) {
    const { name, price } = await req.json();
    await addSnackToFile({ name, price });
    return new Response(null, { status: 201 });
}

export async function DELETE(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    await deleteSnackFromFile(id);
    return new Response(null, { status: 204 });
}

export async function PUT(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    const { name, price } = await req.json();
    await updateSnackInFile(id, { name, price });
    return new Response(null, { status: 200 });
}

async function fetchSnacksFromFile() {
    const data = await fs.readFile(snacksFilePath, 'utf-8');
    return JSON.parse(data);
}

async function addSnackToFile(snack) {
    const snacks = await fetchSnacksFromFile();
    const newSnack = { id: snacks.length + 1, ...snack };
    snacks.push(newSnack);
    await fs.writeFile(snacksFilePath, JSON.stringify(snacks, null, 2));
}

async function deleteSnackFromFile(id) {
    let snacks = await fetchSnacksFromFile();
    snacks = snacks.filter(snack => snack.id !== id);
    await fs.writeFile(snacksFilePath, JSON.stringify(snacks, null, 2));
}

async function updateSnackInFile(id, updatedSnack) {
    const snacks = await fetchSnacksFromFile();
    const index = snacks.findIndex(snack => snack.id === id);
    if (index !== -1) {
        snacks[index] = { ...snacks[index], ...updatedSnack };
        await fs.writeFile(snacksFilePath, JSON.stringify(snacks, null, 2));
    }
}
