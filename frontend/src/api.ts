const API_URL = 'https://oils-inventory.onrender.com/oils';

export interface Oil {
  id: number;
  nameRo: string;
  nameEn: string;
  smallBottles: number;
  largeBottles: number;
}

export interface CreateOilPayload {
  nameRo: string;
  nameEn: string;
  smallBottles: number;
  largeBottles: number;
}

// 1. Preluare toate uleiurile
export async function getOils(): Promise<Oil[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Eroare la preluarea uleiurilor');
  return res.json();
}

// 2. Modificare stoc (+ / -)
export async function updateOilStock(
  id: number,
  data: { smallBottles?: number; largeBottles?: number }
): Promise<Oil> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Eroare la actualizarea stocului');
  return res.json();
}

// 3. Adăugare ulei nou
export async function createOil(data: CreateOilPayload): Promise<Oil> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    if (
      res.status === 409 ||
      errorData?.message?.includes?.('already exists') ||
      errorData?.message?.includes?.('Unique constraint')
    ) {
      throw new Error('Un ulei cu acest nume (în română sau engleză) există deja în inventar!');
    }
    throw new Error(errorData?.message || 'Eroare la crearea uleiului.');
  }

  return res.json();
}

// 4. Ștergere ulei
export async function deleteOil(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Eroare la ștergerea uleiului din baza de date.');
  }
}