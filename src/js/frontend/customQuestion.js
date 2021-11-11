import axios from 'axios';
import modals from './utils/modal.js';

const $questionTextarea = document.querySelector('.question-textarea');
const $modalOuter = document.querySelector('.modal-outer');
const $addButton = document.querySelector('.add-button');

document.querySelector('.form').addEventListener('submit', async e => {
  e.preventDefault();
  let modalState;

  try {
    const { data } = await axios.post('/questionList', { custom: $questionTextarea.value });
    modalState = modals.successCustom;
    console.log(data);
  } catch (e) {
    modalState = modals.failCustom;
    console.error(e);
  }
  $modalOuter.classList.remove('hidden');
  document.querySelector('.modal__title').textContent = modalState.title;
  document.querySelector('.modal__describtion').textContent = modalState.description;
  $questionTextarea.value = '';
  $addButton.disabled = true;
});

document.querySelector('.modal__button').addEventListener('click', () => {
  $modalOuter.classList.add('hidden');
});

$questionTextarea.addEventListener('input', () => {
  $addButton.disabled = $questionTextarea.value === '';
});
