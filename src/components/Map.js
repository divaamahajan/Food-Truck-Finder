import React, { useEffect, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { ReactDOM } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";
import FoodTruckPopup from "./FoodTruckPopup";

const Map = () => {
  const mapContainerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const [distance, setDistance] = useState(null);

  const toRadians = (degrees) => {
    return (degrees * Math.PI) / 180;
  };

  const handleCalculateDistance = (lat1, lon1, lat2, lon2) => {
    const distanceInMiles = calculateDistance(lat1, lon1, lat2, lon2);
    setDistance(distanceInMiles);
  };

  // Function to calculate the distance between two coordinates in Miles
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2); // Return the distance rounded to 2 decimal places
  };

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
            if (foodTruck.facilitytype === "Truck") {
              // Create a custom marker icon
              const customIcon = L.icon({
                iconUrl:
                  "https://www.freeiconspng.com/uploads/pink-restaurants-icon-19.png",
                iconSize: [32, 32],
              });

              // Create a marker for each food truck location with the custom icon
              const marker = L.marker(
                [foodTruck.latitude, foodTruck.longitude],
                {
                  icon: customIcon,
                }
              ).addTo(mapRef.current);

              // Bind a popup to the marker with a function to generate the popup content
              marker.bindPopup(() => {
                return ReactDOMServer.renderToString(
                  <FoodTruckPopup
                    foodTruck={foodTruck}
                    userLocation={userLocation}
                    distance={distance}
                    onCalculateDistance={() =>
                      handleCalculateDistance(
                        foodTruck.latitude,
                        foodTruck.longitude,
                        userLocation[0],
                        userLocation[1]
                      )
                    }
                  />
                );
              });
              // // Attach a click event listener to the document and delegate the event handling
              // document.addEventListener("click", (event) => {
              //   if (
              //     event.target &&
              //     event.target.classList.contains("calculate-distance-button")
              //   ) {
              //     handleCalculateDistance();
              //   }
              // });
            }
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
            "https://github.com/divaamahajan/Food-Truck-Finder/blob/main/src/static/MyLocation.png?raw=true",
          iconSize: [200, 200],
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
    const address = event.target.location.value;
    const encodedAddress = encodeURIComponent(address);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json`
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setUserLocation([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleLocationInput} className="form">
        <input
          type="text"
          name="location"
          placeholder="Location"
          className="input-field"
        />
        <button type="submit" className="submit-button">
          Go
        </button>
      </form>
      <div
        ref={mapContainerRef}
        style={{ height: "600px" }}
        className="map-container"
      ></div>
    </div>
  );
};

export default Map;
