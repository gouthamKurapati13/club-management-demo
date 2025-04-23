import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(request) {
        // Check if the user is authorized to access `/admin` route
        if (request.nextUrl.pathname.startsWith("/admin")
            && request.nextauth.token?.role !== "admin") {
            return NextResponse.rewrite(
                new URL("/denied", request.url)
            );
        }

        // Check if the user is authorized to access `/staff` route
        if (request.nextUrl.pathname.startsWith("/staff")
            && request.nextauth.token?.role !== "admin"
            && request.nextauth.token?.role !== "manager") {
            return NextResponse.rewrite(
                new URL("/denied", request.url)
            );
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // Allow only authenticated users
        },
    }
);

// Apply this middleware only to specific routes
// export const config = { matcher: ["/admin", "/staff", "/dashboard"] };
