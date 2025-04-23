import fs from 'fs/promises';
import path from 'path';

const boardsFilePath = path.join(process.cwd(), 'mock-data', 'boards.json');

export async function GET(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    const boards = await fetchBoardsFromFile();
    if (id) {
        const board = boards.find(b => b.id === id);
        if (!board) {
            return new Response('Board Not Found', { status: 404 });
        }
        return new Response(JSON.stringify(board), {
            headers: { 'Content-Type': 'application/json' },
        });
    } else {
        return new Response(JSON.stringify(boards), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(req, res) {
    const { title, name, price } = await req.json();
    await addBoardToFile({ title, name, price });
    return new Response(null, { status: 201 });
}

export async function DELETE(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    await deleteBoardFromFile(id);
    return new Response(null, { status: 204 });
}

export async function PUT(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    const { title, name, price } = await req.json();
    await updateBoardInFile(id, { title, name, price });
    return new Response(null, { status: 200 });
}

async function fetchBoardsFromFile() {
    const data = await fs.readFile(boardsFilePath, 'utf-8');
    return JSON.parse(data);
}

async function addBoardToFile(board) {
    const boards = await fetchBoardsFromFile();
    const newBoard = { id: boards.length + 1, ...board };
    boards.push(newBoard);
    await fs.writeFile(boardsFilePath, JSON.stringify(boards, null, 2));
}

async function deleteBoardFromFile(id) {
    let boards = await fetchBoardsFromFile();
    boards = boards.filter(board => board.id !== id);
    await fs.writeFile(boardsFilePath, JSON.stringify(boards, null, 2));
}

async function updateBoardInFile(id, updatedBoard) {
    const boards = await fetchBoardsFromFile();
    const index = boards.findIndex(board => board.id === id);
    if (index !== -1) {
        boards[index] = { ...boards[index], ...updatedBoard };
        await fs.writeFile(boardsFilePath, JSON.stringify(boards, null, 2));
    }
}
