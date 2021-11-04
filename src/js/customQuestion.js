import axios from 'axios';

const $questionList = document.querySelector('.question-list');
const $modalOuter = document.querySelector('.modal-outer');
const $addButton = document.querySelector('.add-button');

document.querySelector('.form').addEventListener('submit', async e => {
  e.preventDefault();

  const questionString = $questionList.value;
  let modalTitle = '';

  try {
    await axios.post('/questionList', { custom: questionString });
    modalTitle = '입력되었습니다.';
  } catch (e) {
    modalTitle = '입력을 실패했습니다.';
    console.error(e);
  } finally {
    $modalOuter.classList.remove('hidden');
    document.querySelector('.modal__title').textContent = modalTitle;
    $questionList.value = '';
    $addButton.disabled = true;
  }
});

document.querySelector('.modal__button').addEventListener('click', () => {
  $modalOuter.classList.add('hidden');
});

$questionList.addEventListener('input', () => {
  $addButton.disabled = $questionList.value === '';
});
