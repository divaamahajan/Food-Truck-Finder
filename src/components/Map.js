import React, { useEffect, useRef } from "react";
import * as L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const Map = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Create a new map instance
    const map = L.map(mapContainerRef.current).setView(
      [37.7749, -122.4194],
      13
    );

    // Add a tile layer to display the map tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Map data © OpenStreetMap contributors",
    }).addTo(map);

    // Fetch food truck data from DataSF API
    axios
      .get("https://data.sfgov.org/resource/rqzj-sfat.json")
      .then((response) => {
        // Iterate through the food truck data
        response.data.forEach((foodTruck) => {
          // Create a custom marker icon
          const customIcon = L.icon({
            // iconUrl: require("../static/foodTruck.png").default,
            iconUrl :"https://www.freeiconspng.com/uploads/pink-restaurants-icon-19.png",
            iconSize: [32, 32],
          });
          
          // Create a marker for each food truck location with the custom icon
          const marker = L.marker([foodTruck.latitude, foodTruck.longitude], {
            icon: customIcon,
          }).addTo(map);

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
  }, []);

  return <div ref={mapContainerRef} style={{ height: "600px" }}></div>;
};

export default Map;
