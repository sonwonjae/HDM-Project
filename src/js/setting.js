import axios from 'axios';

const $selectInterviewCategory = document.querySelector('.interview-setting__kind select'); // 면접 카테고리
const $interviewSettingCnt = document.querySelector('.interview-setting__cnt--input'); // 면접 질문 개수
const $startInterview = document.querySelector('.interview-setting__start'); // 면접 시작 버튼
const $interviewSettingTime = document.querySelector('.interview-setting__time select'); // 면접 시간 선택

// $interviewSettingCnt.onkeyup = e => {};

// 랜덤 idx 생성 함수
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

const getInterviewList = async () => {
  const category = $selectInterviewCategory.value;
  const count = $interviewSettingCnt.value;
  const { data } = await axios.get('/questionList');
  const randomQuestion = [];
  getRandomIdxArr(data[category], +count).forEach(cur => {
    randomQuestion.push(data[category][cur]);
  });
  return randomQuestion;
};

const setUser = async () => {
  const selectedTime = $interviewSettingTime.options[$interviewSettingTime.selectedIndex].text; // 선택된 시간
  const selectedCategory = $selectInterviewCategory.options[$selectInterviewCategory.selectedIndex].text; // 선택한 카테고리
  const selectedInterviewList = await getInterviewList();

  const user = {
    interviewList: selectedInterviewList,
    interviewCategory: selectedCategory,
    cameraPermission: false,
    micPermission: false,
    selectedTime,
  };
  console.log(user);
  axios.put('/userInfo/update', user);
};

$startInterview.onclick = () => {
  setUser();
};
