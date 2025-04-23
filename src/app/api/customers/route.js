import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DB_URL,
});
client.connect();

export async function GET(req, res) {
    const phone = req.url.split('?phone=')[1];
    if (phone) {
        const customer = await fetchCustomerFromDB(phone);
        if (!customer) {
            return new Response('Customer Not Found', { status: 404 });
        }
        return new Response(JSON.stringify(customer), {
            headers: { 'Content-Type': 'application/json' },
        });
    } else {
        try {
            const customers = await fetchCustomersFromDB();
            return new Response(JSON.stringify(customers), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Error fetching customers:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
}

export async function POST(req, res) {
    try {
        const { name, phoneNo, discount } = await req.json();
        await addCustomerToDB({ name, phoneNo, discount });
        return new Response(null, { status: 201 });
    } catch (error) {
        console.error('Error adding customer:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req, res) {
    try {
        const id = req.url.split('?id=')[1];
        await deleteCustomerFromDB(id);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function PUT(req, res) {
    try {
        const id = req.url.split('?id=')[1];
        const { name, phoneNo, discount } = await req.json();
        await updateCustomerInDB(id, { name, phoneNo, discount });
        return new Response(null, { status: 200 });
    } catch (error) {
        console.error('Error updating customer:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

async function fetchCustomersFromDB() {
    const res = await client.query('SELECT * FROM customers');
    return res.rows;
}

async function addCustomerToDB(customer) {
    const { name, phoneNo, discount } = customer;
    await client.query('INSERT INTO customers (name, "phoneNo", discount) VALUES ($1, $2, $3)', [name, phoneNo, discount]);
}

async function deleteCustomerFromDB(id) {
    await client.query('DELETE FROM customers WHERE id = $1', [id]);
}

async function updateCustomerInDB(id, customer) {
    const { name, phoneNo, discount } = customer;
    await client.query('UPDATE customers SET name = $1, "phoneNo" = $2, discount = $3 WHERE id = $4', [name, phoneNo, discount, id]);
}

async function fetchCustomerFromDB(phone) {
    const res = await client.query('SELECT * FROM customers WHERE "phoneNo" = $1', [phone]);
    return res.rows[0];
}
