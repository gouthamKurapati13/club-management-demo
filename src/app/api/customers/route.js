import fs from 'fs/promises';
import path from 'path';

const customersFilePath = path.join(process.cwd(), 'mock-data', 'customers.json');

export async function GET(req, res) {
    const phone = req.url.split('?phone=')[1];
    const customers = await fetchCustomersFromFile();
    if (phone) {
        const customer = customers.find(c => c.phoneNo === phone);
        if (!customer) {
            return new Response('Customer Not Found', { status: 404 });
        }
        return new Response(JSON.stringify(customer), {
            headers: { 'Content-Type': 'application/json' },
        });
    } else {
        return new Response(JSON.stringify(customers), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(req, res) {
    const { name, phoneNo, discount } = await req.json();
    await addCustomerToFile({ name, phoneNo, discount });
    return new Response(null, { status: 201 });
}

export async function DELETE(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    await deleteCustomerFromFile(id);
    return new Response(null, { status: 204 });
}

export async function PUT(req, res) {
    const id = parseInt(req.url.split('?id=')[1], 10);
    const { name, phoneNo, discount } = await req.json();
    await updateCustomerInFile(id, { name, phoneNo, discount });
    return new Response(null, { status: 200 });
}

async function fetchCustomersFromFile() {
    const data = await fs.readFile(customersFilePath, 'utf-8');
    return JSON.parse(data);
}

async function addCustomerToFile(customer) {
    const customers = await fetchCustomersFromFile();
    const newCustomer = { id: customers.length + 1, ...customer };
    customers.push(newCustomer);
    await fs.writeFile(customersFilePath, JSON.stringify(customers, null, 2));
}

async function deleteCustomerFromFile(id) {
    let customers = await fetchCustomersFromFile();
    customers = customers.filter(customer => customer.id !== id);
    await fs.writeFile(customersFilePath, JSON.stringify(customers, null, 2));
}

async function updateCustomerInFile(id, updatedCustomer) {
    const customers = await fetchCustomersFromFile();
    const index = customers.findIndex(customer => customer.id === id);
    if (index !== -1) {
        customers[index] = { ...customers[index], ...updatedCustomer };
        await fs.writeFile(customersFilePath, JSON.stringify(customers, null, 2));
    }
}
