const { default: axios } = require('axios');

// Constant Number-------------
const EXECUTE_AFTER_MILLISECOND = 100;
const SCROLL_DOWN_PAGE_Y = 300;

// state
let state = {
  category: '',
  questionList: [],
  totalTime: 0,
  selectedTime: 0,
  progressedTime: [],
};

// DOM Nodes--------------------
const $scrollUp = document.querySelector('.scroll-up');
const $recordList = document.querySelector('.record-list');
const $bar = document.querySelector('.bar');
const $line = document.querySelector('.line');
const $barChart = document.querySelector('.bar-chart');
const $lineChart = document.querySelector('.line-chart');
// Functions --------------------
const createChart = () => {
  const labels = Array.from({ length: state.progressedTime.length }).map((_, i) => `${i + 1}번`);
  const data = {
    labels,
    datasets: [
      {
        label: '문제당 평균 진행 시간',
        // 동적 데이터
        data: state.progressedTime.map(time => time),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)',
        ],
        barThickness: 40,
        borderWidth: 1,
        fill: true,
        tension: 0.2,
      },
    ],
  };

  const config = {
    type: 'bar',
    data,
    options: {
      scales: {
        y: {
          min: 0,
          max: state.selectedTime,
          ticks: {
            callback(value) {
              return value + '초';
            },
          },
        },
      },
    },
  };

  const configLine = {
    type: 'line',
    data,
    options: {
      scales: {
        y: {
          min: 0,
          max: state.selectedTime,
          ticks: {
            callback(value) {
              return value + '초';
            },
          },
        },
      },
    },
  };

  (() => new Chart(document.querySelector('.bar-chart'), config))();
  (() => new Chart(document.querySelector('.line-chart'), configLine))();
};

const render = () => {
  createChart();

  document.querySelector('.interview-type').innerHTML = `${state.category} 면접`;
  document.querySelector('.total-time__min').innerHTML = `${parseInt(state.totalTime / 60)}분 ${
    state.totalTime % 60
  }초`;
  document.querySelector('.average-time__min').innerHTML = `${parseInt(
    state.totalTime / state.questionList.length / 60
  )}분 ${(state.totalTime / state.questionList.length) % 60}초`;
  $recordList.innerHTML = state.questionList
    .map(({ question, audio }) => {
      const url = URL.createObjectURL(new Blob([new Uint8Array(audio.split(','))]));
      return `<div class="interview-question">
          <li class="record-list__no">
            <h4 class="question-type">${question}</h4>
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
  if (state.progressedTime.length === 0) window.location.replace('/');
  const { data } = await axios.get('/mockInterview', { maxBodyLength: Infinity });
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
$bar.onclick = e => {
  e.target.style.background = '#605cff';
  $line.style.background = '#c9c9c9';
  $barChart.classList.add('active');
  $lineChart.classList.remove('active');
};
$line.onclick = e => {
  e.target.style.background = '#605cff';
  $bar.style.background = '#c9c9c9';
  $lineChart.classList.add('active');
  $barChart.classList.remove('active');
};
