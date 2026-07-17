// ... existing code ...
import React, { useState, useMemo } from 'react';
import { 
  Calendar, Users, Settings, LogOut, School, 
  ChevronLeft, ChevronRight, Filter, X, Plus, 
  Lock, Eye, Edit2, ShieldAlert, DoorOpen, Tv, Wifi, Monitor, PenTool, Network, Key, Trash2, CalendarDays
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO, isSameDay, isWeekend } from 'date-fns';
import { it } from 'date-fns/locale';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-center justify-between">
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

// --- MOCK DATA E STATO INIZIALE ---
const initialUsers = [
  { id: '1', username: 'admin', password: 'password123', role: 'Master', name: 'Direttore' },
  { id: '2', username: 'prof_rossi', password: 'segreta456', role: 'Editor', name: 'Prof. Rossi' },
  { id: '3', username: 'segreteria', password: 'scuola789', role: 'Visual', name: 'Segreteria' },
];

const initialRooms = [
  { id: '1', name: 'Aula Magna', capacity: 100, equipment: { lim: true, projector: true, pc: true, wifi: true, wired: false, pcCount: 1, whiteboard: false } },
  { id: '2', name: 'Laboratorio Informatica', capacity: 25, equipment: { lim: false, projector: true, pc: true, wifi: true, wired: true, pcCount: 25, whiteboard: true } },
  { id: '3', name: 'Aula 3B', capacity: 20, equipment: { lim: true, projector: false, pc: false, wifi: true, wired: false, pcCount: 0, whiteboard: true } },
];

const initialBookings = [
  { id: '1', classroomId: '1', userId: '2', courseName: 'Riunione Plenaria', startTime: '09:00', endTime: '11:00', date: '2026-07-20', specialRequests: '' },
  { id: '2', classroomId: '2', userId: '2', courseName: 'Corso Office', startTime: '14:00', endTime: '16:00', date: '2026-07-22', specialRequests: 'Serve software installato' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar', 'users', 'rooms'
  const [users, setUsers] = useState(initialUsers);
  const [bookings, setBookings] = useState(initialBookings);
  const [rooms, setRooms] = useState(initialRooms);

  // --- STATI PER IL LOGIN REALE ---
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Ricerca l'utente confrontando username e password (case-sensitive)
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    
    if (user) {
      setCurrentUser(user);
      setLoginError(''); // Pulisce eventuali errori precedenti
      setLoginUsername(''); // Resetta i campi
      setLoginPassword('');
    } else {
      setLoginError('Credenziali non valide. Riprova.');
    }
  };

  // --- SCHERMATA DI LOGIN REALE ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
              <School size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">CnosLogistics</h1>
            <p className="text-slate-500 mt-2">Accedi al pannello di gestione</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 text-center">
                {loginError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Utente</label>
              <input 
                required 
                type="text" 
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" 
                placeholder="Es. admin" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                required 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" 
                placeholder="••••••••" 
              />
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Lock size={18} /> Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- STRUTTURA PRINCIPALE APP ---
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* SIDEBAR */}
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
          <button 
            onClick={() => setCurrentView('calendar')}
            className={classNames(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              currentView === 'calendar' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Calendar size={18} /> Calendario Aule
          </button>
          
          {currentUser.role === 'Master' && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amministrazione</p>
              </div>
              <button 
                onClick={() => setCurrentView('rooms')}
                className={classNames(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  currentView === 'rooms' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <DoorOpen size={18} /> Gestione Aule
              </button>
              <button 
                onClick={() => setCurrentView('users')}
                className={classNames(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  currentView === 'users' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Users size={18} /> Gestione Utenti
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">{currentUser.name}</span>
              <span className="text-xs text-slate-500">Connesso</span>
            </div>
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
          >
            <LogOut size={16} /> Disconnetti
          </button>
        </div>
      </aside>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="h-20 px-8 flex items-center border-b border-slate-200/50 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentView === 'calendar' ? 'Disponibilità Aule' : currentView === 'rooms' ? 'Gestione Parco Aule' : 'Controllo Accessi'}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {currentView === 'calendar' ? 'Controlla e gestisci le prenotazioni in tempo reale.' : currentView === 'rooms' ? 'Configura le aule e le relative dotazioni tecniche.' : 'Gestisci chi può accedere e i loro permessi.'}
            </p>
          </div>
        </header>

        {/* CONTAINER CON SCROLL INDIPENDENTE */}
        <div className="flex-1 px-8 pb-8 overflow-y-auto">
          <div className="h-full pt-8">
            {currentView === 'calendar' ? (
              <CalendarView 
                currentUser={currentUser} 
                users={users}
                bookings={bookings} 
                setBookings={setBookings}
                rooms={rooms} 
              />
            ) : currentView === 'rooms' ? (
              <RoomsManagerView rooms={rooms} setRooms={setRooms} />
            ) : (
              <UsersManagerView users={users} setUsers={setUsers} currentUser={currentUser} setCurrentUser={setCurrentUser} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CalendarView({ currentUser, users, bookings, setBookings, rooms }) {
  const [currentDate, setCurrentDate] = useState(new Date()); // Inizializza automaticamente a oggi
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRoom, setFilterRoom] = useState('all');
  const [activeTab, setActiveTab] = useState('new'); // 'new' o 'list' per il modal

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

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

  // Funzione per eliminare una prenotazione (solo l'autore o il Master può)
  const handleDeleteBooking = (bookingId) => {
    setBookings(bookings.filter(b => b.id !== bookingId));
  };

  return (
    <div className="h-full min-h-[600px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold capitalize text-slate-800 flex-1 sm:flex-none">
            {format(currentDate, "MMMM yyyy", { locale: it })}
          </h2>
          <div className="flex bg-white rounded-lg shadow-sm border border-slate-200">
            <button onClick={prevMonth} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-lg transition-colors"><ChevronLeft size={20} /></button>
            <div className="w-px bg-slate-200"></div>
            <button onClick={nextMonth} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-r-lg transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white rounded-lg border border-slate-300 py-2 pl-10 pr-10 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none shadow-sm"
            >
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
        {/* Intestazione giorni */}
        <div className="grid grid-cols-7 bg-white shrink-0">
          {["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"].map((day, i) => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"][i]}</span>
            </div>
          ))}
        </div>
        
        {/* Griglia giorni */}
        <div className="flex-1 grid grid-cols-7 bg-slate-200 gap-[1px] auto-rows-fr">
          {daysInMonth.map((day, dayIdx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            let dayBookings = bookings.filter(b => b.date === dateKey);
            if (filterRoom !== 'all') {
              dayBookings = dayBookings.filter(b => b.classroomId === filterRoom);
            }
            
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={classNames(
                  "bg-white min-h-[100px] p-2 sm:p-3 transition-colors cursor-pointer group relative flex flex-col hover:bg-indigo-50/30",
                  !isCurrentMonth && "bg-slate-50/50 opacity-60",
                  isTodayDate && "bg-indigo-50/50"
                )}
              >
                <div className="flex items-start justify-between shrink-0 mb-1">
                  <span className={classNames(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shadow-sm",
                    isTodayDate ? "bg-indigo-600 text-white" : "text-slate-700 bg-white group-hover:text-indigo-700 border border-transparent group-hover:border-indigo-100"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                  {dayBookings.slice(0, 3).map((booking) => {
                    const room = rooms.find(r => r.id === booking.classroomId);
                    const isOwnBooking = booking.userId === currentUser.id;
                    return (
                      <div key={booking.id} 
                           onClick={(e) => handleViewBookings(day, e)}
                           className={classNames(
                             "px-2 py-1.5 rounded-md text-xs font-semibold border flex flex-col gap-0.5",
                             isOwnBooking ? "bg-indigo-100 text-indigo-800 border-indigo-200" : "bg-slate-100 text-slate-700 border-slate-200"
                           )}
                           title={`${booking.startTime}-${booking.endTime} ${room?.name} - ${booking.courseName}`}
                      >
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedDate ? format(selectedDate, "EEEE d MMMM yyyy", { locale: it }) : "Dettagli"}
      >
        {selectedDate && (
          <div className="mt-4">
            {/* Tabs del Modal */}
            <div className="flex border-b border-slate-200 mb-4">
              <button 
                onClick={() => setActiveTab('new')}
                className={classNames("px-4 py-2 text-sm font-bold border-b-2 transition-colors", activeTab === 'new' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
              >
                Nuova Prenotazione
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={classNames("px-4 py-2 text-sm font-bold border-b-2 transition-colors", activeTab === 'list' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}
              >
                Vedi Prenotazioni ({bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).length})
              </button>
            </div>

            {/* Contenuto Tabs */}
            {activeTab === 'new' ? (
              <BookingForm 
                selectedDate={selectedDate} 
                onClose={() => setIsModalOpen(false)} 
                userRole={currentUser.role}
                userId={currentUser.id}
                bookings={bookings}
                setBookings={setBookings}
                rooms={rooms}
              />
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).length === 0 ? (
                  <p className="text-slate-500 text-center py-6">Nessuna prenotazione per questo giorno.</p>
                ) : (
                  bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(booking => {
                    const room = rooms.find(r => r.id === booking.classroomId);
                    const author = users.find(u => u.id === booking.userId);
                    const authorName = author ? author.name : "Utente rimosso";
                    const canDelete = currentUser.role === 'Master' || currentUser.id === booking.userId;

                    return (
                      <div key={booking.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{booking.courseName}</h4>
                            <p className="text-sm text-indigo-700 font-semibold">{booking.startTime} - {booking.endTime}</p>
                          </div>
                          {canDelete && (
                            <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-bold transition-colors">
                              Elimina
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mt-2">
                          <div className="flex items-center gap-1.5"><DoorOpen size={14} className="text-slate-400"/> {room?.name || 'Aula rimossa'}</div>
                          <div className="flex items-center gap-1.5"><Users size={14} className="text-slate-400"/> {authorName}</div>
                        </div>
                        {booking.specialRequests && (
                          <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-200">
                            <strong>Note:</strong> {booking.specialRequests}
                          </div>
                        )}
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

function BookingForm({ selectedDate, onClose, userRole, userId, bookings, setBookings, rooms }) {
  const [formData, setFormData] = useState({
    courseName: '', classroomId: '', startTime: '', endTime: '', specialRequests: ''
  });
  
  // Nuovi stati per prenotazioni ricorrenti/multigiorno
  const [startDate, setStartDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [excludeSpecific, setExcludeSpecific] = useState(false);
  const [excludedDates, setExcludedDates] = useState([]);
  const [tempExcludeDate, setTempExcludeDate] = useState('');

  const [formError, setFormError] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validazione 1: Ordine temporale (Ore)
    if (formData.endTime <= formData.startTime) {
      setFormError("L'ora di fine deve essere successiva all'ora di inizio.");
      return;
    }

    // Validazione 2: Ordine Giorni
    if (endDate < startDate) {
      setFormError("La data di fine non può essere precedente alla data di inizio.");
      return;
    }

    try {
      // Genera tutte le date incluse nel periodo
      const allDates = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
      
      // Applica i filtri (escludi weekend e giorni specifici)
      const validDates = allDates.filter(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (excludeWeekends && isWeekend(date)) return false;
        if (excludeSpecific && excludedDates.includes(dateStr)) return false;
        return true;
      });

      if (validDates.length === 0) {
        setFormError("Nessuna data valida selezionata per la prenotazione. Controlla le esclusioni.");
        return;
      }

      // Validazione 3: Controllo Sovrapposizioni (Overlap) su TUTTE le date valide
      let overlapError = null;
      const newBookings = [];

      for (let i = 0; i < validDates.length; i++) {
        const dateStr = format(validDates[i], "yyyy-MM-dd");
        
        const isOverlapping = bookings.some(b => 
          b.date === dateStr && 
          b.classroomId === formData.classroomId &&
          formData.startTime < b.endTime && 
          formData.endTime > b.startTime
        );

        if (isOverlapping) {
          overlapError = `Attenzione: l'aula è già occupata il giorno ${format(validDates[i], "dd/MM/yyyy")} in questo orario. Modifica il periodo o l'aula.`;
          break; // Ferma il ciclo al primo errore trovato
        }

        newBookings.push({
          id: Date.now().toString() + "-" + i, // Genera ID univoco anche se cicla velocemente
          userId: userId,
          date: dateStr,
          ...formData
        });
      }

      if (overlapError) {
        setFormError(overlapError);
        return;
      }

      // Se non ci sono errori, salva TUTTE le prenotazioni generate
      setBookings([...bookings, ...newBookings]);
      onClose();

    } catch (error) {
      setFormError("Si è verificato un errore nel calcolo delle date. Controlla i formati.");
    }
  };

  if (userRole === "Visual") {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
        <Eye size={40} className="mx-auto text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-700">Modalità Sola Lettura</h3>
        <p className="text-slate-500 mt-1 max-w-sm mx-auto">Il tuo account ha i permessi di sola visualizzazione. Contatta il Direttore per effettuare prenotazioni.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <ShieldAlert size={16} className="shrink-0" /> 
          <span>{formError}</span>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Corso / Attività</label>
        <input required type="text" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="Es. Matematica 3A" value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Seleziona Aula</label>
        <select required className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" value={formData.classroomId} onChange={e => setFormData({...formData, classroomId: e.target.value})}>
          <option value="">Scegli un'aula disponibile...</option>
          {rooms.map(r => (
            <option key={r.id} value={r.id}>{r.name} (Max {r.capacity} posti)</option>
          ))}
        </select>
        
        {/* INFO DOTAZIONI AULA SELEZIONATA */}
        {selectedRoomDetails && (
          <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                <Tv size={12} className="text-indigo-600" /> Dotazioni incluse nell'aula:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedRoomDetails.equipment.lim && <span className="inline-flex items-center gap-1 bg-white text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold border border-indigo-200 shadow-sm"><Tv size={12}/> LIM</span>}
                {selectedRoomDetails.equipment.projector && <span className="inline-flex items-center gap-1 bg-white text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold border border-indigo-200 shadow-sm"><Monitor size={12}/> Proiettore</span>}
                {selectedRoomDetails.equipment.wifi && <span className="inline-flex items-center gap-1 bg-white text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold border border-indigo-200 shadow-sm"><Wifi size={12}/> WiFi</span>}
                {selectedRoomDetails.equipment.wired && <span className="inline-flex items-center gap-1 bg-white text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold border border-indigo-200 shadow-sm"><Network size={12}/> LAN Cablata</span>}
                {selectedRoomDetails.equipment.whiteboard && <span className="inline-flex items-center gap-1 bg-white text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold border border-indigo-200 shadow-sm"><PenTool size={12}/> Lavagna</span>}
                {selectedRoomDetails.equipment.pc && <span className="inline-flex items-center gap-1 bg-white text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold border border-indigo-200 shadow-sm"><Monitor size={12}/> {selectedRoomDetails.equipment.pcCount} PC</span>}
                {!Object.values(selectedRoomDetails.equipment).some(val => val === true || val > 0) && <span className="text-indigo-500 italic text-xs font-medium">Nessuna dotazione tecnica registrata.</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Ora Inizio</label>
          <input required type="time" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Ora Fine</label>
          <input required type="time" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
        </div>
      </div>

      {/* BLOCCO PERIODO E ESCLUSIONI */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
          <CalendarDays size={16} className="text-indigo-600"/> Periodo di Prenotazione
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dal Giorno</label>
            <input required type="date" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Al Giorno</label>
            <input required type="date" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
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

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Richieste Speciali o Note</label>
        <textarea rows={2} className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm resize-none" placeholder="Es. Serve l'aria condizionata accesa prima." value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} />
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annulla</button>
        <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-md transition-colors flex items-center gap-2">
          Conferma Prenotazione
        </button>
      </div>
    </form>
  );
}

function UsersManagerView({ users, setUsers, currentUser, setCurrentUser }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const defaultForm = { name: '', username: '', password: '', role: 'Visual' };
  const [formData, setFormData] = useState(defaultForm);

  const openNewUser = () => {
    setEditingUser(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = (userId) => {
    if(userId === currentUser.id) return; // Impedisce di cancellare se stessi
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      const updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
      setUsers(updatedUsers);
      
      // Se il Master modifica il proprio account, aggiorniamo la sessione attiva
      if (editingUser.id === currentUser.id) {
        setCurrentUser(updatedUsers.find(u => u.id === currentUser.id));
      }
    } else {
      const newUser = {
        id: Date.now().toString(),
        ...formData
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-lg text-slate-900">Gestione Accessi e Utenti</h3>
          <p className="text-sm text-slate-500">Crea credenziali, assegna i ruoli e modifica le password.</p>
        </div>
        <button onClick={openNewUser} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
          <Plus size={16} /> Nuovo Utente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Nome e Cognome</th>
              <th className="px-6 py-4">Credenziali (User/Pass)</th>
              <th className="px-6 py-4">Livello di Accesso</th>
              <th className="px-6 py-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-800 font-medium">{user.username}</span>
                    <span className="text-xs text-slate-400 font-mono inline-flex items-center gap-1">
                      <Key size={10} /> {user.password}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={classNames(
                    "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1",
                    user.role === 'Master' ? "bg-red-100 text-red-700" :
                    user.role === 'Editor' ? "bg-blue-100 text-blue-700" :
                    "bg-green-100 text-green-700"
                  )}>
                    {user.role === 'Master' && <ShieldAlert size={12} />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => openEditUser(user)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center gap-1">
                      <Edit2 size={14} /> Modifica
                    </button>
                    {user.id !== currentUser.id && (
                      <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 font-medium text-sm p-1 rounded hover:bg-red-50" title="Elimina utente">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Modifica Utente" : "Crea Nuovo Utente"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome e Cognome</label>
            <input required type="text" placeholder="Es. Mario Rossi" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Utente</label>
              <input required type="text" placeholder="Es. m.rossi" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input required type="text" placeholder="Crea una password" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-mono text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Assegna Ruolo (Poteri)</label>
            <select required className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Visual">Visual (Può solo guardare il calendario)</option>
              <option value="Editor">Editor (Può prenotare e modificare le SUE prenotazioni)</option>
              <option value="Master">Master (Amministratore Totale)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Annulla</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm">
              {editingUser ? "Salva Modifiche" : "Crea Utente"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function RoomsManagerView({ rooms, setRooms }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const defaultForm = {
    name: '', capacity: '', 
    equipment: { lim: false, projector: false, pc: false, wifi: false, wired: false, whiteboard: false, pcCount: 0 }
  };
  const [formData, setFormData] = useState(defaultForm);

  const openNewRoom = () => {
    setEditingRoom(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      equipment: { ...room.equipment }
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const roomData = {
      ...formData,
      capacity: parseInt(formData.capacity) || 0,
      equipment: {
        ...formData.equipment,
        pcCount: formData.equipment.pc ? parseInt(formData.equipment.pcCount) || 0 : 0
      }
    };

    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...roomData } : r));
    } else {
      setRooms([...rooms, { id: Date.now().toString(), ...roomData }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-lg text-slate-900">Gestione Parco Aule</h3>
          <p className="text-sm text-slate-500">Configura le aule disponibili e le loro dotazioni tecniche.</p>
        </div>
        <button onClick={openNewRoom} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
          <Plus size={16} /> Nuova Aula
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Nome Spazio</th>
              <th className="px-6 py-4">Capienza Max</th>
              <th className="px-6 py-4">Dotazioni Tecniche</th>
              <th className="px-6 py-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map(room => (
              <tr key={room.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-900">{room.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium border border-slate-200">
                    {room.capacity} posti
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {room.equipment.lim && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100 shadow-sm"><Tv size={12}/> LIM</span>}
                    {room.equipment.projector && <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium border border-amber-100 shadow-sm"><Monitor size={12}/> Proiettore</span>}
                    {room.equipment.wifi && <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-100 shadow-sm"><Wifi size={12}/> WiFi</span>}
                    {room.equipment.wired && <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium border border-emerald-100 shadow-sm"><Network size={12}/> LAN Cablata</span>}
                    {room.equipment.whiteboard && <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200 shadow-sm"><PenTool size={12}/> Lavagna</span>}
                    {room.equipment.pc && <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100 shadow-sm"><Monitor size={12}/> {room.equipment.pcCount} PC</span>}
                    {!Object.values(room.equipment).some(val => val === true || val > 0) && <span className="text-slate-400 italic text-xs">Nessuna dotazione</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEditRoom(room)} className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors inline-flex items-center gap-1">
                    <Edit2 size={14} /> Modifica
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? "Modifica Aula" : "Nuova Aula"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Spazio/Aula</label>
              <input required type="text" placeholder="Es. Laboratorio Lingue" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Capienza Max</label>
              <input required type="number" min="1" placeholder="Es. 25" className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <label className="block text-sm font-semibold text-slate-700 mb-3 border-b border-slate-100 pb-2">Seleziona Dotazioni Tecniche</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.equipment.lim} onChange={e => setFormData({...formData, equipment: {...formData.equipment, lim: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Tv size={16} className="text-slate-400"/> LIM</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.equipment.projector} onChange={e => setFormData({...formData, equipment: {...formData.equipment, projector: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Monitor size={16} className="text-slate-400"/> Videoproiettore</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.equipment.wifi} onChange={e => setFormData({...formData, equipment: {...formData.equipment, wifi: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Wifi size={16} className="text-slate-400"/> WiFi</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.equipment.wired} onChange={e => setFormData({...formData, equipment: {...formData.equipment, wired: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Network size={16} className="text-slate-400"/> LAN Cablata</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.equipment.whiteboard} onChange={e => setFormData({...formData, equipment: {...formData.equipment, whiteboard: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><PenTool size={16} className="text-slate-400"/> Lavagna Classica</span>
              </label>
            </div>

            {/* Gestione Specifica PC */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={formData.equipment.pc} onChange={e => setFormData({...formData, equipment: {...formData.equipment, pc: e.target.checked}})} />
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Monitor size={16} className="text-indigo-500"/> Computer in Aula</span>
              </label>
              
              {formData.equipment.pc && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-sm text-slate-500">Quanti?</span>
                  <input type="number" min="1" className="w-20 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500" value={formData.equipment.pcCount} onChange={e => setFormData({...formData, equipment: {...formData.equipment, pcCount: e.target.value}})} />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Annulla</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm">
              {editingRoom ? "Salva Modifiche" : "Crea Aula"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
