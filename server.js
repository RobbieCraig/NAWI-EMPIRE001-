const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve all static files (images, css, html)
app.use(express.static(__dirname));

// 2. The Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. THE AUTOMATIC FIX: This handles ALL buttons (Live, Market, Ads, etc.)
app.get('*', (req, res) => {
    // This looks at the URL (like /live) and adds .html automatically
    let requestedPage = req.params[0].replace('/', '');
    if (!requestedPage.includes('.')) {
        requestedPage += '.html';
    }
    res.sendFile(path.join(__dirname, requestedPage), (err) => {
        if (err) {
            // If the file doesn't exist, send them back home instead of an error
            res.redirect('/');
        }
    });
});

app.listen(PORT, () => {
    console.log("NAWI EMPIRE CORE: ONLINE");
});

