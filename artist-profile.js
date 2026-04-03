// THE ARTIST SCHEMA (server.js)
const ArtistSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    stageName: String,
    realName: String, // Kept Private
    bio: String,
    genre: String,
    socialLinks: [String],
    
    // 🏆 REWARD DATA
    totalStreamingCoins: { type: Number, default: 0 },
    verifiedRoyaltyRate: { type: Number, default: 0.02 }, // Our $0.02 standard
    imperialAwards: [{ title: String, date: Date }], // e.g., "Top Music Pillar 2024"
    
    // 🛡️ AUTHENTICATION
    nodeCertificate: String, // The digital hash of their Node 001 License
});

// UPDATE PROFILE ROUTE
app.post('/api/artist/update-profile', async (req, res) => {
    const { userId, stageName, genre, bio } = req.body;
    
    const updatedArtist = await Artist.findOneAndUpdate(
        { userId },
        { stageName, genre, bio },
        { new: true, upsert: true }
    );

    // Trigger an "Imperial Notification" once they update
    res.json({ 
        success: true, 
        message: "Identity Secured. Your Artist Profile is now Node 001 Authorized.",
        profile: updatedArtist
    });
});
