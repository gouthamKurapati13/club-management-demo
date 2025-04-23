import fs from 'fs/promises';
import path from 'path';

const snacksFilePath = path.join(process.cwd(), 'mock-data', 'snacks.json');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const snacks = await fetchSnacksFromFile();
        res.status(200).json(snacks);
    } else if (req.method === 'POST') {
        const { name, price } = req.body;
        await addSnackToFile({ name, price });
        res.status(201).end();
    } else if (req.method === 'DELETE') {
        const id = parseInt(req.query.id, 10);
        await deleteSnackFromFile(id);
        res.status(204).end();
    } else if (req.method === 'PUT') {
        const id = parseInt(req.query.id, 10);
        const { name, price } = req.body;
        await updateSnackInFile(id, { name, price });
        res.status(200).end();
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
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
