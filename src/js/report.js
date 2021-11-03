const { default: axios } = require('axios');

// Constant Number-------------
const EXECUTE_AFTER_MILLISECOND = 100;
const SCROLL_DOWN_PAGE_Y = 300;

// state
let state = {
  category: '',
  questionList: [],
  totalTime: 0,
};

// DOM Nodes--------------------
const $scrollUp = document.querySelector('.scroll-up');
const $recordList = document.querySelector('.record-list');

const render = () => {
  document.querySelector('.total-time__min').innerHTML = `${state.totalTime}분`;
  document.querySelector('.average-time__min').innerHTML = `${Math.floor(
    state.totalTime / state.questionList.length
  )}분`;
  $recordList.innerHTML = state.questionList
    .map(({ question, audio }) => {
      console.log(audio);
      const url = URL.createObjectURL(new Blob([new Uint8Array(audio)]));
      // const audioURL = URL.createObjectURL(audio);
      return `<div class="interview-question">
          <li class="record-list__no">
            <h4>${question}</h4>
            <audio class="record-list__no--audio" controls>
              <source src="${url}" type="audio/wav" />
            </audio>
            <a class="download" href="" download="${url}" title="download audio"> </a>
            </li>
        </div>`;
    })
    .join('');
};
const setState = newState => {
  state = newState;
  render();
};

// Event Binding----------------
window.addEventListener('DOMContentLoaded', async () => {
  const { data } = await axios.get('/mockInterview');
  setState(data);
});
window.onscroll = _.throttle(() => {
  window.pageYOffset > SCROLL_DOWN_PAGE_Y ? ($scrollUp.style.display = 'block') : ($scrollUp.style.display = 'none');
}, EXECUTE_AFTER_MILLISECOND);

$scrollUp.onclick = () => {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  });
};
