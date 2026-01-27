"use client";

import { useSearchParams } from "next/navigation";
import ContainerDetail from "@/components/ContainerDetail";
import { Suspense } from "react";

function ContainerPageContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    if (!id) {
        return <div className="p-8 text-red-500">Error: No Container ID provided.</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <ContainerDetail containerId={id} />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <ContainerPageContent />
        </Suspense>
    );
}
