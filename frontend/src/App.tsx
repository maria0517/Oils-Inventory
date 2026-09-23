import { useEffect, useState, useMemo } from 'react';
import { getOils, updateOilStock, createOil, deleteOil, type Oil } from './api';
import { Search, Plus, Minus, Droplets, X, PlusCircle, Trash2, AlertCircle } from 'lucide-react';

export default function App() {
  const [oils, setOils] = useState<Oil[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Stare pentru marcarea uleiului adăugat recent
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);

  // Stări pentru modalul de adăugare
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameRo, setNameRo] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [smallBottles, setSmallBottles] = useState('');
  const [largeBottles, setLargeBottles] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Stare pentru modalul de confirmare a ștergerii (verde pal)
  const [oilToDelete, setOilToDelete] = useState<Oil | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Încarcă uleiurile din backend la pornire
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getOils();
      setOils(data);
    } catch (err) {
      console.error(err);
      alert('Nu s-au putut încărca uleiurile. Verifică dacă backend-ul rulează.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Modifică numărul de sticle (+1 sau -1)
  const handleStockChange = async (
    oil: Oil,
    type: 'smallBottles' | 'largeBottles',
    delta: number
  ) => {
    const currentVal = oil[type];
    const newVal = Math.max(0, currentVal + delta);
    if (newVal === currentVal) return;

    // Actualizare optimistă în UI
    setOils((prev) =>
      prev.map((item) => (item.id === oil.id ? { ...item, [type]: newVal } : item))
    );

    try {
      setUpdatingId(oil.id);
      await updateOilStock(oil.id, { [type]: newVal });
    } catch (err) {
      console.error(err);
      // Revert dacă a apărut o problemă de rețea
      setOils((prev) =>
        prev.map((item) => (item.id === oil.id ? { ...item, [type]: currentVal } : item))
      );
      alert('Nu s-a putut salva modificarea în baza de date.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Confirmă și execută ștergerea definitivă
  const confirmDeleteOil = async () => {
    if (!oilToDelete) return;

    const targetOil = oilToDelete;
    const previousOils = [...oils];
    
    // Eliminare optimistă din listă
    setOils((prev) => prev.filter((item) => item.id !== targetOil.id));
    setDeleting(true);

    try {
      await deleteOil(targetOil.id);
      setOilToDelete(null);
    } catch (err: any) {
      console.error(err);
      setOils(previousOils);
      alert(err.message || 'Nu s-a putut șterge uleiul.');
    } finally {
      setDeleting(false);
    }
  };

  // Trimiterea formularului de adăugare
  const handleAddOil = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanRo = nameRo.trim();
    const cleanEn = nameEn.trim();

    if (!cleanRo || !cleanEn) {
      setFormError('Te rugăm să completezi ambele denumiri (Română și Engleză)!');
      return;
    }

    const exists = oils.some(
      (oil) =>
        oil.nameRo.toLowerCase() === cleanRo.toLowerCase() ||
        oil.nameEn.toLowerCase() === cleanEn.toLowerCase()
    );

    if (exists) {
      setFormError('Acest ulei există deja în baza de date!');
      return;
    }

    const parsedSmall = smallBottles === '' ? 0 : Math.max(0, parseInt(smallBottles, 10) || 0);
    const parsedLarge = largeBottles === '' ? 0 : Math.max(0, parseInt(largeBottles, 10) || 0);

    try {
      setSubmitting(true);
      const newOil = await createOil({
        nameRo: cleanRo,
        nameEn: cleanEn,
        smallBottles: parsedSmall,
        largeBottles: parsedLarge,
      });

      setOils((prev) =>
        [...prev, newOil].sort((a, b) => a.nameRo.localeCompare(b.nameRo))
      );

      setRecentlyAddedId(newOil.id);

      setTimeout(() => {
        setRecentlyAddedId((curr) => (curr === newOil.id ? null : curr));
      }, 12000);

      setNameRo('');
      setNameEn('');
      setSmallBottles('');
      setLargeBottles('');
      setIsModalOpen(false);

      setTimeout(() => {
        document.getElementById(`oil-card-${newOil.id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 200);
    } catch (err: any) {
      setFormError(err.message || 'Eroare la salvare.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrare căutare
  const filteredOils = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return oils;
    return oils.filter(
      (oil) =>
        oil.nameRo.toLowerCase().includes(q) ||
        oil.nameEn.toLowerCase().includes(q)
    );
  }, [oils, search]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Droplets className="text-teal-600 w-8 h-8" />
              Inventar Uleiuri
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Total în evidență: {oils.length} tipuri de uleiuri
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFormError('');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 active:scale-95 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Adaugă Ulei
            </button>

          </div>
        </header>

        {/* Bara de Căutare */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Caută ulei (ex: Lavandă, Peppermint, Lămâie)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
        </div>

        {/* Lista de Carduri */}
        {loading && oils.length === 0 ? (
          <div className="text-center py-16 text-slate-400">Se încarcă inventarul...</div>
        ) : filteredOils.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
            Niciun ulei găsit pentru căutarea "{search}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOils.map((oil) => {
              const isRecent = recentlyAddedId === oil.id;

              return (
                <div
                  key={oil.id}
                  id={`oil-card-${oil.id}`}
                  className={`relative bg-white rounded-xl p-4 border transition-all duration-300 shadow-sm ${
                    isRecent
                      ? 'border-emerald-500 ring-2 ring-emerald-400 bg-emerald-50/20 shadow-md scale-[1.01]'
                      : updatingId === oil.id
                      ? 'border-teal-400 ring-1 ring-teal-400'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Badge adăugat recent */}
                  {isRecent && (
                    <span className="absolute -top-2.5 right-10 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                      ✨ Adăugat recent
                    </span>
                  )}

                  {/* Header Card: Titlu + Buton Coș de Gunoi */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h2 className="font-semibold text-slate-900 text-lg leading-tight">
                        {oil.nameRo}
                      </h2>
                      <span className="text-xs font-medium text-slate-400">
                        {oil.nameEn}
                      </span>
                    </div>

                    {/* Buton Ștergere (deschide modalul verde pal) */}
                    <button
                      onClick={() => setOilToDelete(oil)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title={`Șterge ${oil.nameRo}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    {/* Sticle Mici */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Sticle Mici (5ml)</span>
                      <div className="flex items-center gap-3 my-1">
                        <button
                          onClick={() => handleStockChange(oil, 'smallBottles', -1)}
                          disabled={oil.smallBottles === 0}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 active:scale-95 transition"
                          title="Scade o sticlă"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="font-bold text-base min-w-[20px] text-center">
                          {oil.smallBottles}
                        </span>

                        <button
                          onClick={() => handleStockChange(oil, 'smallBottles', 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-xs transition"
                          title="Adaugă o sticlă"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Sticle Mari */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Sticle Mari (15ml)</span>
                      <div className="flex items-center gap-3 my-1">
                        <button
                          onClick={() => handleStockChange(oil, 'largeBottles', -1)}
                          disabled={oil.largeBottles === 0}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 active:scale-95 transition"
                          title="Scade o sticlă"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="font-bold text-base min-w-[20px] text-center">
                          {oil.largeBottles}
                        </span>

                        <button
                          onClick={() => handleStockChange(oil, 'largeBottles', 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-xs transition"
                          title="Adaugă o sticlă"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fereastră Modal Confirmare Ștergere (VERDE PAL) */}
      {oilToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="bg-emerald-50/95 border border-emerald-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-150 text-center">
            {/* Iconiță atenționare verde calm */}
            <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-800">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-lg font-bold text-emerald-950 mb-1">
              Confirmare Ștergere
            </h3>

            <p className="text-sm text-emerald-900/80 mb-5 leading-relaxed">
              Ești sigură că dorești să elimini din evidență uleiul{' '}
              <span className="font-semibold text-emerald-950 block mt-1 text-base">
                "{oilToDelete.nameRo}"
              </span>
              <span className="text-xs text-emerald-700/80">({oilToDelete.nameEn})</span>?
            </p>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setOilToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-emerald-900 bg-white/90 border border-emerald-200 rounded-xl hover:bg-emerald-100 active:scale-95 transition"
              >
                Renunță
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteOil}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl active:scale-95 shadow-sm transition disabled:opacity-50"
              >
                {deleting ? 'Se șterge...' : 'Da, șterge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fereastră Modal Adăugare Ulei */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Adaugă un Ulei Nou</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddOil} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Nume în Română *
                </label>
                <input
                  type="text"
                  placeholder="ex: Arbore de Ceai"
                  value={nameRo}
                  onChange={(e) => setNameRo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Nume în Engleză *
                </label>
                <input
                  type="text"
                  placeholder="ex: Tea Tree"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Sticle Mici (5ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={smallBottles}
                    onChange={(e) => setSmallBottles(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Sticle Mari (15ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={largeBottles}
                    onChange={(e) => setLargeBottles(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Se salvează...' : 'Salvează Ulei'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}