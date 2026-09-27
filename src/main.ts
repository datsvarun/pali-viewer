import mapboxgl from 'mapbox-gl';

// Use a public mapbox token for demonstration purposes. Users should replace this with their own token.
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [73.22, 18.53], // Approx center of Pali
    zoom: 13,
    pitch: 60,
    bearing: -20,
    antialias: true
});

map.addControl(new mapboxgl.NavigationControl(), 'top-right');

class ZoomToPaliControl {
    _map?: mapboxgl.Map;
    _container?: HTMLDivElement;

    onAdd(map: mapboxgl.Map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        
        const button = document.createElement('button');
        button.type = 'button';
        button.title = 'Zoom to Pali';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: auto; display: block; margin-top: 4px;">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        `;
        button.onclick = () => {
            this._map?.flyTo({ center: [73.22, 18.53], zoom: 13, pitch: 60, bearing: -20, duration: 2000 });
        };
        
        this._container.appendChild(button);
        return this._container;
    }

    onRemove() {
        this._container?.parentNode?.removeChild(this._container);
        this._map = undefined;
    }
}

map.addControl(new ZoomToPaliControl(), 'top-right');

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

sidebarToggle?.addEventListener('click', () => {
    if (!sidebar) return;

    const isOpen = sidebar.classList.toggle('is-open');
    sidebarToggle.setAttribute('aria-expanded', String(isOpen));
    sidebarToggle.setAttribute('aria-label', isOpen ? 'Close map layers' : 'Open map layers');
});

const geojsonFiles = [
    'AALI MAP_MERGED.geojson',
    'All Wards.shp.geojson',
    'Areas.geojson',
    'BAPUJI BUA OF KASBE PALI — BAPUJIBUA OF KASBE PALI.geojson',
    'BUILT DAPODE, TAALI.geojson',
    'Buildings.geojson',
    'District_Village_Boundary.geojson',
    'EB.geojson',
    'LOCAL RD -HH.geojson',
    'PALI - AMBA RIVER-HH.geojson',
    'PALI - ROAD.geojson',
    'PALI - TEMPLE.geojson',
    'PALI-SUDHAGAD FORT -HH.geojson',
    'PaliBnd_Reprojected.geojson',
    'Pali_Contour.geojson',
    'WELLS AND WATER BODIES OF PALI.geojson',
    'ZAP SHAPE.geojson',
    'burmali house.geojson',
    'drainage_network.geojson',
    'dumping site.geojson',
    'ecosensitiven zone.geojson',
    'pali gaothan.geojson',
    'trees existing.geojson',
    'wells.geojson'
];

// Helper to generate a random but pleasant color based on the index
function getColor(index: number) {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    return colors[index % colors.length];
}

map.on('style.load', () => {
    // Add 3D Terrain
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    // Add sky layer for 3D effect
    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });

    // Add OSM Raster Source & Layer (Default hidden)
    map.addSource('osm', {
        'type': 'raster',
        'tiles': [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        'tileSize': 256
    });

    map.addLayer({
        'id': 'osm-layer',
        'type': 'raster',
        'source': 'osm',
        'layout': {
            'visibility': 'none'
        }
    });
});

map.on('load', () => {
    // --- Basemap Toggle Logic ---
    const osmRadio = document.getElementById('basemap-osm') as HTMLInputElement;
    const satRadio = document.getElementById('basemap-satellite') as HTMLInputElement;

    const toggleBasemap = () => {
        if (osmRadio.checked) {
            map.setLayoutProperty('osm-layer', 'visibility', 'visible');
        } else {
            map.setLayoutProperty('osm-layer', 'visibility', 'none');
        }
    };

    osmRadio?.addEventListener('change', toggleBasemap);
    satRadio?.addEventListener('change', toggleBasemap);

    const layerList = document.getElementById('layer-list');
    if (!layerList) return;

    geojsonFiles.forEach((file, index) => {
        // Clean up filename for display
        const displayName = file.replace('.geojson', '').replace('.shp', '').replace(/-/g, ' ');
        const layerId = `layer-${index}`;
        const sourceId = `source-${index}`;
        const color = getColor(index);

        // Create UI Checkbox
        const li = document.createElement('li');
        const label = document.createElement('label');
        label.className = 'layer-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `toggle-${index}`;

        const span = document.createElement('span');
        span.className = 'layer-label';
        span.innerText = displayName;

        label.appendChild(checkbox);
        label.appendChild(span);
        li.appendChild(label);
        layerList.appendChild(li);

        // Toggle logic
        checkbox.addEventListener('change', async (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;

            if (isChecked) {
                // Load data dynamically the first time it's checked
                if (!map.getSource(sourceId)) {
                    // Start loading indicator (optional)
                    span.innerText = `${displayName} (Loading...)`;
                    try {
                        const response = await fetch(`./data/${file}`);
                        if (!response.ok) throw new Error('File not found');
                        const data = await response.json();

                        map.addSource(sourceId, {
                            type: 'geojson',
                            data: data
                        });

                        // Determine geometry type to render properly (Polygon, LineString, Point)
                        // A simple approach is to look at the first feature
                        const geomType = data.features?.[0]?.geometry?.type;

                        if (geomType === 'Point' || geomType === 'MultiPoint') {
                            map.addLayer({
                                id: layerId,
                                type: 'circle',
                                source: sourceId,
                                paint: {
                                    'circle-radius': 5,
                                    'circle-color': color,
                                    'circle-stroke-width': 1,
                                    'circle-stroke-color': '#ffffff'
                                }
                            });
                        } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
                            map.addLayer({
                                id: layerId,
                                type: 'line',
                                source: sourceId,
                                paint: {
                                    'line-color': color,
                                    'line-width': 3
                                }
                            });
                        } else {
                            // Assume Polygon/MultiPolygon
                            map.addLayer({
                                id: layerId,
                                type: 'fill',
                                source: sourceId,
                                paint: {
                                    'fill-color': color,
                                    'fill-opacity': 0.4,
                                    'fill-outline-color': '#000000'
                                }
                            });

                            // Add extrusion for Buildings if desired
                            if (file.toLowerCase().includes('building')) {
                                map.addLayer({
                                    id: `${layerId}-extrusion`,
                                    type: 'fill-extrusion',
                                    source: sourceId,
                                    paint: {
                                        'fill-extrusion-color': '#e2e8f0',
                                        // use height properties if available, else static
                                        'fill-extrusion-height': ['coalesce', ['get', 'height'], 10],
                                        'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                                        'fill-extrusion-opacity': 0.8
                                    }
                                });
                            }
                        }

                        // Fit bounds to layer if it's the first one we turn on
                        const bounds = new mapboxgl.LngLatBounds();
                        data.features.forEach((f: any) => {
                            if (f.geometry?.coordinates) {
                                // Super crude bounding box for Points vs Arrays
                                if (geomType === 'Point') {
                                    bounds.extend(f.geometry.coordinates);
                                } else if (f.geometry.coordinates[0]?.[0]?.[0] !== undefined) {
                                    // Polygon
                                    f.geometry.coordinates[0].forEach((coord: [number, number]) => bounds.extend(coord));
                                }
                            }
                        });
                        if (!bounds.isEmpty()) {
                            map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
                        }

                    } catch (err) {
                        console.error('Failed to load', file, err);
                        span.innerText = `${displayName} (Error)`;
                        return;
                    }
                    span.innerText = displayName; // Reset label
                } else {
                    // Layer already exists, just make it visible
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                    if (map.getLayer(`${layerId}-extrusion`)) {
                        map.setLayoutProperty(`${layerId}-extrusion`, 'visibility', 'visible');
                    }
                }
            } else {
                // Hide layer
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', 'none');
                }
                if (map.getLayer(`${layerId}-extrusion`)) {
                    map.setLayoutProperty(`${layerId}-extrusion`, 'visibility', 'none');
                }
            }
        });
    });



    // --- Feature Popups ---
    map.on('click', (e) => {
        // Query all rendered features excluding base map layers (we want custom loaded layers)
        const features = map.queryRenderedFeatures(e.point);
        const customFeatures = features.filter(f => f.layer && f.layer.id.startsWith('layer-'));

        if (!customFeatures.length) {
            return;
        }

        const feature = customFeatures[0];
        const props = feature.properties;
        let pName = feature.layer?.id || 'Unknown Layer';
        
        // Find human readable layer name if possible
        const metaIndex = parseInt(pName.replace('layer-', '').replace('-extrusion', ''));
        if (!isNaN(metaIndex) && geojsonFiles[metaIndex]) {
            pName = geojsonFiles[metaIndex].replace('.geojson', '').replace('.shp', '');
        }

        let popupHtml = `<div style="max-height: 200px; overflow-y: auto; font-family: 'Inter', sans-serif;">
            <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; font-weight: 600; font-size: 14px; text-transform: uppercase;">${pName}</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">`;
        
        if (props) {
            for (const [key, value] of Object.entries(props)) {
                popupHtml += `
                    <tr>
                        <td style="padding: 4px; border-bottom: 1px solid #f1f5f9; font-weight: 500; color: #64748b;">${key}:</td>
                        <td style="padding: 4px; border-bottom: 1px solid #f1f5f9; color: #0f172a; word-break: break-word;">${value === null ? 'N/A' : value}</td>
                    </tr>
                `;
            }
        } else {
            popupHtml += `<tr><td>No attributes</td></tr>`;
        }
        
        popupHtml += `</table></div>`;

        new mapboxgl.Popup({ maxWidth: '300px' })
            .setLngLat(e.lngLat)
            .setHTML(popupHtml)
            .addTo(map);
    });
    
    // Change cursor to pointer when hovering over clickable layers
    map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point).filter(f => f.layer && f.layer.id.startsWith('layer-'));
        map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });
});

