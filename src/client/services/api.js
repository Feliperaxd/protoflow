const BASE_URL = 'http://localhost:8000';

export async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail ?? 'Unexpected error.');
  }

  return response.json();
}
