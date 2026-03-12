require('dotenv').config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function test() {
    try {
        console.log("Client ID:", clientId);
        console.log("Client Secret:", clientSecret);

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString('base64')
            },
            body: "grant_type=client_credentials"
        });
        
        const data = await response.json();
        console.log("Token Response:", data);

        if (!response.ok) return;

        console.log("Token received, performing search API call...");
        let token = data.access_token;
        const res2 = await fetch(`https://api.spotify.com/v1/search?q=indian+hits&type=track&limit=2`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data2 = await res2.json();
        console.log("Spotify Search Response Error (if any):", data2.error);
        console.log("Tracks returned:", data2.tracks ? data2.tracks.items.length : "None");
    } catch(err) {
        console.error("Test Error:", err);
    }
}

test();
