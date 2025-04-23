import fs from 'fs/promises';
import path from 'path';

const historyFilePath = path.join(process.cwd(), 'mock-data', 'history.json');

export async function GET(req, res) {
    const history = await fetchHistoryFromFile();
    return new Response(JSON.stringify(history), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(req, res) {
    const { boardId, totalPrice, products, staffId, customer, createdAt } = await req.json();
    await addHistoryToFile({ boardId, totalPrice, products, staffId, customer, createdAt });
    return new Response(null, { status: 201 });
}

export async function DELETE(req, res) {
    await clearHistoryFromFile();
    return new Response(null, { status: 204 });
}

async function fetchHistoryFromFile() {
    const data = await fs.readFile(historyFilePath, 'utf-8');
    return JSON.parse(data);
}

async function addHistoryToFile(history) {
    const histories = await fetchHistoryFromFile();
    const newHistory = { id: histories.length + 1, ...history };
    histories.push(newHistory);
    await fs.writeFile(historyFilePath, JSON.stringify(histories, null, 2));
}

async function clearHistoryFromFile() {
    await fs.writeFile(historyFilePath, JSON.stringify([], null, 2));
}
