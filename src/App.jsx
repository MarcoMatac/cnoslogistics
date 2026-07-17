import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Settings, LogOut, School, 
  ChevronLeft, ChevronRight, Filter, X, Plus, 
  Lock, Eye, Edit2, ShieldAlert, DoorOpen, Tv, Wifi, Monitor, PenTool, Network, Key, Trash2, CalendarDays, Menu, CheckCircle2, History
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO, isWeekend } from 'date-fns';
import { it } from 'date-fns/locale';

// Integrazione Firebase (Assicurati di avere writeBatch)
import { db } from './firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc, writeBatch } from 'firebase/firestore';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ----------------------------------------------------------------------
// MODULO: SMART MODAL (Responsive Bottom Sheet su Mobile)
// ----------------------------------------------------------------------
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>
        <div className="mb-4 sm:mb-6 flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 shrink-0">
          <h2 className="text-xl font-black tracking-tight text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODULO PRINCIPALE: CORE APP & ROUTING
// ----------------------------------------------------------------------
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('calendar'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      if (usersData.length === 0 && !snapshot.metadata.fromCache) {
        setDoc(doc(db, "users", "admin-default"), { username: 'admin', password: 'password123', role: 'Master', name: 'Direttore' });
      }
    });

    const unsubRooms = onSnapshot(collection(db, "rooms"), (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => { unsubUsers(); unsubRooms(); unsubBookings(); };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) {
      setCurrentUser(user); setCurrentView('calendar');
      setLoginError(''); setLoginUsername(''); setLoginPassword('');
    } else {
      setLoginError('Credenziali errate.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null); setCurrentView('calendar'); setIsMobileMenuOpen(false);
  };

  const navigateTo = (view) => {
    setCurrentView(view); setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-indigo-600"><Settings size={40} /></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
              <School size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">CnosLogistics</h1>
            <p className="text-slate-500 mt-2 font-medium">Accedi al pannello di gestione</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (<div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100 text-center animate-in fade-in zoom-in duration-200">{loginError}</div>)}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome Utente</label>
              <input required type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Es. admin" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 sm:py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <Lock size={18} /> Entra nel Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'Master' && (currentView === 'rooms' || currentView === 'users')) {
    setCurrentView('calendar');
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={classNames(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl lg:shadow-none lg:border-r border-slate-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between lg:justify-start gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <School size={24} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">CnosLogistics</h1>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                {currentUser.role === 'Master' && <ShieldAlert size={12}/>} {currentUser.role}
              </span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => navigateTo('calendar')} className={classNames("w-full flex items-center gap-3 px-4 py-3.5 lg:py-3 rounded-xl text-sm font-bold transition-all", currentView === 'calendar' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
            <Calendar size={18} /> Calendario Aule
          </button>
          
          {currentUser.role === 'Master' && (
            <>
              <div className="pt-6 pb-2"><p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amministrazione</p></div>
              <button onClick={() => navigateTo('rooms')} className={classNames("w-full flex items-center gap-3 px-4 py-3.5 lg:py-3 rounded-xl text-sm font-bold transition-all", currentView === 'rooms' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
                <DoorOpen size={18} /> Gestione Aule
              </button>
              <button onClick={() => navigateTo('users')} className={classNames("w-full flex items-center gap-3 px-4 py-3.5 lg:py-3 rounded-xl text-sm font-bold transition-all", currentView === 'users' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
                <Users size={18} /> Gestione Utenti
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">{currentUser.name}</span>
              <span className="text-xs text-green-600 font-bold flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Sistema Online</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 lg:py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">
            <LogOut size={16} /> Disconnetti
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen w-full relative">
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm"><School size={16}/></div>
             <span className="font-bold text-slate-900 tracking-tight">CnosLogistics</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><Menu size={24}/></button>
        </div>

        <header className="hidden lg:flex h-24 px-8 items-center justify-between border-b border-slate-200/50 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {currentView === 'calendar' ? 'Disponibilità Aule' : currentView === 'rooms' ? 'Gestione Parco Aule' : 'Controllo Accessi'}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Gestione dati centralizzata in tempo reale.</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl h-full">
            {currentView === 'calendar' ? (
              <CalendarView currentUser={currentUser} users={users} bookings={bookings} rooms={rooms} />
            ) : currentView === 'rooms' && currentUser.role === 'Master' ? (
              <RoomsManagerView rooms={rooms} />
            ) : currentView === 'users' && currentUser.role === 'Master' ? (
              <UsersManagerView users={users} currentUser={currentUser} setCurrentUser={setCurrentUser} bookings={bookings} rooms={rooms} />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODULO: CALENDARIO (Ottimizzato Touch + Cancellazione Multipla)
// ----------------------------------------------------------------------
function CalendarView({ currentUser, users, bookings, rooms }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRoom, setFilterRoom] = useState('all');
  const [activeTab, setActiveTab] = useState('new');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setActiveTab('new');
    setIsModalOpen(true);
  };

  const handleViewBookings = (day, e) => {
    e.stopPropagation();
    setSelectedDate(day);
    setActiveTab('list');
    setIsModalOpen(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    await deleteDoc(doc(db, "bookings", bookingId));
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between lg:justify-start gap-4">
          <h2 className="text-xl sm:text-2xl font-black capitalize text-slate-800 tracking-tight">
            {format(currentDate, "MMMM yyyy", { locale: it })}
          </h2>
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2.5 sm:p-2 text-slate-500 hover:bg-slate-50 transition-colors"><ChevronLeft size={20} /></button>
            <div className="w-px bg-slate-200"></div>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2.5 sm:p-2 text-slate-500 hover:bg-slate-50 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="w-full appearance-none bg-white rounded-xl border border-slate-300 py-3 sm:py-2.5 pl-10 pr-10 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none shadow-sm transition-shadow">
              <option value="all">Tutte le Aule</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {(currentUser.role === 'Master' || currentUser.role === 'Editor') && (
            <button onClick={() => handleDayClick(new Date())} className="bg-indigo-600 text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
              <Plus size={18} /> Prenota / Gestisci
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-slate-200 gap-[1px]">
        <div className="grid grid-cols-7 bg-white shrink-0">
          {["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"].map((day, i) => (
            <div key={day} className="py-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"][i]}</span>
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-7 bg-slate-200 gap-[1px] auto-rows-fr overflow-y-auto">
          {daysInMonth.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            let dayBookings = bookings.filter(b => b.date === dateKey);
            if (filterRoom !== 'all') dayBookings = dayBookings.filter(b => b.classroomId === filterRoom);
            const isTodayDate = isToday(day);

            return (
              <div key={day.toString()} onClick={() => handleDayClick(day)} className={classNames(
                "bg-white min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2.5 transition-colors cursor-pointer group relative flex flex-col active:bg-indigo-50/50 hover:bg-indigo-50/30", 
                !isSameMonth(day, currentDate) && "bg-slate-50/50 opacity-60", 
                isTodayDate && "bg-indigo-50/20"
              )}>
                <div className="flex items-start justify-between shrink-0 mb-1.5">
                  <span className={classNames("flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all", isTodayDate ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-700 bg-transparent group-hover:text-indigo-700")}>
                    {format(day, "d")}
                  </span>
                  {dayBookings.length > 0 && <span className="sm:hidden h-2 w-2 rounded-full bg-indigo-500 mt-1"></span>}
                </div>
                
                <div className="hidden sm:flex flex-1 flex-col gap-1.5 overflow-y-auto no-scrollbar">
                  {dayBookings.slice(0, 3).map((booking) => {
                    const room = rooms.find(r => r.id === booking.classroomId);
                    const isOwnBooking = booking.userId === currentUser.id;
                    return (
                      <div key={booking.id} onClick={(e) => handleViewBookings(day, e)} className={classNames("px-2.5 py-1.5 rounded-lg text-xs font-bold border flex flex-col gap-0.5 shadow-sm transition-transform hover:-translate-y-px", isOwnBooking ? "bg-indigo-50 text-indigo-800 border-indigo-100" : "bg-slate-50 text-slate-700 border-slate-200")}>
                        <span className="truncate">{booking.startTime} - {room?.name}</span>
                        <span className="truncate opacity-75 font-medium">{booking.courseName}</span>
                      </div>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <div onClick={(e) => handleViewBookings(day, e)} className="text-xs font-bold text-indigo-600 mt-1 pl-1 hover:underline">
                      +{dayBookings.length - 3} altre...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDate ? format(selectedDate, "EEEE d MMMM yyyy", { locale: it }) : "Dettagli"}>
        {selectedDate && (
          <div className="mt-2 sm:mt-4 h-full flex flex-col">
            {/* TABS CON CANCELLAZIONE MULTIPLA */}
            <div className="flex border-b border-slate-200 mb-5 sm:mb-6 shrink-0 overflow-x-auto no-scrollbar gap-2">
              <button onClick={() => setActiveTab('new')} className={classNames("px-3 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap", activeTab === 'new' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
                Nuova 
              </button>
              <button onClick={() => setActiveTab('list')} className={classNames("px-3 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap", activeTab === 'list' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
                Giorno ({bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).length})
              </button>
              <button onClick={() => setActiveTab('delete')} className={classNames("px-3 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap", activeTab === 'delete' ? "border-red-600 text-red-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
                Cancella Periodo
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {activeTab === 'new' ? (
                <BookingForm selectedDate={selectedDate} onClose={() => setIsModalOpen(false)} currentUser={currentUser} bookings={bookings} rooms={rooms} />
              ) : activeTab === 'delete' ? (
                <BulkDeleteForm currentUser={currentUser} bookings={bookings} rooms={rooms} onClose={() => setIsModalOpen(false)} />
              ) : (
                <div className="space-y-4">
                  {bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                       <CalendarDays size={32} className="mx-auto text-slate-300 mb-3" />
                       <p className="text-slate-500 font-bold">Nessuna prenotazione attiva.</p>
                    </div>
                  ) : (
                    bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(booking => {
                      const room = rooms.find(r => r.id === booking.classroomId);
                      const author = users.find(u => u.id === booking.userId);
                      const canDelete = currentUser.role === 'Master' || currentUser.id === booking.userId;

                      return (
                        <div key={booking.id} className="bg-white border border-slate-200 shadow-sm p-4 sm:p-5 rounded-2xl flex flex-col gap-3 relative transition-all hover:shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-slate-900 text-lg">{booking.courseName}</h4>
                              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-100 mt-2">
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                            {canDelete && (
                              <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-500 hover:bg-red-50 p-2 sm:p-2.5 rounded-xl text-sm font-bold transition-colors active:scale-95"><Trash2 size={18}/></button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                            <div className="flex items-center gap-2 font-bold"><DoorOpen size={16} className="text-slate-400"/> {room?.name || 'Aula Rimosossa'}</div>
                            <div className="flex items-center gap-2 font-bold"><Users size={16} className="text-slate-400"/> {author?.name || "Utente Rimosso"}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODULO: FORM PRENOTAZIONI (Con Pre-Flight Overlap Check)
// ----------------------------------------------------------------------
function BookingForm({ selectedDate, onClose, currentUser, bookings, rooms }) {
  const [formData, setFormData] = useState({ courseName: '', classroomId: '', startTime: '', endTime: '', specialRequests: '' });
  const [startDate, setStartDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [excludeSpecific, setExcludeSpecific] = useState(false);
  const [excludedDates, setExcludedDates] = useState([]);
  const [tempExcludeDate, setTempExcludeDate] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoomDetails = rooms.find(r => r.id === formData.classroomId);

  const handleAddExcludeDate = () => {
    if (tempExcludeDate && !excludedDates.includes(tempExcludeDate)) { setExcludedDates([...excludedDates, tempExcludeDate]); setTempExcludeDate(''); }
  };
  const handleRemoveExcludeDate = (dateToRemove) => { setExcludedDates(excludedDates.filter(d => d !== dateToRemove)); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError(''); setIsSubmitting(true);
    if (formData.endTime <= formData.startTime) { setFormError("L'ora di fine deve essere successiva all'inizio."); setIsSubmitting(false); return; }
    if (endDate < startDate) { setFormError("Data fine precedente a data inizio."); setIsSubmitting(false); return; }

    try {
      const allDates = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
      const validDates = allDates.filter(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (excludeWeekends && isWeekend(date)) return false;
        if (excludeSpecific && excludedDates.includes(dateStr)) return false;
        return true;
      });

      if (validDates.length === 0) { setFormError("Nessuna data valida selezionata."); setIsSubmitting(false); return; }

      // PRE-FLIGHT CHECK: Controllo in tempo reale basato sui dati Live di onSnapshot
      let overlapError = null;
      for (let i = 0; i < validDates.length; i++) {
        const dateStr = format(validDates[i], "yyyy-MM-dd");
        const isOverlapping = bookings.some(b => b.date === dateStr && b.classroomId === formData.classroomId && formData.startTime < b.endTime && formData.endTime > b.startTime);
        if (isOverlapping) { overlapError = `Sovrapposizione rilevata! Aula appena occupata il ${format(validDates[i], "dd/MM/yyyy")} in questo orario.`; break; }
      }

      if (overlapError) { setFormError(overlapError); setIsSubmitting(false); return; }

      // Scrittura batch per prenotazioni ricorrenti multiple
      const batch = writeBatch(db);
      for (let i = 0; i < validDates.length; i++) {
        const newBookingRef = doc(collection(db, "bookings"));
        batch.set(newBookingRef, { userId: currentUser.id, date: format(validDates[i], "yyyy-MM-dd"), ...formData });
      }
      await batch.commit();

      onClose();
    } catch (error) { setFormError("Errore di connessione durante il salvataggio."); }
    setIsSubmitting(false);
  };

  if (currentUser.role === "Visual") {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
        <Eye size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-black text-slate-700">Sola Lettura</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Non hai i permessi per inserire prenotazioni.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {formError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-start sm:items-center gap-3">
          <ShieldAlert size={20} className="shrink-0 mt-0.5 sm:mt-0" /> <span>{formError}</span>
        </div>
      )}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome Attività</label>
        <input required type="text" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} placeholder="Es. Riunione Docenti" />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Seleziona Aula</label>
        <select required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.classroomId} onChange={e => setFormData({...formData, classroomId: e.target.value})}>
          <option value="">Scegli un'aula disponibile...</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Max {r.capacity})</option>)}
        </select>
        {selectedRoomDetails && (
          <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5"><Tv size={14} /> Dotazioni Aula</span>
            <div className="flex flex-wrap gap-2">
              {selectedRoomDetails.equipment.lim && <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200"><Tv size={12}/> LIM</span>}
              {selectedRoomDetails.equipment.wifi && <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200"><Wifi size={12}/> WiFi</span>}
              {selectedRoomDetails.equipment.pc && <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-black border border-indigo-100"><Monitor size={12}/> {selectedRoomDetails.equipment.pcCount} PC</span>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Ora Inizio</label>
          <input required type="time" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Ora Fine</label>
          <input required type="time" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
        <h4 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3"><CalendarDays size={18} className="text-indigo-600"/> Periodo e Ripetizioni</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Inizio Periodo</label>
            <input required type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Fine Periodo</label>
            <input required type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 p-3 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
            <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={excludeWeekends} onChange={e => setExcludeWeekends(e.target.checked)} />
            <span className="text-sm font-bold text-slate-700">Escludi Sabato e Domenica</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 p-3 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
            <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={excludeSpecific} onChange={e => setExcludeSpecific(e.target.checked)} />
            <span className="text-sm font-bold text-slate-700">Escludi giorni specifici (Festività)</span>
          </label>
          {excludeSpecific && (
            <div className="pl-2 sm:pl-4 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="date" className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 sm:py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" value={tempExcludeDate} onChange={e => setTempExcludeDate(e.target.value)} />
                <button type="button" onClick={handleAddExcludeDate} className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold px-6 py-3 sm:py-2 rounded-xl transition-colors active:scale-95 shadow-md">Aggiungi</button>
              </div>
              {excludedDates.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {excludedDates.map(date => (
                    <span key={date} className="inline-flex items-center gap-2 bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-black border border-slate-200 shadow-sm">
                      {format(parseISO(date), "dd/MM/yyyy")}
                      <button type="button" onClick={() => handleRemoveExcludeDate(date)} className="text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors"><X size={14} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 sm:pt-4 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
        <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Annulla</button>
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 sm:py-3 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
          {isSubmitting ? 'Salvataggio...' : 'Conferma Prenotazione'}
        </button>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------------
// MODULO: CANCELLAZIONE MASSIVA (Bulk Delete via Batch)
// ----------------------------------------------------------------------
function BulkDeleteForm({ currentUser, bookings, rooms, onClose }) {
  const [classroomId, setClassroomId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Trova le prenotazioni cancellabili dall'utente corrente per il periodo/aula
  const targetBookings = bookings.filter(b => {
    if (!classroomId || !startDate || !endDate) return false;
    const isTargetRoom = b.classroomId === classroomId;
    const isWithinRange = b.date >= startDate && b.date <= endDate;
    const hasPermission = currentUser.role === 'Master' || b.userId === currentUser.id;
    return isTargetRoom && isWithinRange && hasPermission;
  });

  const handleBulkDelete = async () => {
    if (targetBookings.length === 0) return;
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      targetBookings.forEach(booking => {
        batch.delete(doc(db, "bookings", booking.id));
      });
      await batch.commit();
      setStatusMsg(`Successo! Eliminate ${targetBookings.length} prenotazioni.`);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setStatusMsg("Errore durante l'eliminazione.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="text-red-600 shrink-0" size={24} />
        <p className="text-sm text-red-800 font-medium">Questa azione eliminerà tutte le <strong className="font-black">tue</strong> prenotazioni (o tutte se sei Master) nell'aula e nel periodo selezionato. L'azione è irreversibile.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Seleziona Aula da liberare</label>
          <select required className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" value={classroomId} onChange={e => setClassroomId(e.target.value)}>
            <option value="">Scegli aula...</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Dal Giorno</label>
            <input required type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Al Giorno</label>
            <input required type="date" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {classroomId && startDate && endDate && (
        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center animate-in fade-in">
          <p className="text-sm text-slate-600">Prenotazioni trovate e cancellabili:</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{targetBookings.length}</p>
        </div>
      )}

      {statusMsg && (
        <div className="p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 text-center font-bold text-sm">
          {statusMsg}
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 mt-4 border-t border-slate-100">
        <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Annulla</button>
        <button type="button" onClick={handleBulkDelete} disabled={targetBookings.length === 0 || isDeleting} className="px-8 py-3 text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 rounded-xl flex justify-center gap-2 items-center shadow-lg shadow-red-200 transition-all">
          {isDeleting ? 'Eliminazione...' : 'Conferma Eliminazione'}
        </button>
      </div>
    </div>
  );
}


// ----------------------------------------------------------------------
// MODULO: GESTIONE UTENTI (Con Recap Prenotazioni)
// ----------------------------------------------------------------------
function UsersManagerView({ users, currentUser, setCurrentUser, bookings, rooms }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const defaultForm = { name: '', username: '', password: '', role: 'Visual' };
  const [formData, setFormData] = useState(defaultForm);

  const handleDelete = async (userId) => {
    if(userId === currentUser.id) return;
    await deleteDoc(doc(db, "users", userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      await updateDoc(doc(db, "users", editingUser.id), formData);
      if (editingUser.id === currentUser.id) setCurrentUser({ ...currentUser, ...formData });
    } else {
      await addDoc(collection(db, "users"), formData);
    }
    setIsModalOpen(false);
  };

  const openRecap = (user) => {
    setViewingUser(user);
    setIsRecapModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
        <div>
          <h3 className="font-black text-xl lg:text-2xl text-slate-900">Gestione Utenti</h3>
        </div>
        <button onClick={() => { setEditingUser(null); setFormData(defaultForm); setIsModalOpen(true); }} className="w-full sm:w-auto bg-slate-900 text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-transform active:scale-95 shadow-md">
          <Plus size={18} /> Nuovo Utente
        </button>
      </div>
      
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 bg-slate-100/50">
        {users.map(user => (
          <div key={user.id} className="flex flex-col justify-between bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="font-black text-slate-900 text-lg leading-tight">{user.name}</span> 
                <span className={classNames("text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border shrink-0", user.role === 'Master' ? "bg-red-50 text-red-700 border-red-100" : user.role === 'Editor' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-green-50 text-green-700 border-green-100")}>{user.role}</span>
              </div>
              <div className="flex flex-col gap-2.5 text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="flex items-center gap-2.5"><Users size={16} className="text-slate-400"/> {user.username}</span>
                <span className="flex items-center gap-2.5"><Key size={16} className="text-slate-400"/> {user.password}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              <button onClick={() => openRecap(user)} className="w-full py-2.5 bg-slate-50 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm border border-slate-200">
                <History size={16} /> Recap Prenotazioni
              </button>
              <div className="flex gap-2">
                <button onClick={() => { setEditingUser(user); setFormData(user); setIsModalOpen(true); }} className="flex-1 py-2.5 bg-indigo-50 rounded-xl text-indigo-700 font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 text-sm"><Edit2 size={16} /> Modifica</button>
                {user.id !== currentUser.id && <button onClick={() => handleDelete(user.id)} className="px-4 py-2.5 bg-red-50 rounded-xl text-red-600 hover:bg-red-100 transition-colors active:scale-95"><Trash2 size={18}/></button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* MODALE RECAP UTENTE */}
      <Modal isOpen={isRecapModalOpen} onClose={() => setIsRecapModalOpen(false)} title={`Storico: ${viewingUser?.name}`}>
        <div className="space-y-4">
          {viewingUser && bookings.filter(b => b.userId === viewingUser.id).length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <CalendarDays size={32} className="mx-auto text-slate-300 mb-3" />
               <p className="text-slate-500 font-bold text-sm">Nessuna prenotazione trovata per questo utente.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {bookings.filter(b => b.userId === viewingUser?.id)
                .sort((a,b) => b.date.localeCompare(a.date)) // Più recenti/future prima
                .map(booking => {
                  const room = rooms.find(r => r.id === booking.classroomId);
                  const isFuture = booking.date >= format(new Date(), "yyyy-MM-dd");
                  return (
                    <div key={booking.id} className={classNames("p-4 rounded-xl border flex flex-col gap-2 relative", isFuture ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-slate-200 opacity-75")}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900">{booking.courseName}</h4>
                        <span className={classNames("text-[10px] font-black uppercase px-2 py-1 rounded-md", isFuture ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600")}>
                          {isFuture ? 'Futura' : 'Passata'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-indigo-700 mt-1">
                        <CalendarDays size={14} /> {format(parseISO(booking.date), "dd/MM/yyyy")} | {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1"><DoorOpen size={14}/> {room?.name || 'Aula Rimosossa'}</div>
                    </div>
                  );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* MODALE CREAZIONE/MODIFICA */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Modifica Utente" : "Nuovo Utente"}>
        <form onSubmit={handleSubmit} className="space-y-5 pb-4">
           <div>
            <label className="block text-sm font-bold mb-1.5 text-slate-700">Nome Completo</label>
            <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Es. Mario Rossi" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold mb-1.5 text-slate-700">Username</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-slate-700">Password</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-slate-700">Ruolo / Permessi</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Visual">Visual (Sola Lettura)</option>
              <option value="Editor">Editor (Crea Prenotazioni)</option>
              <option value="Master">Master (Amministratore)</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100">
             <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Annulla</button>
             <button type="submit" className="w-full sm:w-auto px-8 py-3.5 sm:py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95">Salva Utente</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODULO: GESTIONE AULE (Responsive Grid & Form)
// ----------------------------------------------------------------------
function RoomsManagerView({ rooms }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const defaultForm = { name: '', capacity: '', equipment: { lim: false, projector: false, wifi: false, wired: false, whiteboard: false, pc: false, pcCount: 0 } };
  const [formData, setFormData] = useState(defaultForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { ...formData, capacity: parseInt(formData.capacity) || 0, equipment: { ...formData.equipment, pcCount: formData.equipment.pc ? (parseInt(formData.equipment.pcCount) || 0) : 0 } };
    if (editingRoom) { await updateDoc(doc(db, "rooms", editingRoom.id), dataToSave); } 
    else { await addDoc(collection(db, "rooms"), dataToSave); }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
        <div>
          <h3 className="font-black text-xl lg:text-2xl text-slate-900">Gestione Parco Aule</h3>
        </div>
        <button onClick={() => { setEditingRoom(null); setFormData(defaultForm); setIsModalOpen(true); }} className="w-full sm:w-auto bg-slate-900 text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-transform active:scale-95 shadow-md">
          <Plus size={18} /> Nuova Aula
        </button>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 bg-slate-100/50">
        {rooms.map(room => (
          <div key={room.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow gap-5">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-black text-lg text-slate-900">{room.name}</span> 
                <span className="text-xs font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
                  Capienza max: {room.capacity}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {room.equipment.lim && <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-blue-100"><Tv size={12}/> LIM</span>}
                {room.equipment.projector && <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-amber-100"><Monitor size={12}/> Proiettore</span>}
                {room.equipment.wifi && <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-green-100"><Wifi size={12}/> WiFi</span>}
                {room.equipment.wired && <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-emerald-100"><Network size={12}/> LAN</span>}
                {room.equipment.whiteboard && <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200"><PenTool size={12}/> Lavagna</span>}
                {room.equipment.pc && <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-black border border-indigo-100"><Monitor size={12}/> {room.equipment.pcCount} PC</span>}
                {!Object.values(room.equipment).some(val => val === true || val > 0) && <span className="text-slate-400 italic text-sm font-medium">Nessuna dotazione.</span>}
              </div>
            </div>
            <button onClick={() => { setEditingRoom(room); setFormData(room); setIsModalOpen(true); }} className="w-full sm:w-auto p-3 sm:p-3.5 bg-indigo-50 rounded-xl text-indigo-600 hover:bg-indigo-100 transition-colors font-bold text-sm flex items-center justify-center gap-2 shrink-0">
              <Edit2 size={16} /> Modifica
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? "Modifica Aula" : "Nuova Aula"}>
        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold mb-1.5 text-slate-700">Nome Spazio/Aula</label>
              <input required type="text" placeholder="Es. Lab. Informatica" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-slate-700">Capienza Max</label>
              <input required type="number" min="1" placeholder="Es. 25" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 sm:py-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <label className="block text-sm font-black text-slate-900 mb-5 border-b border-slate-100 pb-3">Seleziona Dotazioni Tecniche</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <label className="flex items-center gap-3.5 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={formData.equipment.lim} onChange={e => setFormData({...formData, equipment: {...formData.equipment, lim: e.target.checked}})} />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-2.5"><Tv size={18} className="text-slate-400"/> LIM Interattiva</span>
              </label>
              <label className="flex items-center gap-3.5 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={formData.equipment.projector} onChange={e => setFormData({...formData, equipment: {...formData.equipment, projector: e.target.checked}})} />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-2.5"><Monitor size={18} className="text-slate-400"/> Videoproiettore</span>
              </label>
              <label className="flex items-center gap-3.5 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={formData.equipment.wifi} onChange={e => setFormData({...formData, equipment: {...formData.equipment, wifi: e.target.checked}})} />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-2.5"><Wifi size={18} className="text-slate-400"/> Rete WiFi</span>
              </label>
              <label className="flex items-center gap-3.5 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={formData.equipment.wired} onChange={e => setFormData({...formData, equipment: {...formData.equipment, wired: e.target.checked}})} />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-2.5"><Network size={18} className="text-slate-400"/> LAN Cablata</span>
              </label>
              <label className="flex items-center gap-3.5 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={formData.equipment.whiteboard} onChange={e => setFormData({...formData, equipment: {...formData.equipment, whiteboard: e.target.checked}})} />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-2.5"><PenTool size={18} className="text-slate-400"/> Lavagna Classica</span>
              </label>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-5">
              <label className="flex items-center gap-3.5 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={formData.equipment.pc} onChange={e => setFormData({...formData, equipment: {...formData.equipment, pc: e.target.checked}})} />
                <span className="text-base font-black text-slate-800 flex items-center gap-2.5"><Monitor size={20} className={formData.equipment.pc ? "text-indigo-600" : "text-slate-400"}/> PC Desktop in Aula</span>
              </label>
              {formData.equipment.pc && (
                <div className="flex items-center gap-3 sm:ml-auto animate-in fade-in slide-in-from-left-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">Quantità:</span>
                  <input type="number" min="1" required className="w-24 bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm font-black focus:ring-2 focus:ring-indigo-500 outline-none text-center" value={formData.equipment.pcCount || ''} onChange={e => setFormData({...formData, equipment: {...formData.equipment, pcCount: e.target.value}})} placeholder="0" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-4">
             <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Annulla</button>
             <button type="submit" className="w-full sm:w-auto px-8 py-3.5 sm:py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95">
               {editingRoom ? "Salva Modifiche" : "Crea Aula"}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
