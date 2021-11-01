require('dotenv').config();
const express = require('express');

const app = express();

app.use(express.static('public'));
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
