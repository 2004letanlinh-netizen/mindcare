import { startRouter } from './router.js';

const panicDialog = document.querySelector('#panic-dialog');
document.querySelector('#panic-trigger').addEventListener('click', () => panicDialog.showModal());
document.querySelector('#panic-close').addEventListener('click', () => panicDialog.close());
panicDialog.addEventListener('click', (event) => {
  if (event.target === panicDialog) panicDialog.close();
});

startRouter();
