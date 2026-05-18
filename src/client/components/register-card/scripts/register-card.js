import { createUser } from '../../services/user.js';

const form = document.getElementById('register-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleSubmit();
});


async function handleSubmit() {
  const data = getFormData();

  try {
    const user = await createUser(data);
    onSuccess(user);
  } catch (error) {
    onError(error);
  }
}


function getFormData() {
  const data = new FormData(form);

  return {
    name: data.get('name'),
    phone: data.get('phone'),
    email: data.get('email'),
    password: data.get('password'),
    document_type: data.get('document_type'),
    document_number: data.get('document_number'),
    role: 'customer',
  };
}


function onSuccess(user) {
  console.log('Usuário criado:', user);
}


function onError(error) {
  console.error('Erro:', error.message);
}
