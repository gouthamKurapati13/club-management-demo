import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DB_URL,
});
client.connect();

export async function GET(req, res) {
    try {
        const history = await fetchHistoryFromDB();
        return new Response(JSON.stringify(history), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function POST(req, res) {
    try {
        const { boardId, totalPrice, products, staffName, customer } = await req.json();
        const staffId = await fetchStaffId(staffName);
        const createdAt = new Date().toISOString();
        await addHistoryToDB({ boardId, totalPrice: parseInt(totalPrice), products, staffId, customer, createdAt });
        return new Response(null, { status: 201 });
    } catch (error) {
        console.error('Error adding history:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req, res) {
    try {
        await clearHistoryFromDB();
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error clearing history:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

async function fetchHistoryFromDB() {
    const res = await client.query('SELECT * FROM history');
    return res.rows;
}

async function fetchStaffId(staffName) {
    if (staffName === 'admin') {
        return 1;
    }
    const res = await client.query('SELECT id FROM staff WHERE username = $1 LIMIT 1', [staffName]);
    return res.rows[0].id;
}

async function addHistoryToDB(history) {
    const query = `
        INSERT INTO history ("boardId", "totalPrice", "products", "staffId", "phoneNo", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [history.boardId, history.totalPrice, history.products, history.staffId, history.customer, history.createdAt];
    await client.query(query, values);
}

async function clearHistoryFromDB() {
    await client.query('DELETE FROM history');
}
