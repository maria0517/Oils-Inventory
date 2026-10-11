const BASE_URL = 'https://oils-inventory.onrender.com';
const API_URL = `${BASE_URL}/oils`;

export interface Oil {
  id: number;
  nameRo: string;
  nameEn: string;
  smallBottles: number;
  largeBottles: number;
  description?: string;
  userId?: number;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginUser(email: string, pass: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pass }),
  });

  if (!res.ok) throw new Error('Email sau parolă incorectă');
  const data = await res.json();
  return data.access_token;
}

export async function registerUser(email: string, pass: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pass }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Eroare la crearea contului');
  }

  const data = await res.json();
  return data.access_token;
}

export async function getOils(): Promise<Oil[]> {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
    throw new Error('Sesiune expirată');
  }

  if (!res.ok) throw new Error('Eroare la încărcarea uleiurilor');
  return res.json();
}

export async function updateBottleStock(
  id: number,
  field: 'smallBottles' | 'largeBottles',
  newCount: number
): Promise<Oil> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ [field]: Math.max(0, newCount) }),
  });

  if (!res.ok) throw new Error('Eroare la actualizarea stocului');
  return res.json();
}

export async function createOil(oil: {
  nameRo: string;
  nameEn: string;
  smallBottles: number;
  largeBottles: number;
  description?: string;
}): Promise<Oil> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(oil),
  });

  if (!res.ok) throw new Error('Eroare la adăugarea uleiului');
  return res.json();
}

export async function deleteOil(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Eroare la ștergerea uleiului');
}

export async function uploadOilsCsv(file: File): Promise<{ count: number; message: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/import-csv`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Eroare la importarea fișierului CSV');
  }

  return res.json();
}