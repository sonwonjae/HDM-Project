import axios from 'axios';
import timer from './timer';
import modals from './modal';

// DOM Nodes
const $title = document.querySelector('.title');

const $interviewCountCurrent = document.querySelector('.interview__count--current');
const $interviewCountTotal = document.querySelector('.interview__count--total');
const $interviewCamMain = document.querySelector('.interview__cam-main');
const $interviewAudioIconState = document.querySelector('.interview__audio-icon--state');
const $interviewTimer = document.querySelector('.interview__timer');
const $interviewButtonsRepeat = document.querySelector('.interview-buttons__repeat');
const $interviewButtonsSubmit = document.querySelector('.interview-buttons__submit');

const $modalOuter = document.querySelector('.modal-outer');
const $modalTitle = document.querySelector('.modal__title');
const $modalDescription = document.querySelector('.modal__description');
const $modalButton = document.querySelector('.modal__button');
const $modalCancle = document.querySelector('.cancle');

// state
let startTime = 0;
let currentInterview = 1;
const recordList = [];
const stopTime = 20;
let totalInterview = 0;
let questionList = [];
const interviewResultObj = {
  category: '',
  totalTime: 0,
  questionList: [],
  selectedTime: 0,
  progressedTime: [],
};

// async function
const getVideo = async () => {
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

let mediaRecorder;

const getAudio = async () => {
  let chunks = [];
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(audioStream);
  audioCtx.resume();

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, {
      type: 'audio/ogg codecs=opus',
    });
    chunks = [];
    await blob.arrayBuffer().then(res => {
      const byteArray = new Uint8Array(res);

      recordList.push([...byteArray].join(','));
      if (mediaRecorder.repeat) {
        recordList.pop();
        mediaRecorder.repeat = null;
      }
    });
  };

  mediaRecorder.ondataavailable = e => {
    chunks.push(e.data);
  };
};

// helper
const updateTimer = () => {
  $interviewButtonsRepeat.toggleAttribute('disabled', startTime - timer.getTime() > stopTime);
  $interviewTimer.textContent = timer.updateTime();
};

const displayModal = ({ type, title, description, cancle, button }) => {
  timer.stop();
  if (type === 'init') {
    let count = 3;
    $modalButton.toggleAttribute('disabled', true);
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
  $modalTitle.textContent = title;
  $modalDescription.textContent = description;
  $modalButton.textContent = button;
  $modalButton.dataset.type = type;
  $modalButton.focus();

  $modalCancle.classList.toggle('hidden', !cancle);
  $modalOuter.classList.toggle('hidden', false);
};

const toggleModal = obj => {
  currentInterview === totalInterview ? displayModal(modals.result) : displayModal(obj);
};

// event binding
window.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { interviewList, interviewCategory, selectedTime },
  } = await axios.get('/userInfo');

  questionList = interviewList;
  startTime = selectedTime * 60;
  totalInterview = interviewList.length;
  $title.textContent = interviewCategory;
  $interviewCountCurrent.textContent = currentInterview;
  $interviewCountTotal.textContent = interviewList.length;
  if (totalInterview === 0) window.location.replace('/');
  displayModal(modals.init);
  await getAudio();
});

// 다시 시작
$interviewButtonsRepeat.addEventListener('click', () => {
  mediaRecorder.pause();
  timer.stop();
  $interviewAudioIconState.classList.remove('audio-run');
  displayModal(modals.repeat);
});

// 답변 제출
$interviewButtonsSubmit.addEventListener('click', () => {
  mediaRecorder.pause();
  $interviewAudioIconState.classList.remove('audio-run');
  toggleModal(modals.submit);
});

// 취소 버튼 클릭
$modalCancle.addEventListener('click', () => {
  mediaRecorder.resume();
  $interviewAudioIconState.classList.add('audio-run');

  timer.stop();
  timer.start(() => {
    if (timer.getTime() <= 0) {
      $interviewAudioIconState.classList.remove('audio-run');
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      toggleModal(modals.timeout);
    }
    updateTimer();
  }, 1000);

  $modalOuter.classList.toggle('hidden');
});

// 제출 버튼 클릭
$modalButton.addEventListener('click', async e => {
  const { type } = e.currentTarget.dataset;

  if (type === 'init') getVideo();

  if (type === 'repeat') mediaRecorder.repeat = 'repeat';

  if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  mediaRecorder.start();

  if (type === 'submit' || type === 'timeout') {
    currentInterview += 1;
    $interviewCountCurrent.textContent = currentInterview;
  }

  try {
    const { data: userInfo } = await axios.get('/userInfo');
    interviewResultObj.category = userInfo.interviewCategory;
    interviewResultObj.selectedTime = userInfo.selectedTime * 60;

    if (type !== 'init') {
      interviewResultObj.progressedTime.push(userInfo.selectedTime * 60 - timer.getTime());
      interviewResultObj.totalTime += userInfo.selectedTime * 60 - timer.getTime();
      if (type === 'repeat') {
        interviewResultObj.totalTime -= userInfo.selectedTime * 60 - timer.getTime();
        interviewResultObj.progressedTime.pop();
      }
    }

    if (type === 'result') {
      recordList.forEach((e, i) => {
        interviewResultObj.questionList.push({ question: `${i + 1}. ${questionList[i]}`, audio: e });
      });

      await axios.put('/mockInterview/update', interviewResultObj, { maxBodyLength: Infinity });

      window.location.replace('/report.html');
    }

    if (type !== 'result') {
      const xmlData = `<speak>${questionList[currentInterview - 1]}</speak>`;

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
    }
  } catch (e) {
    console.error(e.message);
  }

  $interviewAudioIconState.classList.add('audio-run');
  timer.stop();
  timer.setTime(startTime);
  timer.start(() => {
    if (timer.getTime() <= 0) {
      $interviewAudioIconState.classList.remove('audio-run');
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      toggleModal(modals.timeout);
    }
    updateTimer();
  }, 1000);

  $modalOuter.classList.toggle('hidden', true);
});
