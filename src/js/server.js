require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.get('/news', async (req, res) => {
  try {
    const { data } = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=kr&category=technology&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`
    );
    res.send(data.articles);
  } catch (e) {
    console.error(e.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
