import axios from 'axios';
import timer from './utils/timer';
import modals from './utils/modal';

// DOM Nodes
const $title = document.querySelector('.title');

const $interviewCountCurrent = document.querySelector('.interview__count--current');
const $interviewCountTotal = document.querySelector('.interview__count--total');
const $interviewCamMain = document.querySelector('.interview__cam-main');
const $interviewAudioIconState = document.querySelector('.interview__audio-icon--state');
const $interviewTimer = document.querySelector('.interview__timer');
const $interviewRepeatButton = document.querySelector('.interview-buttons__repeat');
const $interviewSubmitButton = document.querySelector('.interview-buttons__submit');

const $modalOuter = document.querySelector('.modal-outer');
const $modalTitle = document.querySelector('.modal__title');
const $modalDescription = document.querySelector('.modal__description');
const $modalActionButton = document.querySelector('.modal__button');
const $modalCancelButton = document.querySelector('.cancel');

// state
let mediaRecorder;
let interviewTime = 0;
let currentInterviewNum = 1;
let lastInterviewNum = 0;
const canResetTime = 20;

let questionList = [];
const recordList = [];
const interviewResult = {
  category: '',
  totalTime: 0,
  questionList: [],
  selectedTime: 0,
  interviewTimeList: [],
};

// async function
const setVideo = async () => {
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

const setAudio = async () => {
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
const displayModal = ({ type, title, description, cancel, button }) => {
  // 빼도 되는지 확인
  timer.stop();

  if (type === 'init') {
    let count = 3;
    $modalActionButton.toggleAttribute('disabled', true);
    setTimeout(() => {
      $modalActionButton.toggleAttribute('disabled', false);
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
  $modalActionButton.textContent = button;
  $modalActionButton.dataset.type = type;
  $modalActionButton.focus();

  $modalCancelButton.classList.toggle('hidden', !cancel);
  $modalOuter.classList.toggle('hidden', false);
};

const displayResultModal = modaltype => {
  currentInterviewNum === lastInterviewNum ? displayModal(modals.result) : displayModal(modaltype);
};

// event binding
window.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { interviewList, interviewCategory, selectedTime },
  } = await axios.get('/userInfo');

  questionList = interviewList;
  interviewTime = selectedTime * 60;
  lastInterviewNum = interviewList.length;
  $title.textContent = interviewCategory;
  $interviewCountCurrent.textContent = currentInterviewNum;
  $interviewCountTotal.textContent = interviewList.length;
  if (lastInterviewNum === 0) window.location.replace('/');
  displayModal(modals.init);
  await setAudio();
});

// 다시 시작
$interviewRepeatButton.addEventListener('click', () => {
  mediaRecorder.pause();
  timer.stop();
  $interviewAudioIconState.classList.remove('audio-run');
  displayModal(modals.repeat);
});

// 답변 제출
$interviewSubmitButton.addEventListener('click', () => {
  mediaRecorder.pause();
  timer.stop();
  $interviewAudioIconState.classList.remove('audio-run');
  displayResultModal(modals.submit);
});

// 취소 버튼 클릭
$modalCancelButton.addEventListener('click', () => {
  mediaRecorder.resume();
  $interviewAudioIconState.classList.add('audio-run');

  timer.stop();
  timer.start(() => {
    if (timer.getTime() <= 0) {
      $interviewAudioIconState.classList.remove('audio-run');
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      displayResultModal(modals.timeout);
    }
    $interviewRepeatButton.toggleAttribute('disabled', interviewTime - timer.getTime() > canResetTime);
    $interviewTimer.textContent = timer.updateTime();
  }, 1000);

  $modalOuter.classList.toggle('hidden');
});

// 제출 버튼 클릭
$modalActionButton.addEventListener('click', async e => {
  const { type } = e.currentTarget.dataset;

  if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  mediaRecorder.start();

  if (type === 'init') setVideo();
  else if (type === 'repeat') mediaRecorder.repeat = 'repeat';
  else if (type === 'submit' || type === 'timeout') {
    currentInterviewNum += 1;
    $interviewCountCurrent.textContent = currentInterviewNum;
  }

  try {
    const { data: userInfo } = await axios.get('/userInfo');
    interviewResult.category = userInfo.interviewCategory;
    interviewResult.selectedTime = userInfo.selectedTime * 60;

    if (type !== 'init') {
      interviewResult.interviewTimeList.push(userInfo.selectedTime * 60 - timer.getTime());
      interviewResult.totalTime += userInfo.selectedTime * 60 - timer.getTime();
      if (type === 'repeat') {
        interviewResult.totalTime -= userInfo.selectedTime * 60 - timer.getTime();
        interviewResult.interviewTimeList.pop();
      }
    }

    if (type === 'result') {
      recordList.forEach((e, i) => {
        interviewResult.questionList.push({ question: `${i + 1}. ${questionList[i]}`, audio: e });
      });

      await axios.put('/mockInterview/update', interviewResult, { maxBodyLength: Infinity });

      window.location.replace('/report.html');
    } else {
      const xmlData = `<speak>${questionList[currentInterviewNum - 1]}</speak>`;
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

  timer.stop();
  timer.setTime(interviewTime);
  timer.start(() => {
    if (timer.getTime() <= 0) {
      $interviewAudioIconState.classList.remove('audio-run');
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      displayResultModal(modals.timeout);
    }
    $interviewRepeatButton.toggleAttribute('disabled', interviewTime - timer.getTime() > canResetTime);
    $interviewTimer.textContent = timer.updateTime();
  }, 1000);

  $interviewAudioIconState.classList.add('audio-run');
  $modalOuter.classList.toggle('hidden', true);
});
