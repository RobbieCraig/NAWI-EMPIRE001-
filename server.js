// This is the Database Connection Bridge
const MONGO_API_URL = "YOUR_MONGODB_DATA_ENDPOINT"; 

async function loadEmpireContent() {
    try {
        // This 'fetches' the videos and posts from your MongoDB
        const response = await fetch(MONGO_API_URL + '/posts');
        const data = await response.json();
        
        // This command tells the app to "Live-Render" the movies
        renderVideos(data); 
    } catch (error) {
        console.log("Database Connection Error. Excellency, check your API Key.");
    }
}

// Call the brain to wake up when the app opens
window.onload = loadEmpireContent;
