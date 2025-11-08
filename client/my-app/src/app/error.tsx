"use client";

export default function GlobalError({ error }: { error: Error }) {
    return (
        <html>
            <body className="flex h-screen flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-red-600">
                    Something wrong
                </h1>
                <p className="mt-4 text-gray-600">{error.message}</p>
            </body>
        </html>
    );
}
