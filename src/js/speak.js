const synth = window.speechSynthesis;

let voiceOfKorea = '';

// 보이스 리스트
function populateVoiceList() {
  [voiceOfKorea] = synth.getVoices().filter(({ name }) => name === 'Google 한국의');
}

speechSynthesis.onvoiceschanged = populateVoiceList;

const questionList = [
  '자기소개 부탁드립니다',
  '지원동기는 뭔가요?',
  'WEB Vital에 대해 설명해주세요',
  '프로토타입에 대해 아는대로 말해주세요',
  'CORS란 무엇인가요?',
  '가비지 콜렉터란 무엇인가요?',
];
let questionCount = 0;

function speak() {
  if (synth.speaking) return;

  const utterThis = new SpeechSynthesisUtterance(questionList[questionCount++ % 6]);
  utterThis.voice = voiceOfKorea;
  synth.speak(utterThis);
}

export default speak;
