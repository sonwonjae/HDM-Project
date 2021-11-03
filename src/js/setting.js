import axios from 'axios';

const $selectInterviewCategory = document.querySelector('.interview-setting__kind select'); // 면접 카테고리
const $interviewSettingCnt = document.querySelector('.interview-setting__cnt--input'); // 면접 질문 개수
const $startInterview = document.querySelector('.interview-setting__start > button'); // 면접 시작 버튼
const $interviewSettingTime = document.querySelector('.interview-setting__time select'); // 면접 시간 선택
const $checkAudioPermission = document.querySelector('.interview-setting__check--btn-audio');
const $checkCameraPermission = document.querySelector('.interview-setting__check--btn-camera');
const $interviewSettingInfo = document.querySelector('.interview-setting__guide');
const $modalWrap = document.querySelector('.modal-wrap');
const $modalContainerTimer = document.querySelector('.modal__container--timer');
const $modalContainerStart = document.querySelector('.modal__container--start');
const $container = document.querySelector('.container');

let count = 10;

// user interview setting state
let selectedTime = 0;
let selectedCategory = '';
let interviewSettingCnt = 0;
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
  axios.put('/userInfo/update', user);
};

const setModalTimer = () => {
  $modalContainerTimer.textContent = count;
  if (count >= 1) {
    count -= 1;
  } else {
    $modalContainerStart.disabled = false;
  }
};

const checkMicPermission = () => {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((micPermission = true))
      .catch(error => {
        console.log('마이크 권한 허용이 정상적으로 완료되지 않았습니다.');
      });
  }
};

const checkCameraPermission = () => {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'user',
        },
      })
      .then((cameraPermission = true))
      .catch(error => {
        console.log('카메라 권한 허용이 정상적으로 완료되지 않았습니다.');
      });
  }
};

const renderInterviewInfo = state => {
  $interviewSettingInfo.innerHTML = state
    ? `<div class="interview-setting__info"><span>선택한 ${selectedCategory} 면접은 ${interviewSettingCnt}문항으로 약 ${
        interviewSettingCnt * interviewSettingCnt
      }분동안 진행됩니다.</span></div>
  <div class="interview-setting__comment"><span>면접준비가 되었다면 면접 시작하기 버튼을 눌러주세요.</span></div>`
    : '';
};

// 카테고리, 개수, 시간, 카메라, 마이크 허용 시 시작하기 버튼 활성화
const checkStatus = () => selectedCategory && interviewSettingCnt && selectedTime && cameraPermission && micPermission;

$container.onclick = () => {
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
  setInterval(setModalTimer, 1000);
};

$modalWrap.onclick = e => {
  if (!e.target.classList.contains('close')) return;
  $modalWrap.classList.remove('active');
};

$modalContainerStart.onclick = () => {
  window.location.href = '/interview.html';
};

$checkAudioPermission.onclick = () => {
  checkMicPermission();
  renderInterviewInfo(checkStatus());
};

$checkCameraPermission.onclick = () => {
  checkCameraPermission();
  renderInterviewInfo(checkStatus());
};
