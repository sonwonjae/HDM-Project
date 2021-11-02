import timer from './timer';

// import axios from 'axios';
// import speak from './speak';

// DOM Nodes
const $interviewCountCurrent = document.querySelector('.interview__count--current');
const $interviewCountTotal = document.querySelector('.interview__count--total');
const $interviewCamMain = document.querySelector('.interview__cam-main');
const $interviewTimer = document.querySelector('.interview__timer');
const $interviewButtonsRepeat = document.querySelector('.interview-buttons__repeat');
const $interviewButtonsSubmit = document.querySelector('.interview-buttons__submit');
const $repeatModalOuter = document.querySelector('.interview-repeat-modal');
const $interviewRepeatModalRepeatButton = document.querySelector('.interview-repeat-modal .modal__button');
const $interviewRepeatModalCancleButton = document.querySelector('.interview-repeat-modal .cancle');
const $submitModalOuter = document.querySelector('.interview-submit-modal');
const $interviewSubmitModalSubmitButton = document.querySelector('.interview-submit-modal .modal__button');
const $interviewSubmitModalCancleButton = document.querySelector('.interview-submit-modal .cancle');
const $timeoutModalOuter = document.querySelector('.interview-timeout-modal');
const $interviewTimeoutModalSubmitButton = document.querySelector('.interview-timeout-modal .modal__button');
const $moveReportModalOuter = document.querySelector('.interview-move-report-modal');
const $interviewMoveReportModalSubmitButton = document.querySelector('.interview-move-report-modal .modal__button');

// state
const startTime = 10;
const stopTime = 5;
let currentInterview = 1;
const totalInterview = 3;
const sizeObj = {
  width: 1000,
  height: 1000,
};

// helper
const updateTimer = () => {
  if (!$interviewButtonsRepeat.getAttribute('disabled') && startTime - timer.getTime() > stopTime)
    $interviewButtonsRepeat.setAttribute('disabled', true);

  if (timer.getTime() === 0) {
    timer.stop();
    if (currentInterview === totalInterview) {
      $moveReportModalOuter.classList.toggle('hidden');
      $interviewMoveReportModalSubmitButton.focus();
    } else {
      $timeoutModalOuter.classList.toggle('hidden');
      $interviewTimeoutModalSubmitButton.focus();
    }
  }

  $interviewTimer.textContent = timer.updateTime();
};

// event binding
window.addEventListener('DOMContentLoaded', () => {
  $interviewCountCurrent.textContent = currentInterview;
  $interviewCountTotal.textContent = totalInterview;

  timer.setTime(startTime);
  timer.start(updateTimer, 1000);
});
window.addEventListener('resize', () => {
  sizeObj.width = $interviewCamMain.clientWidth;
  sizeObj.height = $interviewCamMain.clientHeight;
  console.log(sizeObj.width, sizeObj.height);
});

async function vi() {
  const videoStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 'auto',
      height: 'auto',
      max: 2580,
    },
  });
  $interviewCamMain.srcObject = videoStream;
}
vi();
$interviewCamMain.addEventListener('playing', () => {
  console.log($interviewCamMain.videoWidth);
  console.log($interviewCamMain.videoHeight);
});
// 다시 시작
$interviewButtonsRepeat.onclick = () => {
  timer.stop();
  $repeatModalOuter.classList.toggle('hidden');
  $interviewRepeatModalRepeatButton.focus();
};

$interviewRepeatModalRepeatButton.onclick = () => {
  timer.stop();
  timer.setTime(startTime);
  timer.start(updateTimer, 1000);

  $interviewTimer.textContent = timer.updateTime();

  $repeatModalOuter.classList.toggle('hidden');
};

$interviewRepeatModalCancleButton.onclick = () => {
  timer.stop();
  timer.start(updateTimer, 1000);
  $repeatModalOuter.classList.toggle('hidden');
};

// 답변 제출
$interviewButtonsSubmit.onclick = () => {
  timer.stop();

  if (currentInterview === totalInterview) {
    $moveReportModalOuter.classList.toggle('hidden');
    $interviewMoveReportModalSubmitButton.focus();
  } else {
    $submitModalOuter.classList.toggle('hidden');
    $interviewSubmitModalSubmitButton.focus();
  }
};

// 제출
$interviewSubmitModalSubmitButton.onclick = () => {
  currentInterview += 1;
  $interviewCountCurrent.textContent = currentInterview;

  timer.stop();
  timer.setTime(startTime);
  timer.start(updateTimer, 1000);

  $interviewTimer.textContent = timer.updateTime();

  $submitModalOuter.classList.toggle('hidden');
};

$interviewSubmitModalCancleButton.onclick = () => {
  timer.stop();
  timer.start(updateTimer, 1000);
  $submitModalOuter.classList.toggle('hidden');
};

// 시간 종료 제출
$interviewTimeoutModalSubmitButton.onclick = () => {
  currentInterview += 1;
  $interviewCountCurrent.textContent = currentInterview;

  timer.setTime(startTime);
  timer.start(updateTimer, 1000);

  $timeoutModalOuter.classList.toggle('hidden');
};

$interviewMoveReportModalSubmitButton.onclick = () => {
  window.location.replace('/report.html');
};
