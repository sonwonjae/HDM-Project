import axios from 'axios';

const $selectInterviewCategory = document.querySelector('.interview-set__info--category-title'); // 면접 카테고리
const $interviewSettingCnt = document.querySelector('.interview-set__info--count-input'); // 면접 질문 개수
const $startInterview = document.querySelector('.interview-start'); // 면접 시작 버튼
const $interviewSettingTime = document.querySelector('.interview-set__info--time-select'); // 면접 시간 선택
const $interviewSettingInfo = document.querySelector('.interview-guide');
const canvas = document.querySelector('.permission-check__audio--visualization');
const $modalWrap = document.querySelector('.modal-wrap');
const $modalContainerTimer = document.querySelector('.modal-container__counter');
const $modalContainerStart = document.querySelector('.modal-container__button-start');
const $container = document.querySelector('.container');

let count = 10;
let counterId = '';
const canvasCtx = canvas.getContext('2d');

// user interview setting state
let selectedCategory = '';
let interviewSettingCnt = 0;
let selectedTime = 0;
let cameraPermission = false;
let micPermission = false;

// get random idx for interview list
const getRandomIdxArr = (arr, cnt) => {
  const randomIndexArray = [];
  for (let i = 0; i < cnt; i++) {
    const randomNum = Math.floor(Math.random() * arr.length);
    if (randomIndexArray.indexOf(randomNum) === -1) {
      randomIndexArray.push(randomNum);
    } else {
      i--;
    }
  }
  return randomIndexArray;
};

// get random interview list
const getInterviewList = async () => {
  const category = $selectInterviewCategory.value;
  const { data } = await axios.get('/questionList');
  const randomQuestion = [];
  getRandomIdxArr(data[category], +interviewSettingCnt).forEach(cur => {
    randomQuestion.push(data[category][cur]);
  });
  return randomQuestion;
};

// set user interview setting info
const setUser = async () => {
  const selectedInterviewList = await getInterviewList();

  const user = {
    interviewList: selectedInterviewList,
    interviewCategory: selectedCategory,
    cameraPermission: false,
    micPermission: false,
    selectedTime,
  };
  axios.put('/userInfo', user);
};

const setModalTimer = () => {
  $modalContainerTimer.textContent = count;
  if (count >= 1) {
    count -= 1;
  } else {
    $modalContainerStart.disabled = false;
  }
};

// audio visualization
function visualize(stream) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);

  function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(255,255,255)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#605CFF';

    canvasCtx.beginPath();

    const sliceWidth = (WIDTH * 2.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 4;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }

  draw();
}

const checkMicPermission = () => {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(stream => {
        visualize(stream);
        micPermission = true;
      })
      .catch(error => {
        micPermission = false;
        console.log(error.name + ': ' + error.message);
      });
  }
};

const checkCameraPermission = () => {
  const constraints = {
    video: {
      facingMode: 'user',
    },
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(mediaStream => {
      const video = document.querySelector('video');
      video.srcObject = mediaStream;
      cameraPermission = true;
    })
    .catch(err => {
      cameraPermission = false;
      console.log(err.name + ': ' + err.message);
    });
};

const renderInterviewInfo = state => {
  $interviewSettingInfo.innerHTML = state
    ? `<div class="interview-setting__info"><span>선택한 ${selectedCategory} 면접은 ${interviewSettingCnt}문항으로 약 ${
        interviewSettingCnt * selectedTime
      }분동안 진행됩니다.</span></div>
  <div class="interview-setting__comment"><span>면접준비가 되었다면 면접 시작하기 버튼을 눌러주세요.</span></div>`
    : '';
};

// 카테고리, 개수, 시간, 카메라, 마이크 허용 시 시작하기 버튼 활성화
const checkStatus = () => selectedCategory && interviewSettingCnt && selectedTime && cameraPermission && micPermission;

window.addEventListener('DOMContentLoaded', checkMicPermission(), checkCameraPermission());

$container.onchange = () => {
  $startInterview.disabled = !checkStatus();
};

$interviewSettingTime.onchange = () => {
  selectedTime = $interviewSettingTime.options[$interviewSettingTime.selectedIndex].value;
  renderInterviewInfo(checkStatus());
};

$selectInterviewCategory.onchange = () => {
  selectedCategory = $selectInterviewCategory.options[$selectInterviewCategory.selectedIndex].text;
  renderInterviewInfo(checkStatus());
};

$interviewSettingCnt.onkeyup = e => {
  const regexp = /^[0-9]*$/;

  // 디바운스
  if (!regexp.test(e.target.value)) {
    window.alert('숫자만 입력해주세요.');
    e.target.value = '';
    return;
  }

  if (e.target.value > 20) {
    window.alert('질문 개수는 20개 이하로 입력해주세요.');
    e.target.value = '';
    return;
  }

  interviewSettingCnt = e.target.value;
  renderInterviewInfo(checkStatus());
};

$startInterview.onclick = () => {
  setUser();
  $modalWrap.classList.add('active');
  counterId = setInterval(setModalTimer, 1000);
};

$modalWrap.onclick = e => {
  if (!e.target.classList.contains('close')) return;
  $modalWrap.classList.remove('active');
  clearInterval(counterId);
};

$modalContainerStart.onclick = () => {
  window.location.href = '/interview.html';
};
