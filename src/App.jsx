import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Settings, LogOut, School, 
  ChevronLeft, ChevronRight, Filter, X, Plus, 
  Lock, Eye, Edit2, ShieldAlert, DoorOpen, Tv, Wifi, Monitor, PenTool, Network, Key, Trash2, CalendarDays
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO, isWeekend } from 'date-fns';
import { it } from 'date-fns/locale';

// Integrazione Firebase
import { db } from './firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('calendar'); 
  
  // Stati collegati a Firebase
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stati Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      
      if (usersData.length === 0 && !snapshot.metadata.fromCache) {
        setDoc(doc(db, "users", "admin-default"), {
          username: 'admin', password: 'password123', role: 'Master', name: 'Direttore'
        });
      }
    });

    const unsubRooms = onSnapshot(collection(db, "rooms"), (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => {
      unsubUsers();
      unsubRooms();
      unsubBookings();
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    
    if (user) {
      setCurrentUser(user);
      // FIX ROUTING 1: Resetta sempre alla dashboard principale al login
      setCurrentView('calendar');
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Credenziali non valide. Riprova.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // FIX ROUTING 2: Pulisce la memoria della vista precedente al logout
    setCurrentView('calendar');
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
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
              <School size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">CnosLogistics</h1>
            <p className="text-slate-500 mt-2">Accedi al pannello di gestione cloud</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 text-center animate-in fade-in zoom-in duration-200">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Utente</label>
              <input required type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Es. admin" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Lock size={18} /> Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  // FIX ROUTING 3 (Guardia di Sicurezza): Se non sei Master e cerchi di vedere aule/utenti, vieni rimbalzato al calendario
  if (currentUser.role !== 'Master' && (currentView === 'rooms' || currentView === 'users')) {
    setCurrentView('calendar');
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <School size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">CnosLogistics</h1>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
              {currentUser.role === 'Master' && <ShieldAlert size={12}/>} Pannello {currentUser.role}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setCurrentView('calendar')} className={classNames("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", currentView === 'calendar' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
            <Calendar size={18} /> Calendario Aule
          </button>
          
          {currentUser.role === 'Master' && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amministrazione</p>
              </div>
              <button onClick={() => setCurrentView('rooms')} className={classNames("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", currentView === 'rooms' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
                <DoorOpen size={18} /> Gestione Aule
              </button>
              <button onClick={() => setCurrentView('users')} className={classNames("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", currentView === 'users' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
                <Users size={18} /> Gestione Utenti
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">{currentUser.name}</span>
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online (Cloud)
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">
            <LogOut size={16} /> Disconnetti
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="h-20 px-8 flex items-center border-b border-slate-200/50 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentView === 'calendar' ? 'Disponibilità Aule' : currentView === 'rooms' ? 'Gestione Parco Aule' : 'Controllo Accessi'}
            </h2>
            <p className="text-sm font-medium text-slate-500">Sistema operativo connesso e sincronizzato in tempo reale.</p>
          </div>
        </header>

        <div className="flex-1 px-8 pb-8 overflow-y-auto">
          <div className="h-full pt-8">
            {currentView === 'calendar' ? (
              <CalendarView currentUser={currentUser} users={users} bookings={bookings} rooms={rooms} />
            ) : currentView === 'rooms' && currentUser.role === 'Master' ? (
              <RoomsManagerView rooms={rooms} />
            ) : currentView === 'users' && currentUser.role === 'Master' ? (
              <UsersManagerView users={users} currentUser={currentUser} setCurrentUser={setCurrentUser} />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- CALENDAR VIEW COMPONENT ---
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
    <div className="h-full min-h-[600px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold capitalize text-slate-800 flex-1 sm:flex-none">
            {format(currentDate, "MMMM yyyy", { locale: it })}
          </h2>
          <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><ChevronLeft size={20} /></button>
            <div className="w-px bg-slate-200"></div>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="w-full sm:w-auto appearance-none bg-white rounded-lg border border-slate-300 py-2 pl-10 pr-10 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none shadow-sm transition-shadow">
              <option value="all">Filtra: Tutte le Aule</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {(currentUser.role === 'Master' || currentUser.role === 'Editor') && (
            <button onClick={() => handleDayClick(new Date())} className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={16} /> <span className="hidden sm:inline">Prenota</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-slate-200 gap-[1px]">
        <div className="grid grid-cols-7 bg-white shrink-0">
          {["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"].map((day, i) => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"][i]}</span>
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-7 bg-slate-200 gap-[1px] auto-rows-fr">
          {daysInMonth.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            let dayBookings = bookings.filter(b => b.date === dateKey);
            if (filterRoom !== 'all') dayBookings = dayBookings.filter(b => b.classroomId === filterRoom);
            
            const isTodayDate = isToday(day);

            return (
              <div key={day.toString()} onClick={() => handleDayClick(day)} className={classNames("bg-white min-h-[100px] p-2 sm:p-3 transition-colors cursor-pointer group relative flex flex-col hover:bg-indigo-50/30", !isSameMonth(day, currentDate) && "bg-slate-50/50 opacity-60", isTodayDate && "bg-indigo-50/50")}>
                <div className="flex items-start justify-between shrink-0 mb-1">
                  <span className={classNames("flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors", isTodayDate ? "bg-indigo-600 text-white" : "text-slate-700 bg-white group-hover:text-indigo-700 border border-transparent group-hover:border-indigo-100")}>
                    {format(day, "d")}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                  {dayBookings.slice(0, 3).map((booking) => {
                    const room = rooms.find(r => r.id === booking.classroomId);
                    const isOwnBooking = booking.userId === currentUser.id;
                    return (
                      <div key={booking.id} onClick={(e) => handleViewBookings(day, e)} className={classNames("px-2 py-1.5 rounded-md text-xs font-semibold border flex flex-col gap-0.5 shadow-sm transition-transform hover:scale-[1.02]", isOwnBooking ? "bg-indigo-100 text-indigo-800 border-indigo-200" : "bg-slate-100 text-slate-700 border-slate-200")}>
                        <span className="truncate">{booking.startTime} - {room?.name}</span>
                        <span className="truncate opacity-80">{booking.courseName}</span>
                      </div>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <div onClick={(e) => handleViewBookings(day, e)} className="text-xs font-bold text-indigo-600 mt-1 pl-1 hover:underline">
                      + {dayBookings.length - 3} prenotazioni...
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
          <div className="mt-4">
            <div className="flex border-b border-slate-200 mb-6">
              <button onClick={() => setActiveTab('new')} className={classNames("px-4 py-3 text-sm font-bold border-b-2 transition-colors", activeTab === 'new' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                Nuova Prenotazione
              </button>
              <button onClick={() => setActiveTab('list')} className={classNames("px-4 py-3 text-sm font-bold border-b-2 transition-colors", activeTab === 'list' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                Vedi Prenotazioni ({bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).length})
              </button>
            </div>

            {activeTab === 'new' ? (
              <BookingForm selectedDate={selectedDate} onClose={() => setIsModalOpen(false)} currentUser={currentUser} bookings={bookings} rooms={rooms} />
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                     <CalendarDays size={32} className="mx-auto text-slate-300 mb-3" />
                     <p className="text-slate-500 font-medium">Nessuna prenotazione per questo giorno.</p>
                  </div>
                ) : (
                  bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(booking => {
                    const room = rooms.find(r => r.id === booking.classroomId);
                    const author = users.find(u => u.id === booking.userId);
                    const canDelete = currentUser.role === 'Master' || currentUser.id === booking.userId;

                    return (
                      <div key={booking.id} className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex flex-col gap-3 relative transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{booking.courseName}</h4>
                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-sm font-bold border border-indigo-100 mt-1.5">
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          {canDelete && (
                            <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-bold transition-colors border border-transparent hover:border-red-100">Elimina</button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-2 font-medium"><DoorOpen size={16} className="text-slate-400"/> {room?.name || 'Aula rimossa'}</div>
                          <div className="flex items-center gap-2 font-medium"><Users size={16} className="text-slate-400"/> {author?.name || "Utente rimosso"}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// --- BOOKING FORM COMPONENT ---
function BookingForm({ selectedDate, onClose, currentUser, bookings, rooms }) {
  const [formData, setFormData] = useState({ courseName: '', classroomId: '', startTime: '', endTime: '', specialRequests: '' });
  const [startDate, setStartDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  
  // FIX REGRESSIONE 2: Ripristinati gli stati per la gestione avanzata
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [excludeSpecific, setExcludeSpecific] = useState(false);
  const [excludedDates, setExcludedDates] = useState([]);
  const [tempExcludeDate, setTempExcludeDate] = useState('');
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoomDetails = rooms.find(r => r.id === formData.classroomId);

  const handleAddExcludeDate = () => {
    if (tempExcludeDate && !excludedDates.includes(tempExcludeDate)) {
      setExcludedDates([...excludedDates, tempExcludeDate]);
      setTempExcludeDate('');
    }
  };

  const handleRemoveExcludeDate = (dateToRemove) => {
    setExcludedDates(excludedDates.filter(d => d !== dateToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (formData.endTime <= formData.startTime) {
      setFormError("L'ora di fine deve essere successiva all'ora di inizio.");
      setIsSubmitting(false);
      return;
    }

    if (endDate < startDate) {
      setFormError("La data di fine non può essere precedente alla data di inizio.");
      setIsSubmitting(false);
      return;
    }

    try {
      const allDates = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
      const validDates = allDates.filter(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (excludeWeekends && isWeekend(date)) return false;
        if (excludeSpecific && excludedDates.includes(dateStr)) return false;
        return true;
      });

      if (validDates.length === 0) {
        setFormError("Nessuna data valida selezionata per la prenotazione. Controlla le esclusioni.");
        setIsSubmitting(false);
        return;
      }

      let overlapError = null;
      for (let i = 0; i < validDates.length; i++) {
        const dateStr = format(validDates[i], "yyyy-MM-dd");
        const isOverlapping = bookings.some(b => 
          b.date === dateStr && b.classroomId === formData.classroomId &&
          formData.startTime < b.endTime && formData.endTime > b.startTime
        );

        if (isOverlapping) {
          overlapError = `Attenzione: l'aula è già occupata il giorno ${format(validDates[i], "dd/MM/yyyy")} in questo orario.`;
          break;
        }
      }

      if (overlapError) {
        setFormError(overlapError);
        setIsSubmitting(false);
        return;
      }

      for (let i = 0; i < validDates.length; i++) {
        const dateStr = format(validDates[i], "yyyy-MM-dd");
        await addDoc(collection(db, "bookings"), {
          userId: currentUser.id,
          date: dateStr,
          ...formData
        });
      }

      onClose();
    } catch (error) {
      setFormError("Errore di connessione al database o date non valide.");
    }
    setIsSubmitting(false);
  };

  if (currentUser.role === "Visual") {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
        <Eye size={40} className="mx-auto text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-700">Modalità Sola Lettura</h3>
        <p className="text-slate-500 mt-1 max-w-sm mx-auto">Permessi insufficienti per prenotare.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 flex items-center gap-2 animate-in fade-in">
          <ShieldAlert size={16} className="shrink-0" /> <span>{formError}</span>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Corso / Attività</label>
        <input required type="text" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-shadow" value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} placeholder="Es. Corso di Informatica" />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Seleziona Aula</label>
        <select required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-shadow" value={formData.classroomId} onChange={e => setFormData({...formData, classroomId: e.target.value})}>
          <option value="">Scegli un'aula disponibile...</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Max {r.capacity})</option>)}
        </select>
        
        {selectedRoomDetails && (
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
             <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Tv size={12} /> Dotazioni incluse:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedRoomDetails.equipment.lim && <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2 py-1 rounded-md text-xs font-medium border border-slate-200"><Tv size={12}/> LIM</span>}
                {selectedRoomDetails.equipment.projector && <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2 py-1 rounded-md text-xs font-medium border border-slate-200"><Monitor size={12}/> Proiettore</span>}
                {selectedRoomDetails.equipment.wifi && <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2 py-1 rounded-md text-xs font-medium border border-slate-200"><Wifi size={12}/> WiFi</span>}
                {selectedRoomDetails.equipment.wired && <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2 py-1 rounded-md text-xs font-medium border border-slate-200"><Network size={12}/> LAN</span>}
                {selectedRoomDetails.equipment.whiteboard && <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2 py-1 rounded-md text-xs font-medium border border-slate-200"><PenTool size={12}/> Lavagna</span>}
                {selectedRoomDetails.equipment.pc && <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-indigo-100"><Monitor size={12}/> {selectedRoomDetails.equipment.pcCount} PC</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Ora Inizio</label>
          <input required type="time" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Ora Fine</label>
          <input required type="time" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
        </div>
      </div>

      {/* FIX REGRESSIONE 2: Interfaccia Gestione Date Avanzata Completamente Ripristinata */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2"><CalendarDays size={16} className="text-indigo-600"/> Periodo e Ripetizioni</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dal Giorno</label>
            <input required type="date" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Al Giorno</label>
            <input required type="date" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={excludeWeekends} onChange={e => setExcludeWeekends(e.target.checked)} />
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Escludi Sabato e Domenica</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" checked={excludeSpecific} onChange={e => setExcludeSpecific(e.target.checked)} />
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Escludi giorni specifici (es. Festività)</span>
          </label>

          {/* UI Scomparsa per le Date Specifiche */}
          {excludeSpecific && (
            <div className="pl-6 animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
              <div className="flex gap-2">
                <input type="date" className="flex-1 bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm" value={tempExcludeDate} onChange={e => setTempExcludeDate(e.target.value)} />
                <button type="button" onClick={handleAddExcludeDate} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors">
                  Aggiungi
                </button>
              </div>
              
              {excludedDates.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                  {excludedDates.map(date => (
                    <span key={date} className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-100">
                      {format(parseISO(date), "dd/MM/yyyy")}
                      <button type="button" onClick={() => handleRemoveExcludeDate(date)} className="hover:bg-red-200 rounded-full p-0.5 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 mt-6">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annulla</button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-md flex items-center gap-2 transition-colors">
          {isSubmitting ? 'Salvataggio...' : 'Conferma Prenotazione'}
        </button>
      </div>
    </form>
  );
}

// --- USERS MANAGER VIEW ---
function UsersManagerView({ users, currentUser, setCurrentUser }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-lg text-slate-900">Gestione Utenti</h3>
        </div>
        <button onClick={() => { setEditingUser(null); setFormData(defaultForm); setIsModalOpen(true); }} className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
          <Plus size={16} /> Nuovo Utente
        </button>
      </div>
      <div className="overflow-x-auto p-6">
        <div className="grid gap-4">
          {users.map(user => (
            <div key={user.id} className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-lg">{user.name}</span> 
                  <span className={classNames("text-xs font-bold px-2.5 py-1 rounded-md border", user.role === 'Master' ? "bg-red-50 text-red-700 border-red-100" : user.role === 'Editor' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-green-50 text-green-700 border-green-100")}>{user.role}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Users size={14}/> {user.username}</span>
                  <span className="flex items-center gap-1.5"><Key size={14}/> {user.password}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingUser(user); setFormData(user); setIsModalOpen(true); }} className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors"><Edit2 size={16} /></button>
                {user.id !== currentUser.id && <button onClick={() => handleDelete(user.id)} className="p-2.5 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Modifica Utente" : "Nuovo Utente"}>
        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Nome Completo</label>
            <input required type="text" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Es. Mario Rossi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Username</label>
              <input required type="text" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Password</label>
              <input required type="text" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Ruolo</label>
            <select className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Visual">Visual (Sola Lettura)</option>
              <option value="Editor">Editor (Prenotazioni)</option>
              <option value="Master">Master (Amministratore)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annulla</button>
             <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">Salva Utente</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// --- ROOMS MANAGER VIEW ---
function RoomsManagerView({ rooms }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const defaultForm = { 
    name: '', 
    capacity: '', 
    equipment: { 
      lim: false, 
      projector: false, 
      wifi: false, 
      wired: false, 
      whiteboard: false, 
      pc: false, 
      pcCount: 0 
    } 
  };
  const [formData, setFormData] = useState(defaultForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSave = { 
      ...formData, 
      capacity: parseInt(formData.capacity) || 0,
      equipment: {
        ...formData.equipment,
        pcCount: formData.equipment.pc ? (parseInt(formData.equipment.pcCount) || 0) : 0
      }
    };

    if (editingRoom) {
      await updateDoc(doc(db, "rooms", editingRoom.id), dataToSave);
    } else {
      await addDoc(collection(db, "rooms"), dataToSave);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-lg text-slate-900">Gestione Parco Aule</h3>
          <p className="text-sm text-slate-500 mt-1">Configura le aule disponibili e le loro dotazioni tecniche.</p>
        </div>
        <button onClick={() => { setEditingRoom(null); setFormData(defaultForm); setIsModalOpen(true); }} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
          <Plus size={18} /> Nuova Aula
        </button>
      </div>

      <div className="p-6 grid gap-4">
        {rooms.map(room => (
          <div key={room.id} className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-slate-900">{room.name}</span> 
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                  Capienza max: {room.capacity}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {room.equipment.lim && <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100"><Tv size={12}/> LIM</span>}
                {room.equipment.projector && <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs font-bold border border-amber-100"><Monitor size={12}/> Proiettore</span>}
                {room.equipment.wifi && <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold border border-green-100"><Wifi size={12}/> WiFi</span>}
                {room.equipment.wired && <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100"><Network size={12}/> LAN</span>}
                {room.equipment.whiteboard && <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2 py-1 rounded-md text-xs font-bold border border-slate-200"><PenTool size={12}/> Lavagna</span>}
                {room.equipment.pc && <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-bold border border-purple-100"><Monitor size={12}/> {room.equipment.pcCount} PC</span>}
                {!Object.values(room.equipment).some(val => val === true || val > 0) && <span className="text-slate-400 italic text-xs font-medium">Nessuna dotazione tecnica</span>}
              </div>
            </div>
            <button onClick={() => { setEditingRoom(room); setFormData(room); setIsModalOpen(true); }} className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors font-medium text-sm flex items-center gap-2">
              <Edit2 size={16} /> Modifica
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? "Modifica Aula" : "Nuova Aula"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Nome Spazio/Aula</label>
              <input required type="text" placeholder="Es. Laboratorio Lingue" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-shadow" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Capienza Max</label>
              <input required type="number" min="1" placeholder="Es. 25" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-shadow" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <label className="block text-sm font-bold text-slate-800 mb-5">Seleziona Dotazioni Tecniche</label>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 transition-colors" checked={formData.equipment.lim} onChange={e => setFormData({...formData, equipment: {...formData.equipment, lim: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex items-center gap-2"><Tv size={18} className="text-slate-400"/> LIM</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 transition-colors" checked={formData.equipment.projector} onChange={e => setFormData({...formData, equipment: {...formData.equipment, projector: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex items-center gap-2"><Monitor size={18} className="text-slate-400"/> Videoproiettore</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 transition-colors" checked={formData.equipment.wifi} onChange={e => setFormData({...formData, equipment: {...formData.equipment, wifi: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex items-center gap-2"><Wifi size={18} className="text-slate-400"/> WiFi</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 transition-colors" checked={formData.equipment.wired} onChange={e => setFormData({...formData, equipment: {...formData.equipment, wired: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex items-center gap-2"><Network size={18} className="text-slate-400"/> LAN Cablata</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 transition-colors" checked={formData.equipment.whiteboard} onChange={e => setFormData({...formData, equipment: {...formData.equipment, whiteboard: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex items-center gap-2"><PenTool size={18} className="text-slate-400"/> Lavagna Classica</span>
              </label>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 transition-colors" checked={formData.equipment.pc} onChange={e => setFormData({...formData, equipment: {...formData.equipment, pc: e.target.checked}})} />
                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors flex items-center gap-2"><Monitor size={18} className={formData.equipment.pc ? "text-indigo-600" : "text-slate-400"}/> Computer in Aula</span>
              </label>
              
              {formData.equipment.pc && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                  <span className="text-sm font-medium text-slate-500">Specifica numero:</span>
                  <input type="number" min="1" required className="w-24 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" value={formData.equipment.pcCount || ''} onChange={e => setFormData({...formData, equipment: {...formData.equipment, pcCount: e.target.value}})} placeholder="Es. 20" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4">
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annulla</button>
             <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
               {editingRoom ? "Salva Modifiche" : "Crea Aula"}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
