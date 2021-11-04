import axios from 'axios';

const THROTTLE_DELAY = 100;
const SCROLL_DOWN_PAGE_Y = 300;

let state = {
  category: '',
  questionList: [],
  totalTime: 0,
  selectedTime: 0,
  interviewTimeList: [],
};

const $scrollUp = document.querySelector('.scroll-up');
const $recordList = document.querySelector('.record-list');
const $displayBarBtn = document.querySelector('.bar');
const $displayLineBtn = document.querySelector('.line');
const $barChart = document.querySelector('.bar-chart');
const $lineChart = document.querySelector('.line-chart');

const createChart = () => {
  const labels = Array.from({ length: state.interviewTimeList.length }).map((_, i) => `${i + 1}번`);
  const data = {
    labels,
    datasets: [
      {
        label: '질문별 평균 답변 시간',
        data: state.interviewTimeList,
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

  const configBar = {
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

  (() => new Chart(document.querySelector('.bar-chart'), configBar))();
  (() => new Chart(document.querySelector('.line-chart'), configLine))();
};

const render = () => {
  createChart();

  document.querySelector('.interview-type').innerHTML = `${state.category} 면접`;
  document.querySelector('.total-time__min').innerHTML = `
      ${Math.floor(state.totalTime / 60)}분 ${state.totalTime % 60}초`;
  document.querySelector('.average-time__min').innerHTML = `
        ${Math.floor(state.totalTime / state.questionList.length / 60)}분 
        ${Math.floor((state.totalTime / state.questionList.length) % 60)}초`;
  $recordList.innerHTML = state.questionList
    .map(({ question, audio }) => {
      const url = URL.createObjectURL(new Blob([new Uint8Array(audio.split(','))]));
      return `
          <li class="interview-question">
            <div class="record-list__no">
              <h4 class="question-type question-ellipsis">${question}</h4>
              <audio class="record-list__no--audio" controls>
                <source src="${url}" type="audio/wav" />
              </audio>
              <a class="download" href="" download="${url}" title="download audio"> </a>
            </div>
          </li>`;
    })
    .join('');
};

const setState = newState => {
  state = newState;
  render();
};

window.addEventListener('DOMContentLoaded', async () => {
  const { data } = await axios.get('/interview', { maxBodyLength: Infinity });
  setState(data);
  if (state.questionList.length === 0) window.location.replace('/');
});

window.onscroll = _.throttle(() => {
  window.pageYOffset > SCROLL_DOWN_PAGE_Y ? ($scrollUp.style.display = 'block') : ($scrollUp.style.display = 'none');
}, THROTTLE_DELAY);

$scrollUp.onclick = () => {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  });
};

$displayBarBtn.onclick = e => {
  e.target.style.background = '#605cff';
  $displayLineBtn.style.background = '#c9c9c9';
  $barChart.classList.add('active');
  $lineChart.classList.remove('active');
};
$displayLineBtn.onclick = e => {
  e.target.style.background = '#605cff';
  $displayBarBtn.style.background = '#c9c9c9';
  $lineChart.classList.add('active');
  $barChart.classList.remove('active');
};
