const modals = {
  init: {
    type: 'init',
    title: '3초 후 버튼이 활성화됩니다.',
    description: '준비가 되셨으면 시작하기 버튼을 눌러주세요.',
    cancel: false,
    button: '시작하기',
  },
  repeat: {
    type: 'repeat',
    title: '다시 시작하시겠어요?',
    description: '다시 시작하시면 현재까지의 녹음기록은 전부 지워집니다.',
    cancel: true,
    button: '다시 시작',
  },
  submit: {
    type: 'submit',
    title: '답변을 제출하시겠어요?',
    description: '답변을 제출하시면 현재까지 녹음된 기록이 저장됩니다.',
    cancel: true,
    button: '답변 제출',
  },
  timeout: {
    type: 'timeout',
    title: '시간이 종료되었습니다.',
    description: '다음 문제 버튼을 누르시면 다음 질문이 재생됩니다.',
    cancel: false,
    button: '다음 문제',
  },
  result: {
    type: 'result',
    title: '고생하셨습니다.',
    description: '결과 보기 버튼을 누르시면 결과 창으로 이동합니다.',
    cancel: false,
    button: '결과 보기',
  },
  successCustom: {
    title: '입력되었습니다.',
    description: '',
    cancel: false,
  },
  failCustom: {
    title: '입력을 실패했습니다.',
    description: '다시 입력해주세요.',
    cancel: false,
  },
};

export default modals;
