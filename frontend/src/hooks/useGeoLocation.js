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

          const flat =
            [addr.road, addr.neighbourhood, addr.suburb]
              .filter(Boolean)
              .join(", ") || "Current Location";

          const area =
            [addr.city || addr.town || addr.village, addr.state_district, addr.state]
              .filter(Boolean)
              .join(", ") || "";

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
