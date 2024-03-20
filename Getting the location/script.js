'use strict';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const { latitude, longitude } = position.coords;
            console.log(`Your location: ${latitude}, ${longitude}`);

            const map = L.map('map').setView([latitude, longitude], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add marker for current location (Farmer icon)
            const farmerIcon = L.icon({
                iconUrl: '/pictures/pngtree-you-are-here-location-pointer-vector-png-image_6656543.png',
                iconSize: [50, 100],
                iconAnchor: [30, 100],
                popupAnchor: [-1, -55]
            });
            const currentLocationMarker = L.marker([latitude, longitude], { icon: farmerIcon }).addTo(map);
            currentLocationMarker.bindPopup('Your current location').openPopup();

            let nearestDistance = Number.POSITIVE_INFINITY;
            let nearestLabMarker = null;

            // Load locations from GeoJSON file

            fetch('locations.geojson')
                .then(response => response.json())
                .then(data => {
                    data.features.forEach(feature => {
                        const { coordinates } = feature.geometry;
                        const labDistance = calculateDistance(latitude, longitude, coordinates[1], coordinates[0]);
                        if (labDistance < nearestDistance) {
                            nearestDistance = labDistance;
                            if (nearestLabMarker) {
                                map.removeLayer(nearestLabMarker);
                            }
                            nearestLabMarker = L.marker([coordinates[1], coordinates[0]], {
                                icon: L.icon({
                                    iconUrl: '/pictures/21-science-technology_scientist-female-asian-1024.webp',
                                    iconSize: [50, 100],
                                    iconAnchor: [30, 100],
                                    popupAnchor: [-1, -55]
                                })
                            }).addTo(map);
                            let popupContent = '<b>' + feature.properties.name + '</b><br>';
                            for (const property in feature.properties) {
                                popupContent += property + ': ' + feature.properties[property] + '<br>';
                            }
                            nearestLabMarker.bindPopup(popupContent).openPopup();


                            // Update lab details in HTML

                        } else {
                            const marker = L.marker([coordinates[1], coordinates[0]]);
                            let popupContent = '<b>' + feature.properties.name + '</b><br>';
                            for (const property in feature.properties) {
                                popupContent += property + ': ' + feature.properties[property] + '<br>';
                            }
                            marker.bindPopup(popupContent);
                            marker.addTo(map);
                        }


                    });
                });
        }, function() {
            alert('Could not get your position');
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);  // deg2rad below
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }