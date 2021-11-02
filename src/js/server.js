require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.static('public'));
app.use(express.json());

// Mock
const mockInterview = {
  category: 'Frontend',
  questionList: [
    {
      question: '1. 자기소개를 하세요',
      audio: 'url',
    },
    {
      question: '2. 강점 말해보세요',
      audio: 'url2',
    },
    {
      question: '3. 약점 말해보세요',
      audio: 'url3',
    },
    {
      question: '4. web viatal 설명 부탁',
      audio: 'url4',
    },
    {
      question: '5. this 바인딩 설명 부탁',
      audio: 'url5',
    },
    {
      question: '6. 취미 말해보세요 ',
      audio: 'url6',
    },
    {
      question: '7. 좋아하는 음식은? ',
      audio: 'url7',
    },
  ],
  totalTime: 56,
};

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

// GET/mockInterview
app.get('/mockInterview', (req, res) => {
  try {
    res.send(mockInterview);
  } catch (e) {
    console.error(e.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
