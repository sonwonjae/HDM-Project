import axios from 'axios';

let news = [];
const $newsList = document.querySelector('.news__list');
const render = () => {
  $newsList.innerHTML = news
    .map(
      ({ title, url, urlToImage }) => `
        <li class="news__item img-card">
            <a href=${url} target="_blank" rel="noopener noreferrer">
                <div class="img-wrapper">
                  <img src=${urlToImage} alt=${title}/>
                </div>
                <p class="news__title">${title}</p>
            </a>
        </li>
    `
    )
    .join('');
};
const setNews = newNews => {
  news = newNews;
  render();
};
window.addEventListener('DOMContentLoaded', async () => {
  const { data: news } = await axios.get('./news');
  setNews(news);
});
