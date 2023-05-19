import React, { useState } from "react";
import "../styles/FoodTruckPopup.css";

const FoodTruckPopup = (props) => {
  return (
    <div className="popup-container">
      <h3 className="popup-title">{props.foodTruck.applicant}</h3>
      <p className="popup-description">
        <b>Food Items:</b> {props.foodTruck.fooditems}
      </p>
      <p className="popup-description">
        <b>Address:</b> {props.foodTruck.address}
      </p>
      {props.foodTruck.dayshours && (
        <p className="popup-description">
          <b>Hours:</b> {props.foodTruck.dayshours}
        </p>
      )}
      {props.distance !== null && (
        <p className="popup-description">
          <b>Distance:</b> {props.distance} miles
        </p>
      )}
      {/* <button
        className="calculate-distance-button"
        onClick={props.onCalculateDistance}
      >
        Calculate Distance
      </button> */}
    </div>
  );
};

export default FoodTruckPopup;
