import axios from 'axios';
import timer from './timer';
import modals from './modal';

// import axios from 'axios';
// import speak from './speak';

// DOM Nodes
const $title = document.querySelector('.title');

const $interviewCountCurrent = document.querySelector('.interview__count--current');
const $interviewCountTotal = document.querySelector('.interview__count--total');
const $interviewCamMain = document.querySelector('.interview__cam-main');
const $interviewTimer = document.querySelector('.interview__timer');
const $interviewButtonsRepeat = document.querySelector('.interview-buttons__repeat');
const $interviewButtonsSubmit = document.querySelector('.interview-buttons__submit');

const $modalOuter = document.querySelector('.modal-outer');
const $modalTitle = document.querySelector('.modal__title');
const $modalButton = document.querySelector('.modal__button');
const $modalCancle = document.querySelector('.cancle');

// state
let startTime = 0;
let currentInterview = 1;
const recordList = [];
const stopTime = 20;
let totalInterview = 0;

// async function
const playVideo = async () => {
  const videoStream = await navigator.mediaDevices.getUserMedia({
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720,
      },
    },
  });
  $interviewCamMain.srcObject = videoStream;
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();

function makeSound(stream) {
  const source = audioCtx.createMediaStreamSource(stream);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

let mediaRecorder;

const recordAudio = async () => {
  let chunks = [];
  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(audioStream);
  console.log(mediaRecorder);

  audioCtx.resume();
  makeSound(audioStream);

  $modalButton.addEventListener('click', () => {
    if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    mediaRecorder.start();
  });

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, {
      type: 'audio/ogg codecs=opus',
    });
    chunks = [];

    // let byteArray;
    //  = new Uint8Array(byteNumbers);

    console.log(blob);

    await blob.arrayBuffer().then(res => {
      const byteArray = new Uint8Array(res);
      recordList.push([...byteArray]);
    });
  };

  mediaRecorder.ondataavailable = e => {
    chunks.push(e.data);
  };
};

const interviewResultObj = {
  category: 'Backend',
  totalTime: 10,
  questionList: [],
};
// // async function
// const putInterviewResult = async () => {
//   try {
//     axios.put('/mockInterview/update', interviewResultObj);
//   } catch (e) {
//     console.error(e);
//   }
// };

// helper
const updateTimer = () => {
  $interviewButtonsRepeat.toggleAttribute('disabled', startTime - timer.getTime() > stopTime);
  $interviewTimer.textContent = timer.updateTime();
};

const displayModal = ({ type, title, describtion, cancle, button }) => {
  if (type === 'init') {
    let count = 2;
    $modalButton.toggleAttribute('disabled', true);
    console.log($modalTitle.textContent);
    setTimeout(() => {
      $modalButton.toggleAttribute('disabled', false);
      $modalTitle.textContent = `면접 준비가 완료되었습니다!`;
    }, count * 1000);
    const intervalId = setInterval(() => {
      count--;
      if (count === 1) clearInterval(intervalId);
      $modalTitle.textContent = `${count}초 후 버튼이 활성화됩니다.`;
    }, 1000);
  }
  document.querySelector('.modal__title').textContent = title;
  document.querySelector('.modal__describtion').textContent = describtion;
  $modalButton.textContent = button;
  $modalButton.dataset.type = type;
  $modalButton.focus();

  $modalCancle.classList.toggle('hidden', !cancle);
  $modalOuter.classList.toggle('hidden');
};

const toggleModal = obj => {
  currentInterview === totalInterview ? displayModal(modals.result) : displayModal(obj);
};

// event binding

window.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { interviewList, interviewCategory, selectedTime },
  } = await axios.get('/userInfo');
  startTime = selectedTime;
  // startTime = selectedTime * 60;
  totalInterview = interviewList.length;
  $title.textContent = interviewCategory;
  $interviewCountCurrent.textContent = currentInterview;
  $interviewCountTotal.textContent = interviewList.length;
  displayModal(modals.init);
  await recordAudio();
});

// 다시 시작
$interviewButtonsRepeat.onclick = () => {
  timer.stop();
  displayModal(modals.repeat);
};

// 답변 제출
$interviewButtonsSubmit.onclick = () => toggleModal(modals.submit);

// 취소 버튼 클릭
$modalCancle.onclick = () => {
  timer.stop();
  timer.start(() => {
    if (timer.getTime() === 0) {
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      toggleModal(modals.timeout);
    }
    updateTimer();
  }, 1000);

  $modalOuter.classList.toggle('hidden');
};

// submit 버튼 클릭
// $modalButton.onclick = async e => {
$modalButton.addEventListener('click', async e => {
  const { type } = e.currentTarget.dataset;
  if (type === 'init') playVideo();
  if (type === 'result') {
    setTimeout(() => {
      recordList.forEach((e, i) => {
        interviewResultObj.questionList.push({ question: i + 1, audio: e });
      });
      axios.put('/mockInterview/update', interviewResultObj);

      window.location.href = '/report.html';
    }, 1000);

    return;
  }
  if (type === 'submit' || type === 'timeout') {
    currentInterview += 1;
    $interviewCountCurrent.textContent = currentInterview;
  }

  timer.stop();
  timer.setTime(startTime);
  timer.start(() => {
    if (timer.getTime() === 0) {
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      toggleModal(modals.timeout);
    }
    updateTimer();
  }, 1000);

  $modalOuter.classList.toggle('hidden', true);

  try {
    const xmlData = `<speak>${(await axios.get('/userInfo')).data.interviewList[currentInterview - 1]}</speak>`;
    console.log(xmlData);

    const { data } = await axios.post('https://kakaoi-newtone-openapi.kakao.com/v1/synthesize', xmlData, {
      headers: {
        'Content-Type': 'application/xml',
        Authorization: 'KakaoAK 94d7ab8868125fad5c255d42c430f62a',
      },
      responseType: 'arraybuffer',
    });

    const context = new AudioContext();
    context.resume();
    context.decodeAudioData(data, buffer => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
    });
  } catch (e) {
    console.error(e.message);
  }
});
