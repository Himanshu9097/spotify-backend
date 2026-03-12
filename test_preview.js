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

    let uri = `https://api.spotify.com/v1/search?q=sajni&type=track&limit=5`;
    const res = await fetch(uri, { headers: { "Authorization": `Bearer ${token}` } });
    const d = await res.json();
    
    console.log("Found:", d.tracks.items.length);
    d.tracks.items.forEach(t => console.log(t.name, "Preview:", t.preview_url));
}

test();
