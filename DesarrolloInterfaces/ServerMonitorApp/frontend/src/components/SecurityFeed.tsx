"use client";

import { Card, Title, Text, Badge, List, ListItem } from "@tremor/react";
import { useEffect, useState } from "react";
import { ShieldAlert, ExternalLink } from "lucide-react";

type CVE = {
    id: string;
    summary: string;
    cvss3?: number;
    Modified: string;
};

export default function SecurityFeed() {
    const [cves, setCves] = useState<CVE[]>([]);

    useEffect(() => {
        const fetchCVEs = async () => {
            try {
                // Fetch from internal proxy to avoid CORS
                // Conditional path based on environment to match next.config.mjs
                const isProd = process.env.NODE_ENV === 'production';
                const endpoint = isProd ? '/ServerMonitorApp/frontend/api/cve' : '/api/cve';

                const res = await fetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    // Map API response to our type. Note: Structure varies, robust mapping needed.
                    // CIRCL usually returns array directly or object with keys.
                    // Assuming array for 'last' endpoint based on typical behavior, 
                    // or we adapt if it returns an object.

                    // Simple safeguard mapping
                    const list = Array.isArray(data) ? data : [];

                    // Map to cleaner objects
                    const mapped = list.map((item: any) => ({
                        id: item.id || "Unknown CVE",
                        summary: item.summary ? item.summary.substring(0, 60) + "..." : "No summary available",
                        cvss3: item.cvss3 || null,
                        Modified: item.Modified
                    }));

                    setCves(mapped);
                }
            } catch (e) {
                console.error("CVE fetch error", e);
            }
        };

        fetchCVEs();
    }, []);

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 h-full flex flex-col transition-colors">
            <Title className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-4 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Security Feed (CVEs)
            </Title>

            <List className="overflow-hidden">
                {cves.length === 0 ? (
                    <Text className="text-xs text-slate-500 italic p-2">Loading vulnerability feed...</Text>
                ) : (
                    cves.map((cve) => (
                        <ListItem key={cve.id} className="py-2 border-slate-100 dark:border-slate-800 px-0">
                            <div className="flex flex-col w-full gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{cve.id}</span>
                                    {cve.cvss3 && (
                                        <Badge size="xs" color={cve.cvss3 > 7 ? "rose" : "yellow"}>
                                            CVSS {cve.cvss3}
                                        </Badge>
                                    )}
                                </div>
                                <Text className="text-[10px] text-slate-500 line-clamp-1">{cve.summary}</Text>
                            </div>
                            <a
                                href={`https://cve.circl.lu/cve/${cve.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-2 text-slate-400 hover:text-blue-500 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </ListItem>
                    ))
                )}
            </List>
        </Card>
    );
}
