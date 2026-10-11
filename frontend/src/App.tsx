import React, { useState, useEffect, useRef } from 'react';
import type { Oil } from './api';
import {
  getOils,
  updateBottleStock,
  createOil,
  deleteOil,
  uploadOilsCsv,
} from './api';
import { Login } from './Login';
import { AdminPanel } from './AdminPanel';

// Funcție ajutătoare pentru a extrage rolul din JWT payload
function getUserRole(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = JSON.parse(atob(payloadBase64));
    return decodedJson.role || null;
  } catch {
    return null;
  }
}

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('token')
  );
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(() => getUserRole());

  const [oils, setOils] = useState<Oil[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal adăugare ulei nou
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newNameRo, setNewNameRo] = useState<string>('');
  const [newNameEn, setNewNameEn] = useState<string>('');
  const [newSmallBottles, setNewSmallBottles] = useState<number>(0);
  const [newLargeBottles, setNewLargeBottles] = useState<number>(0);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOils();
      setOils(data);
    } catch (err: any) {
      setError(err.message || 'Nu s-au putut încărca uleiurile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setUserRole(getUserRole());
      fetchInventory();
    }
  }, [isAuthenticated]);

  const handleStockDelta = async (
    id: number,
    field: 'smallBottles' | 'largeBottles',
    delta: number
  ) => {
    const currentOil = oils.find((o) => o.id === id);
    if (!currentOil) return;

    const updatedValue = Math.max(0, (currentOil[field] ?? 0) + delta);
    try {
      const updated = await updateBottleStock(id, field, updatedValue);
      setOils((prev) => prev.map((oil) => (oil.id === id ? updated : oil)));
    } catch (err: any) {
      alert(err.message || 'Eroare la actualizarea stocului');
    }
  };

  const handleCreateOil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameRo.trim() && !newNameEn.trim()) return;

    try {
      const created = await createOil({
        nameRo: newNameRo.trim() || newNameEn.trim(),
        nameEn: newNameEn.trim() || newNameRo.trim(),
        smallBottles: newSmallBottles,
        largeBottles: newLargeBottles,
      });
      setOils((prev) => [...prev, created]);
      setNewNameRo('');
      setNewNameEn('');
      setNewSmallBottles(0);
      setNewLargeBottles(0);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || 'Eroare la adăugarea uleiului');
    }
  };

  const handleDeleteOil = async (id: number, displayName: string) => {
    if (!window.confirm(`Sigur vrei să ștergi uleiul "${displayName}"?`)) return;

    try {
      await deleteOil(id);
      setOils((prev) => prev.filter((oil) => oil.id !== id));
    } catch (err: any) {
      alert(err.message || 'Eroare la ștergerea uleiului');
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await uploadOilsCsv(file);
      alert(`Succes! Au fost importate ${res.count} uleiuri.`);
      await fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Eroare la procesarea fișierului CSV');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdminView(false);
    setUserRole(null);
    setOils([]);
  };

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setUserRole(getUserRole());
        }}
      />
    );
  }

  const query = search.trim().toLowerCase();
  const filteredOils = (Array.isArray(oils) ? oils : []).filter((oil) => {
    const ro = (oil?.nameRo || '').toLowerCase();
    const en = (oil?.nameEn || '').toLowerCase();
    return ro.includes(query) || en.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6">
      {isAdminView ? (
        <AdminPanel onBack={() => setIsAdminView(false)} />
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          {/* Antetul aplicației */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">💧</span>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Inventar Uleiuri Esențiale
                </h1>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Total în evidență:{' '}
                <span className="text-emerald-400 font-semibold">{oils.length}</span>{' '}
                tipuri de uleiuri
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCsvUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm rounded-xl transition duration-150 border border-slate-600"
              >
                📁 Importă CSV
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 font-medium text-sm rounded-xl transition duration-150 shadow-md shadow-emerald-950/40 text-white"
              >
                + Adaugă Ulei
              </button>

              {/* Buton vizibil doar pentru conturile cu rol ADMIN */}
              {userRole === 'ADMIN' && (
                <button
                  onClick={() => setIsAdminView(true)}
                  className="px-3.5 py-2 bg-amber-600/90 hover:bg-amber-600 text-white font-medium text-sm rounded-xl transition duration-150 border border-amber-500/50 shadow-md shadow-amber-950/30"
                >
                  ⚙️ Admin Panel
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm rounded-xl transition duration-150 border border-slate-600/50"
              >
                Deconectare
              </button>
            </div>
          </header>

          {/* Bara de căutare */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută după nume în română sau engleză..."
              className="w-full px-5 py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white"
              >
                Curăță
              </button>
            )}
          </div>

          {/* Lista de carduri */}
          {loading ? (
            <div className="text-center py-16 text-slate-400">Se încarcă inventarul...</div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-center">
              {error}
            </div>
          ) : filteredOils.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
              Nu a fost găsit niciun ulei care să corespundă căutării.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredOils.map((oil) => {
                const displayName = oil.nameRo || oil.nameEn;
                const subName = oil.nameEn && oil.nameEn !== oil.nameRo ? oil.nameEn : null;
                const totalStock = (oil.smallBottles ?? 0) + (oil.largeBottles ?? 0);

                return (
                  <div
                    key={oil.id}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-slate-600 transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-lg text-white leading-tight">
                          {displayName}
                        </h3>
                        {subName && (
                          <p className="text-xs text-slate-400 italic mt-0.5">{subName}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteOil(oil.id, displayName)}
                        title="Șterge ulei"
                        className="text-slate-500 hover:text-rose-400 transition text-sm p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {/* Sticle Mici (5ml) */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Mici (5ml):</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockDelta(oil.id, 'smallBottles', -1)}
                            disabled={oil.smallBottles <= 0}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold min-w-[1rem] text-center text-slate-200">
                            {oil.smallBottles ?? 0}
                          </span>
                          <button
                            onClick={() => handleStockDelta(oil.id, 'smallBottles', 1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Sticle Mari (15ml) */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Mari (15ml):</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockDelta(oil.id, 'largeBottles', -1)}
                            disabled={oil.largeBottles <= 0}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold min-w-[1rem] text-center text-slate-200">
                            {oil.largeBottles ?? 0}
                          </span>
                          <button
                            onClick={() => handleStockDelta(oil.id, 'largeBottles', 1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Total recipiente:</span>
                        <span
                          className={`font-semibold ${
                            totalStock === 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {totalStock}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal adăugare manuală */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Adaugă Ulei Nou</h3>
            <form onSubmit={handleCreateOil} className="space-y-3">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                  Nume (Română)
                </label>
                <input
                  type="text"
                  required
                  value={newNameRo}
                  onChange={(e) => setNewNameRo(e.target.value)}
                  placeholder="ex: Portocală Sălbatică"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                  Nume (Engleză)
                </label>
                <input
                  type="text"
                  required
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="ex: Wild Orange"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                    Sticle Mici (5ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSmallBottles}
                    onChange={(e) => setNewSmallBottles(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                    Sticle Mari (15ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newLargeBottles}
                    onChange={(e) => setNewLargeBottles(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl"
                >
                  Salvează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;