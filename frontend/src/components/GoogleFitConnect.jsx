









import React, { useState, useEffect } from "react";
import './GoogleFitConnect.css'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/fitness.activity.read";

const GoogleFitConnect = ({ onStepsUpdate }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [expiry, setExpiry] = useState(0);
  const [steps, setSteps] = useState(0);

  // Initialize Google OAuth2 Token Client
  const initTokenClient = () =>
    window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        const { access_token, expires_in } = tokenResponse;
        const now = Date.now();
        const exp = now + expires_in * 1000;

        // Save token and expiry in localStorage
        localStorage.setItem("gf_token", access_token);
        localStorage.setItem("gf_expiry", exp.toString());

        setAccessToken(access_token);
        setExpiry(exp);
      },
    });

  // Load stored token if still valid
  const loadStoredToken = () => {
    const token = localStorage.getItem("gf_token");
    const exp = parseInt(localStorage.getItem("gf_expiry") || "0", 10);
    const now = Date.now();
    if (token && exp > now + 60000) { // valid for 1 more min
      setAccessToken(token);
      setExpiry(exp);
      return token;
    }
    // Token expired or missing
    localStorage.removeItem("gf_token");
    localStorage.removeItem("gf_expiry");
    return null;
  };

  // Fetch steps from Google Fit and update backend
  const fetchSteps = async () => {
    const token = loadStoredToken();
    if (!token) return;
    const endTime = Date.now();
    const startTime = new Date().setHours(0, 0, 0, 0);

    try {
      const res = await fetch(
        "https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: "com.google.step_count.delta",
                dataSourceId:
                  "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startTime,
            endTimeMillis: endTime,
          }),
        }
      );

      const data = await res.json();
      const totalSteps =
        data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;

      setSteps(totalSteps);

      // Store steps in backend if no parent handler provided
      if (!onStepsUpdate) {
        const userToken = localStorage.getItem("token");
        if (userToken) {
          await fetch("http://localhost:3000/student/updateActivity", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ steps: totalSteps }),
          });
        }
      } else {
        // Call parent callback if passed
        onStepsUpdate(totalSteps);
      }
    } catch (err) {
      console.error("Error fetching steps:", err);
    }
  };
 
  

  // On mount, load token from localStorage or request permission
  useEffect(() => {
    const client = loadStoredToken();
    if (client) {
      fetchSteps();
      const intervalId = setInterval(fetchSteps, 10000);
      return () => clearInterval(intervalId);
    }
  }, []);

  const handleLogin = () => {
    const client = initTokenClient();
    client.requestAccessToken();
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      {!accessToken ? (
        <button className="refreshBut" onClick={handleLogin}>Connect Google Fit</button>
      ) : (
        <>
          <h2>Steps Today: {steps}</h2>
          <button onClick={fetchSteps} className="refreshBut">Refresh Steps</button>
        </>
      )}
    </div>
  );
};

export default GoogleFitConnect;



