require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.static('public'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Mock
const mockInterview = {
  category: 'Frontend',
  totalTime: 56,
  selectedTime: 3,
  progressedTime: [161, 90, 144, 105, 179, 180, 70, 173, 99, 130],
  questionList: [],
};
let userInfo = {
  interviewList: [],
  interviewCategory: '',
  cameraPermission: false,
  micPermission: false,
  selectedTime: '',
};

const questionList = {
  // 인성 면접 카테고리
  Personality: [
    '스트레스를 해소하는 자신만의 방법이 있다면 소개해주세요',
    '팀원과의 의견 충돌이 생기면 어떻게 해결하시나요?',
    '만약 상사와의 의견 충돌이 생긴다면 어떻게 해결하실 건가요?',
    '성격의 장, 단점을 말해주시고, 단점을 보완하기 위하여 어떤 노력을 하였는지 말해주세요.',
    '회사를 선택하는 기준은 무엇인가요?',
    '본인의 강점이 무엇인가요?',
    '주변에서 이야기하는 "나"는 어떤 모습인가요?',
    '스스로 생각할 때 자신은 리더형인가요 팔로워형인가요?',
    '인생에서 가장 중요한 것은 무엇이라고 생각하시나요?',
    '상사가 부당한 지시를 한다면 어떻게 하실 건가요?',
    '입사 5 년 후, 10년 후 자신의 모습은 어떨 것이라고 예상하시나요?',
    '같이 일하기 힘든 동료는 어떤 유형이라고 생각하시나요?',
    '1년간 휴가가 주어진다면 휴가를 어떻게 보내실 건가요?',
    '본인이 세운 목표를 성취한 경험이 있나요? 목표를 이루기 위해 어떤 노력을 했는지 말씀해주세요.',
    '가장 크게 실패한 경험에 대해 말해주세요.',
    '본인이 가장 중요하게 생각하는 가치에 대해 말해주세요.',
  ],
  // 상황 면접 카테고리
  Situation: [
    '비품관리 담당자인데 팀 직원이 공동 물품을 집으로 가져가서 쓴다면 어떻게 하실건가요?',
    '팀프로젝트가 끝나고 팀 전체가 회식을 하고 있습니다. 당신은 팀프로젝트에서 막바지 작업을 해야 하기에 회식 참여가 곤란한 상황입니다. 팀장님께 회식에 불참한다고 어떻게 말씀하시겠습니까?',
    '팀 프로젝트의 최종 보고서를 작성하던 중 프로젝트 수행 과정에서 작은 오류가 있음을 본인만 확인하였습니다. 오류를 수정하게 되면 기한을 맞추지 못하는데 어떻게 하실건가요?',
    '상사가 나의 아이디어를 가로챈다면 어떻게 대응 하시겠습니까?',
    '당신은 프로젝트 리더입니다. 팀원들이 전혀 의지가 없을 경우 어떻게 하시겠습니까?',
    '나는 신입사원입니다. 상사와의 회식에서 상사가 회사의 공금을 사적으로 쓴다는 이야기를 했습니다. 어떻게 하시겠습니까?',
    '최종 면접까지 갔는데, 이미 내정자가 있다는 사실을 알게 되었습니다. 당신은 어떤 자세로 면접에 임하시겠습니까?',
    '당장 중요하게 끝내야 할 프로젝트가 있는데 계속 상사가 추가적으로 일을 시킵니다. 어떻게 상사에게 말씀하여 일의 우선 순위를 결정하시겠습니까?',
    '입사 후, 자신이 가치관이 회사와 맞지 않는다면 어떻게 하시겠습니까?',
    '현장에 상사와 둘이 나갔는데 안전모가 하나밖에 없다면 어떻게 하시겠습니까?',
    '우리 회사의 전산시스템의 결함으로 인해 개인정보가 유출되었다면 어떻게 하시겠습니까?',
    '여행지 A, B 코스가 있습니다. 당신과 철수는 A 코스를, 영희는 B 코스를 가자고 합니다. 영희를 어떻게 설득하시겠습니까?',
    '당신은 신입사원입니다. 친구들과의 주말 여행 계획이 오래 전부터 잡혀 있었습니다. 그런데 프로젝트 때문에 상사가 주말에 출근하라고 합니다. 어떻게 하시겠습니까?',
    '당신은 신입사원입니다. 팀장님께서 A 방향에 대한 업무를 지시했습니다. 그런데 회의를 진행하면 할수록 회사에 막대한 피해가 발생할 것 같습니다. 팀장님께 어떻게 말씀하시겠습니까?',
    '업무 환경이나 주제가 바뀌었는데 기존의 계획을 변경하면 안된다고 하는 동료가 있다면 어떻게 하실건가요?',
  ],
  Frontend: [
    '점진적 향상과 우아한 성능 저하에 대해 알고 있는 부분을 설명해주세요.',
    'CORS를 사용하지 않으면 발생할 수 있는 공격에 대해 설명해주세요.',
    '화살표 함수와 일반 함수의 차이를 설명해주세요.',
    'ES6에 추가된 문법에 대해 설명해주세요.',
    'HTTP/1.1과 HTTP/2.0의 차이에 대해 설명해주세요.',
    '크로스 브라우징 이슈란 무엇이고 이를 해결해 본 경험이 있다면 설명해주세요.',
    '브라우저의 렌더링 과정에 대해 설명해주세요.',
    '클라이언트 사이드 렌더링과 서버사이드렌더링의 차이를 말해주세요.',
    'graphql 을 써보았나요? 써보았다면 장단점이 무엇인가요?',
    '성능 최적화를 해본 경험이 있나요?',
    '클로저란 무엇인가요?',
    '쿠키와 세션 스토리지, 로컬 스토리지의 차이를 설명해 주세요.',
    '프로그레시브 렌더링이란 무엇인가요?',
    '시맨틱 태그에 대해서 설명해 주세요.',
    '이벤트 버블링과 이벤트 캡쳐링에 대해서 설명해주세요.',
    'null과 undefined의 차이점은 무엇인가요?',
    'let, var, const의 차이점에 관해서 설명해주세요.',
    '왜 프론트엔드 개발자를 선택하셨나요?',
    '어떤 개발자가 좋은 개발자라고 생각하나요?',
    '자바스크립트의 이벤트 루프에 대해 설명해주세요.',
    '입사 후 개발자로서 본인이 회사에 기여할 수 있는 부분을 말해주세요.',
    '개발이 본인의 적성에 맞는다고 생각하나요?',
    '지원자가 평소 사용하던 앱이나 웹사이트에서 느낀 문제점이 있다면 말해주세요.',
    '최근에 관심이 가거나 공부하고 싶은 개발 기술은 무엇인가요?',
    '프로젝트를 진행하며 가장 어려웠던 점과 극복했던 방법을 얘기해주세요.',
    'Stack과 Queue의 차이점은 무엇인가요?',
    'HTTP와 HTTPS에 대해 설명해주세요.',
    'call, apply, bind 함수에 대해 설명해주세요.',
    'RESTful API에 대해 설명해주세요.',
    'CSS box model에 대해 설명해주세요.',
    'CSS 전처리를 사용해본 적이 있습니까? 있다면 사용 경험상 좋았던 점과 나빴던 점을 이야기해주세요.',
    'this 키워드에 대해 설명해주세요.',
    'Virtual DOM은 무엇인가요?',
  ],
  Backend: [
    '세션과 쿠키의 차이점이 무엇인가요?',
    '상속과 구현의 차이점과 특징 및 장단점을 알려주세요.',
    '오버로딩과 오버라이딩의 차이에 대해서 설명해 주세요',
    '제네릭에 대해 설명해 주세요.',
    '메모리 누수가 무엇인가요?',
    '멀티스레드와 스레드의 차이점이 무엇인가요?',
    'JVM에 대해 설명해주세요. ',
    '컴포넌트와 모듈의 차이를 설명해주세요',
    '객체지향 언어의 특징은 무엇인가요?',
    '개발이 본인의 적성에 맞는다고 생각하나요?',
    '입사 후 개발자로서 본인이 회사에 기여할 수 있는 부분을 말해주세요.',
    '최근에 관심이 가거나 공부하고 싶은 개발 기술은 무엇인가요?',
    '프로젝트를 진행하며 가장 어려웠던 점과 극복했던 방법을 얘기해주세요.',
    'Stack과 Queue의 차이점은 무엇인가요?',
  ],
  Custom: [],
};

let news = {
  updatedAt: 0,
  articles: [],
};

const isValidNews = () => {
  const halfDay = 1000 * 60 * 60 * 12;
  return new Date() - news.updatedAt < halfDay;
};
app.get('/news', async (req, res) => {
  if (news.updatedAt !== 0 && isValidNews()) {
    res.send(news.articles);
    return;
  }

  try {
    const {
      data: { articles },
    } = await axios.get(
      `
      https://newsapi.org/v2/top-headlines?country=kr&category=technology&apiKey=${process.env.NEWS_API_KEY}`
    );

    news = {
      updatedAt: new Date(),
      articles,
    };
    res.send(articles);
  } catch (e) {
    console.error(e.message);
  }
});
// GET/mockInterview
app.get('/mockInterview', (req, res) => {
  try {
    // console.log(mockInterview);
    res.send(mockInterview);
  } catch (e) {
    console.error(e.message);
  }
});

app.put('/mockInterview/update', (req, res) => {
  try {
    // const newInterviewResult = req.body;
    const { category, totalTime, questionList, selectedTime, progressedTime } = req.body;
    mockInterview.category = category;
    mockInterview.totalTime = totalTime;
    mockInterview.questionList = questionList;
    mockInterview.selectedTime = selectedTime;
    mockInterview.progressedTime = progressedTime;
    res.send(mockInterview);
  } catch (e) {
    console.error(e.message);
  }
});

app.get('/questionList', (req, res) => {
  try {
    res.send(questionList);
  } catch (e) {
    console.error(e.message);
  }
});

app.post('/questionList', (req, res) => {
  try {
    const { custom } = req.body;
    const newCustomList = custom
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gm, '')
      .split(/\r\n/g)
      .map(str => str.trim());
    questionList.Custom = [questionList.Custom, ...newCustomList];
    res.send(questionList);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('error');
  }
});

app.get('/userInfo', (req, res) => {
  try {
    res.send(userInfo);
  } catch (e) {
    console.error(e.message);
  }
});

app.put('/userInfo', req => {
  const newUserInfo = req.body;
  userInfo = newUserInfo;
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
