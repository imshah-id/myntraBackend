const fetch = require("node-fetch"); // Or built-in fetch if Node 18+

// Configuration
const API_URL = "http://localhost:5000"; // Adjust port if needed based on server.js
const AUTH_TOKEN = "test-token"; // We might need to bypass auth or use a valid token.
// For this script to be simple, we might want to temporarily allow the route or login first.
// However, the route uses 'auth' middleware.
// Let's assume we can login as a user first or just comment out auth for testing if allowed.
// But better: Login as a dummy user to get token.

async function sendOffer() {
  try {
    // 1. Login to get token (optional, if auth is strict)
    // For simplicity, let's assume we have a way or can just hit the endpoint if we disable auth for dev.
    // Actually, let's try to login with a known user or create one?
    // Too complex for a simple trigger script.

    // ALTERNATIVE: The script connects to DB and effectively calls the logic? No, too complex.

    // LET'S ASSUME: We will run this against the LIVE Url for now or local.
    // The prompt context says: Running terminal commands: npm start (in /home/shaenix/internship/myntra) -> Frontend.
    // Backend seems to be running on https://myntrabackend-eal6.onrender.com elsewhere?
    // Wait, the frontend calls `https://myntrabackend-eal6.onrender.com`.
    // So the backend interacts with a REMOTE server?
    // If I edit local backend files, they won't affect the remote server unless I deploy.
    // BUT the user asked me to "fix" and "implement" things.
    // If I am editing local backend files, I assume the user *will* deploy them or runs them locally.
    // If the frontend points to Render, my local backend changes are useless for the running app unless I change the frontend to point to localhost.

    // CRITICAL CHECK: Does the user run the backend locally?
    // "Running terminal commands: npm start (in /home/shaenix/internship/myntra)" -> Only frontend.
    // The previous interactions implied I am editing backend files.
    // I MUST assume the user intends to run the backend locally or deploy these changes.
    // However, the Frontend `app/checkout.tsx` (Step 38) has hardcoded `https://myntrabackend-eal6.onrender.com`.

    // If I implement a new endpoint locally, the frontend won't hit it unless I change the URL.
    // AND the script needs to hit the *running* backend.

    // If the user hasn't started the local backend, this script won't work locally.
    // I should probably advise the user to run the backend locally.

    // For the script `send_offer.js`, I will make it target the URL.
    // If I target the Render URL, my changes won't be there yet.
    // If I target Localhost, it only works if backend is running.

    // I will write the script to target Localhost by default but comment the Render URL.
    // I will also include a "Login" flow if possible, or just note that Auth is needed.

    // Simplify: Just write the payload and instructions.

    console.log("Sending Offer Notification...");

    const payload = {
      title: "🔥 Flash Sale! 50% OFF!",
      body: "Grab your favorite items now. Limited time offer on top brands.",
      data: { type: "offer", code: "FLASH50" },
    };

    // Note: You need a valid JWT token here.
    // For testing, you might want to temporarily disable auth on the broadcast route
    // OR paste a valid token from your app login.
    const token = "YOUR_JWT_TOKEN_HERE";

    const response = await fetch(`${API_URL}/api/notifications/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token, // or Authentication: Bearer ... check middleware
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

sendOffer();
