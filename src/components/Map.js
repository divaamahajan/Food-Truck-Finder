import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";

const Map = () => {
  const mapContainerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      // Dynamically load Leaflet library
      const L = await import("leaflet");
      // Check if map container reference is available
      if (!mapContainerRef.current) return;
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
      }

      // Create a new map instance if it doesn't exist
      if (mapContainerRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView(
          [37.7749, -122.4194],
          13
        );

        // Add a tile layer to display the map tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "Map data © OpenStreetMap contributors",
        }).addTo(mapRef.current);
      }

      // Fetch food truck data from DataSF API
      axios
        .get("https://data.sfgov.org/resource/rqzj-sfat.json")
        .then((response) => {
          // Iterate through the food truck data
          response.data.forEach((foodTruck) => {
            // Create a custom marker icon
            const customIcon = L.icon({
              iconUrl:
                "https://www.freeiconspng.com/uploads/pink-restaurants-icon-19.png",
              iconSize: [32, 32],
            });

            // Create a marker for each food truck location with the custom icon
            const marker = L.marker([foodTruck.latitude, foodTruck.longitude], {
              icon: customIcon,
            }).addTo(mapRef.current);

            // Bind a popup to the marker with food truck information
            marker.bindPopup(`
              <div>
                <h3>${foodTruck.applicant}</h3>
                <p>${foodTruck.fooditems}</p>
              </div>
            `);
          });
        })
        .catch((error) => {
          console.error("Error fetching food truck data:", error);
        });

      // Check if user location is available
      if (userLocation) {
        // Create a custom marker icon for user location
        const userIcon = L.icon({
          iconUrl:
            "https://github.com/divaamahajan/Food-Truck-Finder/blob/main/src/static/myLocation.png?raw=true",
          iconSize: [100, 100],
        });

        // Create a marker for user location with the custom icon
        const userMarker = L.marker(userLocation, {
          icon: userIcon,
        }).addTo(mapRef.current);

        // Zoom the map to user location
        mapRef.current.setView(userLocation, 13);

        // Bind a popup to the user marker
        userMarker.bindPopup("Your Location");
      }
    };

    loadLeaflet();
  }, [userLocation]);

  // Function to handle user location input
  const handleLocationInput = async (event) => {
    event.preventDefault();
    const location = event.target.location.value;
    if (location.trim() !== "") {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${location}&format=json`
        );
        const { lat, lon } = response.data[0];
        setUserLocation([parseFloat(lat), parseFloat(lon)]);
      } catch (error) {
        console.error("Error geocoding location:", error);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleLocationInput}>
        <input type="text" name="location" placeholder="Location" />
        <button type="submit">Go</button>
      </form>
      <div ref={mapContainerRef} style={{ height: "600px" }}></div>
    </div>
  );
};

export default Map;
