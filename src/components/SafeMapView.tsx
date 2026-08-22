import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  ShieldCheck, 
  MapPin, 
  SunMedium, 
  Users, 
  Plus, 
  Compass, 
  Building2, 
  Crosshair,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Translations, LanguageCode } from '../i18n';
import { ConfidenceZone, SafeRoute } from '../types';
import { api } from '../services/api';

interface Props {
  t: Translations;
  currentLang: LanguageCode;
  onSelectConfidenceZone?: (zone: ConfidenceZone) => void;
}

export const SafeMapView: React.FC<Props> = ({ t }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [zones, setZones] = useState<ConfidenceZone[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<[number, number]>([28.6328, 77.2190]);
  const [destinationInput, setDestinationInput] = useState<string>('Barakhamba Road & Janpath');
  const [safeRoutes, setSafeRoutes] = useState<SafeRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  
  // Add Spot Modal
  const [showAddSpotModal, setShowAddSpotModal] = useState<boolean>(false);
  const [newSpotName, setNewSpotName] = useState<string>('');
  const [newSpotCategory, setNewSpotCategory] = useState<ConfidenceZone['category']>('safe_hub');
  const [newSpotAddress, setNewSpotAddress] = useState<string>('');
  const [newSpotLighting, setNewSpotLighting] = useState<number>(90);
  const [spotSuccessMsg, setSpotSuccessMsg] = useState<string>('');

  // Load Confidence Zones
  useEffect(() => {
    api.getConfidenceZones(selectedCategory).then((data) => {
      setZones(data);
    });
  }, [selectedCategory]);

  // Acquire Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(coords, 14);
          }
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: userLocation,
        zoom: 14,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CARTO',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render User Marker & Confidence Spot Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // User GPS Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-slate-950 font-bold">
            YOU
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker(userLocation, { icon: userIcon })
      .bindPopup(`<div class="text-xs font-bold text-slate-900">📍 You Are Here (GPS Active)</div>`)
      .addTo(markersGroupRef.current);

    // Confidence Spots
    zones.forEach((zone) => {
      let iconEmoji = '🛡️';
      let iconColor = 'bg-teal-600';
      if (zone.category === 'police') { iconEmoji = '🚨'; iconColor = 'bg-rose-600'; }
      else if (zone.category === 'pharmacy') { iconEmoji = '🏥'; iconColor = 'bg-emerald-600'; }
      else if (zone.category === 'transit') { iconEmoji = '🚇'; iconColor = 'bg-blue-600'; }
      else if (zone.category === 'cafe') { iconEmoji = '☕'; iconColor = 'bg-amber-600'; }

      const spotIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: `
          <div class="w-8 h-8 rounded-full ${iconColor} text-white shadow-xl border-2 border-white flex items-center justify-center text-sm transform hover:scale-125 transition-transform">
            ${iconEmoji}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupContent = `
        <div class="p-1 max-w-[200px]">
          <div class="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-1">
            <span>${iconEmoji}</span>
            <span>${zone.name}</span>
          </div>
          <p class="text-[11px] text-slate-600 mb-1.5">${zone.address}</p>
          <div class="flex items-center justify-between text-[10px] bg-slate-100 p-1.5 rounded font-medium text-slate-700">
            <span>💡 Light: <strong class="text-emerald-700">${zone.lightingScore}%</strong></span>
            <span>👥 Crowd: <strong>${zone.crowdLevel}</strong></span>
          </div>
          <div class="mt-1.5 text-[9px] text-emerald-800 font-semibold flex items-center gap-1">
            ✓ Verified by ${zone.verifiedCount} women
          </div>
        </div>
      `;

      L.marker([zone.lat, zone.lng], { icon: spotIcon })
        .bindPopup(popupContent)
        .addTo(markersGroupRef.current!);
    });
  }, [zones, userLocation]);

  // Handle Safe Route Request
  const handleCalculateRoute = async () => {
    setIsCalculatingRoute(true);
    try {
      const result = await api.calculateSafeRoute({
        startLat: userLocation[0],
        startLng: userLocation[1],
        destLat: userLocation[0] + 0.0055,
        destLng: userLocation[1] + 0.0065
      });

      setSafeRoutes(result.routes);
      setSelectedRouteIndex(0);
      drawRoutesOnMap(result.routes, 0);
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const drawRoutesOnMap = (routesList: SafeRoute[], activeIndex: number) => {
    if (!mapInstanceRef.current || !routeLayerGroupRef.current) return;
    routeLayerGroupRef.current.clearLayers();

    routesList.forEach((r, idx) => {
      const isSelected = idx === activeIndex;
      const isSafe = r.lightingScore > 75;

      const polyline = L.polyline(r.pathCoordinates, {
        color: isSafe ? (isSelected ? '#059669' : '#10b98188') : (isSelected ? '#f59e0b' : '#64748b66'),
        weight: isSelected ? 6 : 4,
        dashArray: isSafe ? undefined : '5, 8',
        opacity: isSelected ? 0.95 : 0.6
      }).addTo(routeLayerGroupRef.current!);

      if (isSelected && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }
    });
  };

  const handleSelectRoute = (index: number) => {
    setSelectedRouteIndex(index);
    drawRoutesOnMap(safeRoutes, index);
  };

  const handleAddSafeSpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName) return;

    try {
      await api.addConfidenceZone({
        name: newSpotName,
        category: newSpotCategory,
        lat: userLocation[0] + (Math.random() - 0.5) * 0.004,
        lng: userLocation[1] + (Math.random() - 0.5) * 0.004,
        address: newSpotAddress || 'Community verified location',
        lightingScore: Number(newSpotLighting),
        crowdLevel: 'High',
        isOpen24x7: true
      });

      setSpotSuccessMsg('Confidence Spot verified and shared with community!');
      setTimeout(() => {
        setShowAddSpotModal(false);
        setSpotSuccessMsg('');
        setNewSpotName('');
        setNewSpotAddress('');
        api.getConfidenceZones().then(setZones);
      }, 1400);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div id="safe-map-view" className="flex flex-col gap-4 p-4 sm:p-6 pb-24">
      {/* Header & Spot Category Filter */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{t.mapTitle}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified well-lit paths and 24/7 assistance spots.
            </p>
          </div>
          <button
            id="add-confidence-spot-btn"
            onClick={() => setShowAddSpotModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addSafeSpot}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: t.allCategories, icon: '🌟' },
            { id: 'police', label: t.catPolice, icon: '🚨' },
            { id: 'pharmacy', label: t.catPharmacy, icon: '🏥' },
            { id: 'transit', label: t.catTransit, icon: '🚇' },
            { id: 'cafe', label: t.catCafe, icon: '☕' }
          ].map((cat) => (
            <button
              key={cat.id}
              id={`filter-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-100 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full shadow-lg text-[11px] font-semibold text-slate-200">
          <Crosshair className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span>{zones.length} Safe Confidence Havens Nearby</span>
        </div>

        <button
          id="recenter-gps-btn"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(userLocation, 15);
            }
          }}
          className="absolute bottom-3 right-3 z-20 p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-emerald-400 hover:bg-slate-800 shadow-lg transition-colors"
          title="Recenter to GPS"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* SAFE ROUTE PLANNER BOX */}
      <div id="safe-route-planner-card" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{t.safeRoutePlanner}</span>
          </div>
          <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
            Lighting Intelligence
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <span className="text-slate-400 text-[11px] shrink-0">{t.fromLocation}:</span>
            <span className="text-slate-200 font-medium truncate">Connaught Place (GPS Detected)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
            <span className="text-slate-400 text-[11px] shrink-0">{t.toLocation}:</span>
            <input
              id="destination-route-input"
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="e.g. Janpath Metro Gate 2"
              className="w-full bg-transparent text-slate-100 focus:outline-none font-medium placeholder:text-slate-600"
            />
          </div>
        </div>

        <button
          id="calculate-safe-path-btn"
          onClick={handleCalculateRoute}
          disabled={isCalculatingRoute}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
        >
          <SunMedium className="w-4 h-4" />
          <span>{isCalculatingRoute ? t.calculatingSafeRoute : t.findSafeRoute}</span>
        </button>

        {/* ROUTE COMPARISON CARDS */}
        {safeRoutes.length > 0 && (
          <div className="flex flex-col gap-3 mt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Calculated Route Options:
            </div>

            {safeRoutes.map((route, idx) => {
              const isSelected = selectedRouteIndex === idx;
              const isHighSafety = route.lightingScore > 75;

              return (
                <div
                  key={idx}
                  id={`route-card-${idx}`}
                  onClick={() => handleSelectRoute(idx)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? isHighSafety
                        ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isHighSafety ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        <span className="font-bold text-xs text-slate-100">{route.type}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{route.tag}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-200">{route.estimatedMinutes} mins</span>
                      <span className="text-[10px] text-slate-400 block font-mono">({route.distanceKm} km)</span>
                    </div>
                  </div>

                  {/* Safety Scores Bar */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1"><SunMedium className="w-3 h-3 text-amber-400" /> Lighting:</span>
                      <span className={`font-bold ${isHighSafety ? 'text-emerald-400' : 'text-amber-400'}`}>{route.lightingScore}%</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1"><Users className="w-3 h-3 text-blue-400" /> Crowd:</span>
                      <span className={`font-bold ${isHighSafety ? 'text-emerald-400' : 'text-amber-400'}`}>{route.crowdScore}%</span>
                    </div>
                  </div>

                  {/* Features / Warnings */}
                  <div className="mt-2 flex flex-col gap-1 text-[11px]">
                    {route.safetyFeatures.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-slate-300">
                        {isHighSafety ? (
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD CONFIDENCE SPOT MODAL */}
      {showAddSpotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{t.addSafeSpot}</span>
              </h3>
              <button
                id="close-add-spot-btn"
                onClick={() => setShowAddSpotModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {spotSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-center text-xs font-semibold">
                ✓ {spotSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleAddSafeSpotSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">{t.spotName}</label>
                  <input
                    id="new-spot-name-input"
                    type="text"
                    required
                    value={newSpotName}
                    onChange={(e) => setNewSpotName(e.target.value)}
                    placeholder="e.g. Apollo 24/7 Pharmacy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">{t.spotCategory}</label>
                  <select
                    id="new-spot-category-select"
                    value={newSpotCategory}
                    onChange={(e) => setNewSpotCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="police">🚨 Police / Pink Booth</option>
                    <option value="pharmacy">🏥 24/7 Pharmacy</option>
                    <option value="transit">🚇 Transit / Metro Gate</option>
                    <option value="cafe">☕ Well-Lit 24hr Cafe</option>
                    <option value="safe_hub">🛡️ Verified Safe Hub</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">{t.spotAddress}</label>
                  <input
                    id="new-spot-address-input"
                    type="text"
                    value={newSpotAddress}
                    onChange={(e) => setNewSpotAddress(e.target.value)}
                    placeholder="Street, Landmark"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 mt-1 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{t.spotLighting}</span>
                    <span className="font-bold text-emerald-400">{newSpotLighting}%</span>
                  </div>
                  <input
                    id="new-spot-lighting-range"
                    type="range"
                    min="50"
                    max="100"
                    value={newSpotLighting}
                    onChange={(e) => setNewSpotLighting(Number(e.target.value))}
                    className="w-full mt-1.5 accent-emerald-500"
                  />
                </div>

                <button
                  id="submit-new-spot-btn"
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs mt-2 transition-colors shadow-lg"
                >
                  {t.submitSpot}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
