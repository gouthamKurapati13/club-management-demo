import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DB_URL,
});
client.connect();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const snacks = await fetchSnacksFromDB();
        res.status(200).json(snacks);
    } else if (req.method === 'POST') {
        const { name, price } = req.body;
        await addSnackToDB({ name, price });
        res.status(201).end();
    } else if (req.method === 'DELETE') {
        const id = req.query.id;
        await deleteSnackFromDB(id);
        res.status(204).end();
    } else if (req.method === 'PUT') {
        const id = req.query.id;
        const { name, price } = req.body;
        await updateSnackInDB(id, { name, price });
        res.status(200).end();
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
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
