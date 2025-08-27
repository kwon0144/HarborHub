'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function About() {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const startMarkerRef = useRef(null);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const autocompleteRef = useRef(null);
    const infoWindowsRef = useRef({});
    
    const [address, setAddress] = useState('');
    const [addressPosition, setAddressPosition] = useState(null);
    const [destinationPosition, setDestinationPosition] = useState({ lat: -37.81509581212219, lng: 144.9700621396134 });
    const [travelTime, setTravelTime] = useState(null);
    const [travelDistance, setTravelDistance] = useState(null);
    const [loadPosition, setLoadPosition] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(null);
    const [selectedOffice, setSelectedOffice] = useState({
        name: "CBD Wellness Hub", 
        position: { lat: -37.81509581212219, lng: 144.9700621396134 }
    });
    const [errors, setErrors] = useState({
        location: null,
        start: null
    });

    const offices = [
        { name: "CBD Wellness Hub", position: { lat: -37.81509581212219, lng: 144.9700621396134 } },
        { name: "Fitzroy Mental Health Haven", position: { lat: -37.80583882048806, lng: 144.97696699728516 } },
        { name: "St Kilda Well-Being Retreat", position: { lat: -37.867898275562055, lng: 144.97894145495954 } }
    ];

    const createMarker = async (position, label, mapInstance, infoWindow) => {
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker');
        const pin = new PinElement({
            scale: 1.5,
            background: 'blue',
            borderColor: 'white',
            glyphColor: 'white'
        });
        const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: position,
            title: label,
            content: pin.element,
        });
        marker.addListener("click", () => {
            infoWindow.open({
                anchor: marker,
                map: mapInstance,
            });
            setSelectedOffice({ name: label, position: position });
            setDestinationPosition(position);
        });
        infoWindow.open({
            anchor: marker,
            map: mapInstance,
        });
    };

    useEffect(() => {
        const initializeMap = async () => {
            // Wait for Google Maps API to load
            if (typeof google === 'undefined') {
                console.log('Waiting for Google Maps API to load...');
                // Try again after a short delay
                setTimeout(() => {
                    if (typeof google !== 'undefined') {
                        initializeMap();
                    } else {
                        console.error('Google Maps API failed to load. Please check your API key and internet connection.');
                        setMapError('Failed to load Google Maps. Please check your internet connection and try again.');
                        setMapLoading(false);
                    }
                }, 1000);
                return;
            }

            // Initialize autocomplete
            const autocompleteInput = document.getElementById("autocomplete");
            if (autocompleteInput) {
                const autocomplete = new google.maps.places.Autocomplete(
                    autocompleteInput,
                    {
                        bounds: new google.maps.LatLngBounds(
                            new google.maps.LatLng(-37.840935, 144.946457)
                        )
                    }
                );
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry) {
                        setAddressPosition({
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                        });
                    }
                });
                autocompleteRef.current = autocomplete;
            }

            // Initialize map
            const { Map, InfoWindow } = await google.maps.importLibrary('maps');
            const map = new Map(mapRef.current, {
                center: { lat: -37.82784236810657, lng: 144.98001835986358 },
                zoom: 13,
                gestureHandling: "greedy",
                mapId: '5185d1d2d24d83d0'
            });
            mapInstanceRef.current = map;

            // Initialize directions
            directionsServiceRef.current = new google.maps.DirectionsService();
            directionsRendererRef.current = new google.maps.DirectionsRenderer();
            directionsRendererRef.current.setMap(map);

            // Create info windows and markers
            const fitzroyWindow = new InfoWindow({
                content: `<h6 class="firstHeading">Fitzroy Mental Health Haven</h6>`,
                disableAutoPan: true
            });
            infoWindowsRef.current.fitzroy = fitzroyWindow;
            await createMarker(
                { lat: -37.80583882048806, lng: 144.97696699728516 }, 
                'Fitzroy Mental Health Haven', 
                map, 
                fitzroyWindow
            );

            const stkildaWindow = new InfoWindow({
                content: `<h6 class="firstHeading">St Kilda Well-Being Retreat</h6>`,
                disableAutoPan: true
            });
            infoWindowsRef.current.stkilda = stkildaWindow;
            await createMarker(
                { lat: -37.867898275562055, lng: 144.97894145495954 }, 
                'St Kilda Well-Being Retreat', 
                map, 
                stkildaWindow
            );

            const cbdWindow = new InfoWindow({
                content: `<h6 class="firstHeading">CBD Wellness Hub</h6>`,
                disableAutoPan: true
            });
            infoWindowsRef.current.cbd = cbdWindow;
            await createMarker(
                { lat: -37.81509581212219, lng: 144.9700621396134 }, 
                'CBD Wellness Hub', 
                map, 
                cbdWindow
            );
            
            // Map loaded successfully
            setMapLoading(false);
            setMapError(null);
        };

        if (typeof window !== 'undefined') {
            initializeMap();
        }
    }, []);

    const validateStartLocation = (blur) => {
        if (!blur) {
            setErrors(prev => ({ ...prev, start: null }));
        } else {
            if (address === "" && addressPosition === null) {
                if (blur) {
                    setErrors(prev => ({ ...prev, start: "* please enter your starting location" }));
                }
            } else if (addressPosition === null) {
                if (blur) {
                    setErrors(prev => ({ ...prev, start: '* please provide a valid location.' }));
                }
            } else {
                setErrors(prev => ({ ...prev, start: null }));
            }
        }
    };

    const updateSelection = (office) => {
        if (!office) {
            office = { name: "CBD Wellness Hub", position: { lat: -37.81509581212219, lng: 144.9700621396134 } };
        }
        setSelectedOffice(office);
        setDestinationPosition(office.position);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: office.position.lat, lng: office.position.lng });
            mapInstanceRef.current.setZoom(15);
        }
    };

    const seeDestination = (lat, lng, label) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: lat, lng: lng });
            mapInstanceRef.current.setZoom(15);
        }
        setDestinationPosition({ lat: lat, lng: lng });
        setSelectedOffice({ name: label, position: { lat: lat, lng: lng } });
    };

    const setStartMarker = async () => {
        validateStartLocation(true);
        if (!errors.start) {
            const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker');
            if (startMarkerRef.current) {
                startMarkerRef.current.map = null;
                startMarkerRef.current = null;
            }
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setDirections({ routes: [] });
                setTravelTime(null);
                setTravelDistance(null);
            }
            const pin = new PinElement({
                scale: 1.5,
                glyph: 'S',
                glyphColor: 'white',
            });
            const startMarker = new AdvancedMarkerElement({
                map: mapInstanceRef.current,
                position: addressPosition,
                content: pin.element,
            });
            startMarkerRef.current = startMarker;
            mapInstanceRef.current.setCenter(startMarker.position);
            startMarker.addListener('click', () => {
                mapInstanceRef.current.setCenter(startMarker.position);
                mapInstanceRef.current.setZoom(15);
            });
        }
    };

    const displayRoute = async () => {
        validateStartLocation(true);
        if (!errors.start) {
            await setStartMarker();
            if (directionsServiceRef.current && directionsRendererRef.current) {
                const request = {
                    origin: addressPosition,
                    destination: destinationPosition,
                    travelMode: 'DRIVING',
                };
                directionsRendererRef.current.setOptions({
                    polylineOptions: {
                        strokeColor: 'red',
                        strokeOpacity: 1.0,
                        strokeWeight: 6,
                    },
                    suppressMarkers: true
                });
                directionsServiceRef.current.route(request, (result, status) => {
                    if (status === 'OK') {
                        directionsRendererRef.current.setDirections(result);
                        const route = result.routes[0].legs[0];
                        setTravelTime(route.duration.text);
                        setTravelDistance(route.distance.text);
                    } else {
                        console.error('Directions request failed due to ' + status);
                    }
                });
                Object.values(infoWindowsRef.current).forEach(window => window.close());
            }
        }
    };

    const cancelRoute = () => {
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections({ routes: [] });
        }
        setTravelTime(null);
        setTravelDistance(null);
        setErrors({ location: null, start: null });
        setAddress('');
        setAddressPosition(null);
        if (startMarkerRef.current) {
            startMarkerRef.current.map = null;
            startMarkerRef.current = null;
        }
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: -37.82784236810657, lng: 144.98001835986358 });
            mapInstanceRef.current.setZoom(13);
        }
    };

    const getAddressFrom = async (lat, lng) => {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
            const data = await response.json();
            
            if (data.error_message) {
                setErrors(prev => ({ ...prev, location: "* Locator is unable to find your address. Please input manually." }));
            } else {
                setAddress(data.results[0].formatted_address);
            }
            setLoadPosition(false);
        } catch (error) {
            console.error(error.message);
            setLoadPosition(false);
        }
    };

    const locateUserLocation = () => {
        setLoadPosition(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    getAddressFrom(latitude, longitude);
                    setAddressPosition({ lat: latitude, lng: longitude });
                },
                error => {
                    setErrors(prev => ({ ...prev, location: "Unable to retrieve your location." }));
                    console.error(error.message);
                    setLoadPosition(false);
                }
            );
        } else {
            setErrors(prev => ({ ...prev, location: "Your browser does not support geolocation API." }));
            console.error("Browser does not support geolocation API");
            setLoadPosition(false);
        }
    };

    return (
        <div>
            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-5">
                <div className="text-[#26435D] text-2xl font-bold pt-10 pb-10">Who are we</div>
                <div className="text-xl leading-relaxed text-gray-700 mb-8">
                    At Harbor Hub, we are dedicated to providing support, resources, and a sense of community to individuals seeking to improve their mental well-being. Our target group includes people of all ages and backgrounds, particularly those who may face barriers to traditional mental health care. We strive to create a safe and inclusive space where everyone can access the help they need.
                </div>

                <div className="text-[#26435D] text-2xl font-bold pt-10 pb-10">Contact Us</div>
                <div className="flex justify-center gap-16 md:gap-8 flex-wrap pb-12 mb-8">
                    {/* CBD Wellness Hub Card */}
                    <div className="w-80 border border-gray-300 rounded-xl overflow-hidden shadow-lg bg-white transition-transform duration-300 hover:-translate-y-1">
                        <div className="overflow-hidden">
                            <Image 
                                alt="CBD Center Image" 
                                src="/about/cbd.png" 
                                width={400}
                                height={250}
                                className="w-full h-64 object-cover"
                            />
                        </div>
                        <div className="p-5">
                            <h5 className="text-xl font-bold text-[#26435D] mb-4">CBD Wellness Hub</h5>
                            <div className="text-gray-600">
                                <p className="pb-1">
                                    <strong>Address:</strong> 123 Collins Street, Melbourne, VIC 3000
                                </p>
                                <p className="pb-1">
                                    <strong>Office Hour:</strong> 8:00 - 17:00
                                </p>
                                <p>
                                    <strong>Phone:</strong> (03) 8521 6789
                                </p>
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-200">
                            <button 
                                className="bg-[#26435D] text-white border-none rounded-lg font-bold py-2.5 px-5 cursor-pointer transition-colors duration-300 hover:bg-[#1e3349]" 
                                onClick={() => seeDestination(-37.81509581212219, 144.9700621396134, 'CBD Wellness Hub')}
                            >
                                See Destination
                            </button>
                        </div>
                    </div>

                    {/* Fitzroy Mental Health Haven Card */}
                    <div className="w-80 border border-gray-300 rounded-xl overflow-hidden shadow-lg bg-white transition-transform duration-300 hover:-translate-y-1">
                        <div className="overflow-hidden">
                            <Image 
                                alt="Fitzroy Center Image" 
                                src="/about/fitzroy.png" 
                                width={400}
                                height={250}
                                className="w-full h-64 object-cover"
                            />
                        </div>
                        <div className="p-5">
                            <h5 className="text-xl font-bold text-[#26435D] mb-4">Fitzroy Mental Health Haven</h5>
                            <div className="text-gray-600">
                                <p className="pb-1">
                                    <strong>Address:</strong> 45 Brunswick Street, Fitzroy, VIC 3065
                                </p>
                                <p className="pb-1">
                                    <strong>Office Hour:</strong> 8:00 - 17:00
                                </p>
                                <p>
                                    <strong>Phone:</strong> (03) 9876 5432
                                </p>
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-200">
                            <button 
                                className="bg-[#26435D] text-white border-none rounded-lg font-bold py-2.5 px-5 cursor-pointer transition-colors duration-300 hover:bg-[#1e3349]" 
                                onClick={() => seeDestination(-37.80583882048806, 144.97696699728516, 'Fitzroy Mental Health Haven')}
                            >
                                See Destination
                            </button>
                        </div>
                    </div>

                    {/* St Kilda Well-Being Retreat Card */}
                    <div className="w-80 border border-gray-300 rounded-xl overflow-hidden shadow-lg bg-white transition-transform duration-300 hover:-translate-y-1">
                        <div className="overflow-hidden">
                            <Image 
                                alt="St Kilda Center Image" 
                                src="/about/stkilda.png" 
                                width={400}
                                height={250}
                                className="w-full h-64 object-cover"
                            />
                        </div>
                        <div className="p-5">
                            <h5 className="text-xl font-bold text-[#26435D] mb-4">St Kilda Well-Being Retreat</h5>
                            <div className="text-gray-600">
                                <p className="pb-1">
                                    <strong>Address:</strong> 89 Acland Street, St Kilda, VIC 3182
                                </p>
                                <p className="pb-1">
                                    <strong>Office Hour:</strong> 8:00 - 17:00
                                </p>
                                <p>
                                    <strong>Phone:</strong> (03) 9123 4567
                                </p>
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-200">
                            <button 
                                className="bg-[#26435D] text-white border-none rounded-lg font-bold py-2.5 px-5 cursor-pointer transition-colors duration-300 hover:bg-[#1e3349]" 
                                onClick={() => seeDestination(-37.867898275562055, 144.97894145495954, 'St Kilda Well-Being Retreat')}
                            >
                                See Destination
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map and Route Section */}
                <div className="flex flex-col lg:flex-row md:flex-row w-full max-w-7xl mx-auto pb-16 gap-5">
                    {/* Map Container */}
                    <div className="w-full lg:flex-1 rounded-xl border-2 border-[#26435D] relative h-[400px] sm:h-[500px] md:h-[710px] min-h-[300px]">
                        {mapLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                                <div className="text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-[#26435D] border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-[#26435D] font-semibold">Loading Google Maps...</p>
                                    <p className="text-gray-600 text-sm mt-2">Please ensure you have set up your Google Maps API key</p>
                                </div>
                            </div>
                        )}
                        {mapError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-xl">
                                <div className="text-center p-6">
                                    <div className="text-red-600 text-4xl mb-4">🗺️</div>
                                    <p className="text-red-600 font-semibold mb-2">Map Failed to Load</p>
                                    <p className="text-red-500 text-sm">{mapError}</p>
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}
                        <div ref={mapRef} id="map" className="w-full h-full rounded-xl"></div>
                    </div>
                    
                    {/* Route Controls Container */}
                    <div className="w-full lg:flex-1 bg-[#E0EDF9] p-4 sm:p-6 rounded-xl h-auto md:h-[710px] overflow-y-auto">
                        <div className="text-[#26435D] text-xl md:text-2xl font-bold pt-4">Search for your location:</div>
                        <div className="flex items-center gap-2 mt-4">
                            <input
                                id="autocomplete"
                                type="text"
                                value={address}
                                onChange={(e) => {
                                    setAddress(e.target.value);
                                    validateStartLocation(false);
                                }}
                                onBlur={() => validateStartLocation(true)}
                                className="h-10 flex-1 border-2 border-gray-300 rounded-lg px-2.5 text-base focus:outline-none focus:border-[#26435D]"
                            />
                            <button 
                                className="bg-[#26435D] text-white border-none rounded-lg font-bold py-2 px-3 cursor-pointer transition-colors duration-300 hover:bg-[#1e3349]" 
                                onClick={locateUserLocation} 
                                aria-label="Locate User Location"
                            >
                                📍
                            </button>
                            {loadPosition && (
                                <div className="flex items-center animate-spin">⟳</div>
                            )}
                        </div>
                        <div className="flex mt-3">
                            <button 
                                className="bg-[#26435D] text-white border-none rounded-lg font-bold py-2.5 px-5 cursor-pointer transition-colors duration-300 hover:bg-[#1e3349]"
                                onClick={setStartMarker}
                            >
                                Show on map
                            </button>
                        </div>
                        {errors.start && <div className="text-red-600 text-sm mt-1">{errors.start}</div>}
                        {errors.location && <div className="text-red-600 text-sm mt-1">{errors.location}</div>}

                        <div className="text-[#26435D] text-xl md:text-2xl font-bold pt-6">Target Destination:</div>
                        <div className="mt-4">
                            <select 
                                value={selectedOffice.name} 
                                onChange={(e) => {
                                    const office = offices.find(o => o.name === e.target.value);
                                    updateSelection(office);
                                }}
                                className="w-full p-2.5 border-2 border-gray-300 rounded-lg text-base bg-white focus:outline-none focus:border-[#26435D]"
                            >
                                {offices.map((office) => (
                                    <option key={office.name} value={office.name}>
                                        {office.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 my-5">
                            <div className="text-[#26435D] text-xl md:text-2xl font-bold">Route:</div>
                            <div className="flex gap-3">
                                <button 
                                    className="bg-[#26435D] text-white border-none rounded-lg font-bold py-2.5 px-5 cursor-pointer transition-colors duration-300 hover:bg-[#1e3349] text-sm sm:text-base" 
                                    onClick={displayRoute}
                                >
                                    See Route
                                </button>
                                <button 
                                    className="bg-[#26435D] text-white border-none rounded-lg font-bold py-2.5 px-5 cursor-pointer transition-colors duration-300 hover:bg-[#1e3349] text-sm sm:text-base" 
                                    onClick={cancelRoute}
                                >
                                    Cancel Route
                                </button>
                            </div>
                        </div>

                        <div className="text-[#26435D] text-xl md:text-2xl font-bold pb-2">Estimation:</div>
                        <div className="text-gray-700"><strong>Travel Time:</strong> {travelTime || 'N/A'}</div>
                        <div className="text-gray-700"><strong>Travel Distance:</strong> {travelDistance || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
