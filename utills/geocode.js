async function getCoordinates(location) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&addressdetails=1&limit=1`,
            {
                headers: {
                    "User-Agent": "WanderlustApp/1.0"
                }
            }
        );

        const data = await response.json();

        if (!data.length) return null;

        const place = data[0];

        return {
            lat: parseFloat(place.lat),
            lon: parseFloat(place.lon),
            country: place.address?.country || "",
            display_name: place.display_name
        };

    } catch (err) {
        console.log("Geocoding error:", err);
        return null;
    }
}

module.exports = getCoordinates;