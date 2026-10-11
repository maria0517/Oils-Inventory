import React, { useEffect, useState } from 'react';

interface UserData {
  id: number;
  email: string;
  role: string;
  _count: { oils: number };
}

interface OilData {
  id: number;
  nameRo: string;
  nameEn: string;
  smallBottles: number;
  largeBottles: number;
}

export const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userOils, setUserOils] = useState<OilData[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchUsers = async () => {
    const res = await fetch('https://oils-inventory.onrender.com/admin/users', { headers });
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const selectUser = async (user: UserData) => {
    setSelectedUser(user);
    setLoading(true);
    const res = await fetch(`http://localhost:3000/admin/users/${user.id}/oils`, { headers });
    if (res.ok) setUserOils(await res.json());
    setLoading(false);
  };

  const handleResetPassword = async (userId: number) => {
    if (!newPassword.trim()) return alert('Introdu noua parolă');
    const res = await fetch(`http://localhost:3000/admin/users/${userId}/reset-password`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ newPass: newPassword }),
    });
    if (res.ok) {
      alert('Parolă resetată cu succes!');
      setNewPassword('');
    }
  };

  const handleUpdateStock = async (oilId: number, field: 'smallBottles' | 'largeBottles', value: number) => {
    const res = await fetch(`http://localhost:3000/admin/oils/${oilId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ [field]: Math.max(0, value) }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUserOils((prev) => prev.map((o) => (o.id === oilId ? updated : o)));
    }
  };

  return (
    <div className="w-full max-w-5xl bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">⚙️ Panou Administrator</h2>
          <p className="text-xs text-slate-400">Gestionează utilizatorii, parolele și inventarele</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm rounded-xl text-white"
        >
          ← Înapoi la Inventar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista Utilizatori */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Utilizatori Înregistrați</h3>
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => selectUser(u)}
                className={`p-3 rounded-xl cursor-pointer border transition text-sm flex justify-between items-center ${
                  selectedUser?.id === u.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <p className="font-medium">{u.email}</p>
                  <p className="text-[11px] text-slate-400">{u.role} • {u._count.oils} uleiuri</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalii Utilizator & Inventar */}
        <div className="md:col-span-2 space-y-4">
          {selectedUser ? (
            <>
              {/* Resetare Parolă */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Resetare parolă pentru {selectedUser.email}
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Parolă nouă..."
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleResetPassword(selectedUser.id)}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Actualizează
                  </button>
                </div>
              </div>

              {/* Inventarul Utilizatorului */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300">
                  Uleiuri aparținând lui {selectedUser.email}
                </h4>
                {loading ? (
                  <p className="text-xs text-slate-500">Se încarcă...</p>
                ) : userOils.length === 0 ? (
                  <p className="text-xs text-slate-500">Acest utilizator nu are niciun ulei.</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {userOils.map((oil) => (
                      <div
                        key={oil.id}
                        className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-sm"
                      >
                        <div>
                          <p className="font-medium text-white">{oil.nameRo}</p>
                          <p className="text-[11px] text-slate-400 italic">{oil.nameEn}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">5ml:</span>
                            <input
                              type="number"
                              min="0"
                              value={oil.smallBottles}
                              onChange={(e) =>
                                handleUpdateStock(oil.id, 'smallBottles', parseInt(e.target.value) || 0)
                              }
                              className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">15ml:</span>
                            <input
                              type="number"
                              min="0"
                              value={oil.largeBottles}
                              onChange={(e) =>
                                handleUpdateStock(oil.id, 'largeBottles', parseInt(e.target.value) || 0)
                              }
                              className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-slate-500 border border-dashed border-slate-700 rounded-xl">
              Selectează un utilizator din stânga pentru a-i vedea datele.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};