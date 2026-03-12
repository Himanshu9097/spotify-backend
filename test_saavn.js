async function test() {
    try {
        const response = await fetch("https://saavn.dev/api/search/songs?query=sajni+laapataa");
        const data = await response.json();
        console.log("Success?", data.success);
        console.log("First track URL:", data.data?.results?.[0]?.downloadUrl);
    } catch(err) {
        console.log("Error:", err.message);
    }
}
test();
