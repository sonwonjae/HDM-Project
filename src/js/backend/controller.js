const axios = require('axios');
const db = require('./db');

const isValidNews = () => {
  const halfDay = 1000 * 60 * 60 * 12;
  return new Date() - db.news.updatedAt < halfDay;
};

exports.getNews = async (req, res) => {
  if (db.news.updatedAt !== 0 && isValidNews()) {
    res.send(db.news.articles);
    return;
  }

  try {
    const {
      data: { articles },
    } = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=kr&category=technology&apiKey=${process.env.NEWS_API_KEY}`
    );
    db.news.value = {
      updatedAt: new Date(),
      articles,
    };
    res.send(articles);
  } catch (e) {
    console.error(e.message);
  }
};

exports.getInterview = (req, res) => {
  try {
    res.send(db.interview);
  } catch (e) {
    console.error(e.message);
  }
};

exports.putInterview = (req, res) => {
  try {
    db.interview.value = req.body;
    res.send(db.interview);
  } catch (e) {
    console.error(e.message);
  }
};

exports.getQuestionList = (req, res) => {
  try {
    res.send(db.questionList);
  } catch (e) {
    console.error(e.message);
  }
};

exports.postQuestionList = (req, res) => {
  try {
    const { custom } = req.body;
    const newCustomList = custom
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gm, '')
      .split(/\r\n/g)
      .map(str => str.trim());

    db.questionList.customValue = newCustomList;
    // console.log({ custom: [...db.questionList.custom, ...newCustomList] });
    res.send(db.questionList);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('error');
  }
};

exports.getUser = (req, res) => {
  try {
    res.send(db.user);
  } catch (e) {
    console.error(e.message);
  }
};

exports.putUser = (req, res) => {
  try {
    const newUser = req.body;
    db.user.value = newUser;
    res.send(db.user);
  } catch (e) {
    console.error(e.message);
  }
};
