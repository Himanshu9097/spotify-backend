require('dotenv').config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function test() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString('base64')
        },
        body: "grant_type=client_credentials"
    });
    
    const data = await response.json();
    let token = data.access_token;
    
    // Test with various limits
    let limits = [10, 20, 30, 40, 50, "30", undefined];
    for(let limit of limits) {
        let uri = limit !== undefined 
            ? `https://api.spotify.com/v1/search?q=test&type=track&limit=${limit}`
            : `https://api.spotify.com/v1/search?q=test&type=track`;
        const res = await fetch(uri, { headers: { "Authorization": `Bearer ${token}` } });
        const d = await res.json();
        console.log("Limit", limit, "->", d.error ? d.error.message : "Success");
    }
}

test();
