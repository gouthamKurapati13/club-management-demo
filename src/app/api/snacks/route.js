import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DB_URL,
});
client.connect();

export async function GET(req, res) {
    const snacks = await fetchSnacksFromDB();
    return new Response(JSON.stringify(snacks), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(req, res) {
    const { name, price } = await req.json();
    await addSnackToDB({ name, price });
    return new Response(null, { status: 201 });
}

export async function DELETE(req, res) {
    const id = req.url.split('?id=')[1];
    await deleteSnackFromDB(id);
    return new Response(null, { status: 204 });
}

export async function PUT(req, res) {
    const id = req.url.split('?id=')[1];
    const { name, price } = await req.json();
    await updateSnackInDB(id, { name, price });
    return new Response(null, { status: 200 });
}

async function fetchSnacksFromDB() {
    const res = await client.query('SELECT * FROM snacks');
    return res.rows;
}

async function addSnackToDB(snack) {
    const { name, price } = snack;
    await client.query('INSERT INTO snacks (name, price) VALUES ($1, $2)', [name, price]);
}

async function deleteSnackFromDB(id) {
    await client.query('DELETE FROM snacks WHERE id = $1', [id]);
}

async function updateSnackInDB(id, snack) {
    const { name, price } = snack;
    await client.query('UPDATE snacks SET name = $1, price = $2 WHERE id = $3', [name, price, id]);
}
