"use client";

import { useEffect, useState } from "react";
import { Card, Text, Metric, Flex } from "@tremor/react";
import { MapPin, Clock, CloudSun, Calendar } from "lucide-react";

type GeoData = {
    country?: string;
    isp?: string;
    city?: string;
    query?: string; // IP
    lat?: number;
    lon?: number;
};

type WeatherData = {
    temperature: number;
    weathercode: number;
};

export default function HeaderInfo() {
    const [geo, setGeo] = useState<GeoData | null>(null);
    const [time, setTime] = useState<Date | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);

    useEffect(() => {
        // 1. Clock
        setTime(new Date()); // Initial set to avoid hydration mismatch
        const timer = setInterval(() => setTime(new Date()), 1000);

        // 2. Fetch Geo & Weather
        fetchGeoData();

        return () => clearInterval(timer);
    }, []);

    const fetchGeoData = async () => {
        try {
            const res = await fetch("https://ipapi.co/json/");
            if (!res.ok) throw new Error("Geo Error");
            const data = await res.json();

            const gData = {
                country: data.country_name,
                city: data.city,
                isp: data.org,
                query: data.ip,
                lat: data.latitude,
                lon: data.longitude
            };
            setGeo(gData);

            // Fetch Weather if we have lat/lon
            if (data.latitude && data.longitude) {
                fetchWeather(data.latitude, data.longitude);
            }
        } catch (e) { console.error(e); }
    };

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            if (data.current_weather) {
                setWeather({
                    temperature: data.current_weather.temperature,
                    weathercode: data.current_weather.weathercode,
                });
            }
        } catch (e) { console.error("Weather error", e); }
    };

    if (!time) return null; // Avoid hydration mismatch

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Location */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 p-4 transition-colors">
                <Flex justifyContent="start" className="space-x-4">
                    <div className="bg-indigo-500/10 p-2 rounded-lg">
                        <MapPin className="text-indigo-500 dark:text-indigo-400 w-6 h-6" />
                    </div>
                    <div>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Ubicación</Text>
                        <Metric className="text-slate-900 dark:text-slate-100 text-lg truncate" title={geo ? `${geo.city}, ${geo.country}` : "..."}>
                            {geo ? `${geo.city}, ${geo.country}` : "Localizando..."}
                        </Metric>
                        <Text className="text-xs text-slate-500 truncate">{geo?.isp || "Detectando ISP..."}</Text>
                        <Text className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">{geo?.query}</Text>
                    </div>
                </Flex>
            </Card>

            {/* DateTime */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 p-4 transition-colors">
                <Flex justifyContent="start" className="space-x-4">
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                        <Clock className="text-emerald-500 dark:text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Fecha y Hora</Text>
                        <div className="flex items-baseline space-x-2">
                            <Metric className="text-slate-900 dark:text-slate-100 text-2xl font-mono">
                                {time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </Metric>
                            <Text className="text-slate-400 text-xs font-mono">
                                {time.toLocaleTimeString('es-ES', { second: '2-digit' })}
                            </Text>
                        </div>

                        <Flex justifyContent="start" className="space-x-1 text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <Text className="text-xs capitalize">
                                {time.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Text>
                        </Flex>
                    </div>
                </Flex>
            </Card>

            {/* Weather */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 p-4 transition-colors">
                <Flex justifyContent="start" className="space-x-4">
                    <div className="bg-amber-500/10 p-2 rounded-lg">
                        <CloudSun className="text-amber-500 dark:text-amber-400 w-6 h-6" />
                    </div>
                    <div>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Tiempo (Local)</Text>
                        <Metric className="text-slate-900 dark:text-slate-100 text-lg">
                            {weather ? `${weather.temperature}°C` : "--°C"}
                        </Metric>
                        <Text className="text-xs text-slate-500">
                            {weather ? "Datos de OpenMeteo" : "Cargando clima..."}
                        </Text>
                    </div>
                </Flex>
            </Card>
        </div>
    );
}
