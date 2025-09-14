import { useState, useEffect } from "react";
import TransportAnalyticsDashboard from "@/components/TransportAnalyticsDashboard";
import ResponsiveDashboard from "@/components/ResponsiveDashboard";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import MapView from "@/components/MapView";
import { fetchAndParseGTFS } from "@/utils/parseGTFS";
import GTFSRouteSchedule from "@/components/GTFSRouteSchedule";
import TravelTimeCalculator from "@/components/TravelTimeCalculator";
import EnablePushButton from "@/components/EnablePushButton";
import ModerationPanel from "@/components/ModerationPanel";

export default function AsiVaye() {
  const [stats, setStats] = useState({ routes: 0, delays: 0, posts: 0, avgTravelTime: 35 });
  const [alerts, setAlerts] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeId, setRouteId] = useState("R1");

  useRealtimeAlerts((newAlert) => setAlerts(prev => [newAlert, ...prev]));

  useEffect(() => {
    async function loadGTFS() {
      const { stops } = await fetchAndParseGTFS(
        "https://myciti.org.za/en/developers/gtfs/gtfs.zip"
      );
      setStops(stops);
    }
    loadGTFS();
    setStats({ routes: 12, delays: 3, posts: 29, avgTravelTime: 42 }); // Simulate stats
  }, []);

  return (
    <div className="max-w-screen-lg mx-auto px-2">
      <h1 className="text-2xl font-bold my-4 text-center">Asi Vaye Transport Hub</h1>
      <EnablePushButton />
      <ResponsiveDashboard stats={stats} />
      <TransportAnalyticsDashboard />
      <TravelTimeCalculator />
      <div className="my-6">
        <label htmlFor="routeId" className="mr-2 font-bold">Select Route:</label>
        <input
          id="routeId"
          value={routeId}
          onChange={e => setRouteId(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <GTFSRouteSchedule gtfsUrl="https://myciti.org.za/en/developers/gtfs/gtfs.zip" routeId={routeId} />
      <MapView stops={stops.slice(0, 10)} />
      <ModerationPanel />
    </div>
  );
}
