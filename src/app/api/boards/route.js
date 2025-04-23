import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DB_URL,
});
client.connect();

export async function GET(req, res) {
    const id = req.url.split('?id=')[1];
    if (id && !isNaN(id)) {
        const board = await fetchBoardFromDB(id);
        return new Response(JSON.stringify(board), {
            headers: { 'Content-Type': 'application/json' },
        });
    } else if (!id) {
        const boards = await fetchBoardsFromDB();
        return new Response(JSON.stringify(boards), {
            headers: { 'Content-Type': 'application/json' },
        });
    } else {
        return new Response('Invalid ID', { status: 400 });
    }
}

export async function POST(req, res) {
    const { title, name, price } = await req.json();
    await addBoardToDB({ title, name, price });
    return new Response(null, { status: 201 });
}

export async function DELETE(req, res) {
    const id = req.url.split('?id=')[1];
    if (!id || isNaN(id)) {
        return new Response('Invalid ID', { status: 400 });
    }
    await deleteBoardFromDB(id);
    return new Response(null, { status: 204 });
}

export async function PUT(req, res) {
    const id = req.url.split('?id=')[1];
    if (!id || isNaN(id)) {
        return new Response('Invalid ID', { status: 400 });
    }
    const { title, name, price } = await req.json();
    await updateBoardInDB(id, { title, name, price });
    return new Response(null, { status: 200 });
}

export async function PATCH(req, res) {
    try {
        const id = req.url.split('?id=')[1];
        if (!id || isNaN(id)) {
            return new Response('Invalid ID', { status: 400 });
        }
        const { startedAt, endedAt, products, totalPrice } = await req.json();
        await updateBoardStartedAtInDB(id, startedAt, endedAt, products, parseInt(totalPrice, 10));
        return new Response(null, { status: 200 });
    } catch (error) {
        console.error('Error updating board startedAt:', error.message);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function PATCH_PRODUCTS(req, res) {
    try {
        const id = req.url.split('?id=')[1];
        if (!id || isNaN(id)) {
            return new Response('Invalid ID', { status: 400 });
        }
        const { products } = await req.json();
        await updateBoardProductsInDB(id, products);
        return new Response(null, { status: 200 });
    } catch (error) {
        console.error('Error updating board products:', error.message);
        return new Response('Internal Server Error', { status: 500 });
    }
}

async function fetchBoardsFromDB() {
    const res = await client.query('SELECT * FROM boards ORDER BY id');
    return res.rows;
}

async function fetchBoardFromDB(id) {
    const res = await client.query('SELECT * FROM boards WHERE id = $1', [id]);
    return res.rows[0];
}

async function addBoardToDB(board) {
    const { title, name, price } = board;
    await client.query('INSERT INTO boards (title, name, price) VALUES ($1, $2, $3)', [title, name, price]);
}

async function deleteBoardFromDB(id) {
    await client.query('DELETE FROM boards WHERE id = $1', [id]);
}

async function updateBoardInDB(id, board) {
    const { title, name, price } = board;
    await client.query('UPDATE boards SET title = $1, name = $2, price = $3 WHERE id = $4', [title, name, price, id]);
}

async function updateBoardStartedAtInDB(id, startedAt, endedAt, products, totalPrice) {
    await client.query('UPDATE boards SET "startedAt" = $1, "endedAt" = $2, "products" = $3, "totalPrice" = $4 WHERE id = $5', [startedAt, endedAt, products, totalPrice, id]);
}

async function updateBoardProductsInDB(id, products) {
    await client.query('UPDATE boards SET "products" = $1 WHERE id = $2', [products, id]);
}
