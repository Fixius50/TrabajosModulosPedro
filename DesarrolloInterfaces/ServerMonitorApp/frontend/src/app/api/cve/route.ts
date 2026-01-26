import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Defaults to auto, but we want to ensure it doesn't cache stale security data too long if static

export async function GET() {
    try {
        const res = await fetch("https://vulnerability.circl.lu/api/last/5", {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ServerMonitorApp/1.0'
            },
            next: { revalidate: 300 } // Cache for 5 mins
        });

        if (!res.ok) {
            throw new Error(`Upstream error: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("CVE Proxy Error:", error);
        return NextResponse.json({ error: "Failed to fetch CVEs" }, { status: 500 });
    }
}
