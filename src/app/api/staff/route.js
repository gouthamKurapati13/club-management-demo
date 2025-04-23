import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DB_URL,
});
client.connect();

export async function GET(req, res) {
    try {
        const staff = await fetchStaffFromDB();
        return new Response(JSON.stringify(staff), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching staff:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function POST(req, res) {
    try {
        const { username, password } = await req.json();
        await addStaffToDB({ username, password });
        return new Response(null, { status: 201 });
    } catch (error) {
        console.error('Error adding staff:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req, res) {
    try {
        const id = req.url.split('?id=')[1];
        await deleteStaffFromDB(id);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting staff:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function PUT(req, res) {
    try {
        const id = req.url.split('?id=')[1];
        const { username, password } = await req.json();
        await updateStaffInDB(id, { username, password });
        return new Response(null, { status: 200 });
    } catch (error) {
        console.error('Error updating staff:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

async function fetchStaffFromDB() {
    const res = await client.query('SELECT * FROM staff');
    return res.rows;
}

async function addStaffToDB(staff) {
    const { username, password } = staff;
    await client.query('INSERT INTO staff (username, password, role) VALUES ($1, $2, $3)', [username, password, 'manager']);
}

async function deleteStaffFromDB(id) {
    await client.query('DELETE FROM staff WHERE id = $1', [id]);
}

async function updateStaffInDB(id, staff) {
    const { username, password } = staff;
    await client.query('UPDATE staff SET username = $1, password = $2 WHERE id = $3', [username, password, id]);
}
