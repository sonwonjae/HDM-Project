import axios from 'axios';

const router = require('../routes');

const $container = document.querySelector('.interview-set');
const $selectInterviewCategory = document.querySelector('.interview-set__info--category-select'); // 면접 카테고리
const $interviewSettingCnt = document.querySelector('.interview-set__info--count-input'); // 면접 질문 개수
const $interviewSettingTime = document.querySelector('.interview-set__info--time-select'); // 면접 시간 선택
const $startInterview = document.querySelector('.interview-start__button'); // 면접 시작 버튼
const $interviewSetNotice = document.querySelector('.interview-set__notice'); // 설정된 면접 내용 공지
const $audioVisualization = document.querySelector('.permission-check__audio--visualization'); // 오디오 테스트용
const $modalWrap = document.querySelector('.modal-wrap');
const $modalContainerTimer = document.querySelector('.modal-container__counter');
const $modalContainerStart = document.querySelector('.modal-container__start');

let count = 5; // 모달 카운트
let counterId = '';
const canvasCtx = $audioVisualization.getContext('2d');

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
    // i++ 없애기 else 안쓸 수 있게
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
  const { data } = await axios.get(router.questionList);
  const randomQuestion = [];
  getRandomIdxArr(data[category], +interviewSettingCnt).forEach(cur => {
    randomQuestion.push(data[category][cur]);
  });
  return randomQuestion;
};

// set user interview setting info
const setUser = async () => {
  // updateUser
  const selectedInterviewList = await getInterviewList();

  const user = {
    interviewList: selectedInterviewList,
    interviewCategory: selectedCategory,
    cameraPermission: false,
    micPermission: false,
    selectedTime,
  };
  axios.put(router.user, user);
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
  const WIDTH = $audioVisualization.width;
  const HEIGHT = $audioVisualization.height;

  source.connect(analyser);

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(255,255,255)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 4;
    canvasCtx.strokeStyle = '#605CFF';

    canvasCtx.beginPath();

    const sliceWidth = (WIDTH * 2.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo($audioVisualization.width, $audioVisualization.height / 4);
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
      facingMode: 'environment',
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

// 카테고리, 질문 개수, 시간, 카메라, 마이크 허용 시 시작하기 버튼 활성화   => isReady 식으로 이름 바꾸기
const checkStatus = () =>
  $selectInterviewCategory.value && +interviewSettingCnt && +selectedTime && cameraPermission && micPermission;

const render = () => {
  $interviewSetNotice.innerHTML = `<div class="interview-set__notice--selected"><span>선택한 <strong>${selectedCategory}</strong> 면접은
  <strong>${interviewSettingCnt}</strong>문항으로
  약 ${selectedTime * interviewSettingCnt}분동안 진행됩니다.</span></div>
  <div><span>면접준비가 되었다면 면접 시작하기 버튼을 눌러주세요.</span></div>`;
  $interviewSetNotice.classList.toggle('hidden', !checkStatus());
};

window.addEventListener('DOMContentLoaded', render(), checkMicPermission(), checkCameraPermission());

$container.onchange = () => {
  $startInterview.disabled = !checkStatus();
  render();
};

// 합쳐보기
$interviewSettingTime.onchange = () => {
  selectedTime = $interviewSettingTime.value;
  render();
};

// 커스텀 질문이 없거나 입력된 질문보다 큰 수가 입력되었는지 확인
const checkValidCustomQuestion = async () => {
  const { data } = await axios.get(router.questionList);
  if (!data.custom.length) {
    window.alert('추가된 질문이 없습니다! 메인 페이지에서 질문을 추가헤주세요');
    // 입력창 모두 초기화
    $selectInterviewCategory.value = '';
    $interviewSettingCnt.value = '';
    $interviewSettingTime.value = '';
  } else if (data.custom.length < interviewSettingCnt) {
    window.alert('입력된 질문수보다 큰 수가 입력되었습니다!');
    $interviewSettingCnt.value = '';
  }
};

$selectInterviewCategory.onchange = () => {
  selectedCategory = $selectInterviewCategory.options[$selectInterviewCategory.selectedIndex].text;
  if ($selectInterviewCategory.options[$selectInterviewCategory.selectedIndex].value === 'custom') {
    checkValidCustomQuestion();
  }
  render();
};

$interviewSettingCnt.onkeyup = e => {
  const regexp = /^[0-9]*$/;

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

  if ($selectInterviewCategory.options[$selectInterviewCategory.selectedIndex].value === 'custom') {
    checkValidCustomQuestion();
  }

  interviewSettingCnt = e.target.value;
  render();
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
  count = 5;
  $modalContainerStart.disabled = true;
};

$modalContainerStart.onclick = () => {
  window.location.href = '/interview.html';
};

document.querySelector('.bx-log-out').onclick = () => {
  window.location.href = '/index.html';
};
