import CredentialsProvider from 'next-auth/providers/credentials';
import { Client } from 'pg';


const client = new Client({
    connectionString: process.env.DB_URL,
});
client.connect();

async function fetchStaffFromDB() {
    const res = await client.query('SELECT * FROM staff');
    return res.rows;
}

export const options = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {
                    label: "Username:",
                    type: "text",
                    placeholder: "username"
                },
                password: {
                    label: "Password:",
                    type: "password",
                    placeholder: "password"
                }
            },
            async authorize(credentials) {
                const staff = await fetchStaffFromDB();
                const users = [
                    { id: "1", name: "admin", password: process.env.ADMIN_PASSWORD, role: "admin" },
                    ...staff.map(s => ({ id: s.id, name: s.username, password: s.password, role: s.role }))
                ];

                const user = users.find(u => u.name === credentials?.username && u.password === credentials?.password);

                if (user) {
                    return user;
                } else {
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = user.role;
            return token;
        },
        async session({ session, token }) {
            if (session?.user) session.user.role = token.role;
            return session;
        },
    }
};
