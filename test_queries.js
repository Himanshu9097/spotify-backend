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

    const queries = ['indian top hits', 'romantic hindi song', 'latest bollywood 2024'];

    for (const q of queries) {
        let uri = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`;
        console.log("Fetching:", uri);
        const res = await fetch(uri, { headers: { "Authorization": `Bearer ${token}` } });
        const d = await res.json();
        if(d.error) {
            console.log("Error for", q, ":", d.error);
        } else {
            console.log("Success for", q, "found items:", d.tracks?.items?.length);
            const withPreview = d.tracks?.items?.filter(t => t.preview_url);
            console.log("With preview:", withPreview?.length);
        }
    }
}

test();
