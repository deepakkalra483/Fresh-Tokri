/**
 * useGeoLocation.js
 * Custom hook — handles browser Geolocation + Nominatim reverse geocoding.
 * NEVER asks for permission automatically. Only fires when `requestLocation()` is called.
 */
import { useState, useCallback } from "react";

export function useGeoLocation() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | denied | error
  const [geoAddress, setGeoAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const requestLocation = useCallback(async (onSuccess) => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Your browser does not support location access.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};

          // Build a rich street-level line
          // e.g. "12, Shivaji Nagar, Near Bus Stand, MG Road"
          const flat =
            [
              addr.house_number,
              addr.amenity || addr.building || addr.shop || addr.office,
              addr.road || addr.pedestrian || addr.footway,
              addr.neighbourhood || addr.quarter,
              addr.suburb || addr.village_residential,
            ]
              .filter(Boolean)
              .join(', ') || data.display_name?.split(',').slice(0, 3).join(',').trim() || 'Current Location';

          // Build a city/district/state line with pincode
          // e.g. "Bhiwani, Haryana 127021"
          const cityPart = addr.city || addr.town || addr.municipality || addr.village || addr.hamlet || '';
          const districtPart = addr.state_district || addr.county || '';
          const statePart = addr.state || '';
          const pincode = addr.postcode || '';

          const areaParts = [cityPart, districtPart !== cityPart ? districtPart : '', statePart].filter(Boolean);
          const area = (areaParts.join(', ') + (pincode ? ` ${pincode}` : '')).trim();

          const result = {
            id: "gps-current",
            label: "Current Location",
            flat,
            area,
            tag: "GPS",
            lat: latitude,
            lng: longitude,
          };

          setGeoAddress(result);
          setStatus("success");
          if (onSuccess) onSuccess(result);
        } catch {
          setStatus("error");
          setErrorMsg("Could not fetch address. Please try again.");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMsg(
            "Location permission was denied. Please allow it from your browser settings and try again."
          );
        } else {
          setStatus("error");
          setErrorMsg("Unable to detect location. Please try again.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setGeoAddress(null);
    setErrorMsg("");
  }, []);

  return { status, geoAddress, errorMsg, requestLocation, reset };
}
