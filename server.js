const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Tell the server to look for files in your main folder
app.use(express.static(path.join(__dirname)));

// Route for the Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for all other pages (Live, Market, Games, etc.)
app.get('/:page', (req, res) => {
  res.sendFile(path.join(__dirname, req.params.page));
});

app.listen(PORT, () => {
  console.log(`NAWI EMPIRE Engine Active on Port ${PORT}`);
});
