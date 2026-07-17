import React, { useState, useMemo, useEffect, useRef } from 'react';import {Calendar, Users, Settings, LogOut, School,ChevronLeft, ChevronRight, Filter, X, Plus,Lock, Eye, Edit2, ShieldAlert, DoorOpen, Tv, Wifi, Monitor, PenTool, Network, Key, Trash2, CalendarDays, Loader2} from 'lucide-react';import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO, isSameDay, isWeekend } from 'date-fns';import { it } from 'date-fns/locale';// --- CONFIGURAZIONE FIREBASE ---import { initializeApp } from "firebase/app";import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";const firebaseConfig = {apiKey: "AIzaSyATfvbQPv28e3NoYvKB0Rx55Oo3JGH205Y",authDomain: "cnoslogistics.firebaseapp.com",projectId: "cnoslogistics",storageBucket: "cnoslogistics.firebasestorage.app",messagingSenderId: "795777306106",appId: "1:795777306106:web:ee3f67948e9401e23ce843"};// Inizializza Firebaseconst app = initializeApp(firebaseConfig);const db = getFirestore(app);// -------------------------------function classNames(...classes) {return classes.filter(Boolean).join(' ');}function Modal({ isOpen, onClose, title, children }) {if (!isOpen) return null;return ({title}{children});}export default function App() {const [currentUser, setCurrentUser] = useState(null);const [currentView, setCurrentView] = useState('calendar'); // 'calendar', 'users', 'rooms'// Stati Collegati al Databaseconst [users, setUsers] = useState([]);const [bookings, setBookings] = useState([]);const [rooms, setRooms] = useState([]);const [isDbLoading, setIsDbLoading] = useState(true);const hasSeededAdmin = useRef(false);// --- SINCRONIZZAZIONE CON FIREBASE IN TEMPO REALE ---useEffect(() => {// Sincronizza Utenticonst unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));setUsers(usersData);  // Auto-creazione amministratore se il DB è vuoto
  if (snapshot.empty && !hasSeededAdmin.current) {
    hasSeededAdmin.current = true;
    addDoc(collection(db, 'users'), { 
      username: 'admin', password: 'password123', role: 'Master', name: 'Direttore' 
    });
  }
});

// Sincronizza Aule
const unsubRooms = onSnapshot(collection(db, 'rooms'), (snapshot) => {
  setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// Sincronizza Prenotazioni
const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
  setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  setIsDbLoading(false); // Quando le prenotazioni sono caricate, spegni il caricamento
});

// Pulizia
return () => {
  unsubUsers();
  unsubRooms();
  unsubBookings();
};
}, []);// --- STATI PER IL LOGIN ---const [loginUsername, setLoginUsername] = useState('');const [loginPassword, setLoginPassword] = useState('');const [loginError, setLoginError] = useState('');const handleLogin = (e) => {e.preventDefault();const user = users.find(u => u.username === loginUsername && u.password === loginPassword);if (user) {
  setCurrentUser(user);
  setLoginError('');
  setLoginUsername('');
  setLoginPassword('');
} else {
  setLoginError('Credenziali non valide. Riprova.');
}
};// --- SCHERMATA DI CARICAMENTO DATABASE ---if (isDbLoading) {return (Connessione al Server...Sincronizzazione dati da Firebase);}// --- SCHERMATA DI LOGIN ---if (!currentUser) {return (CnosLogisticsAccedi al pannello di gestione      <form onSubmit={handleLogin} className="space-y-5">
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
}// --- STRUTTURA PRINCIPALE APP ---return (CnosLogistics{currentUser.role === 'Master' && } Pannello {currentUser.role}    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
          <span className="text-xs text-slate-500">Connesso al Database</span>
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

    <div className="flex-1 px-8 pb-8 overflow-y-auto">
      <div className="h-full pt-8">
        {currentView === 'calendar' ? (
          <CalendarView currentUser={currentUser} users={users} bookings={bookings} rooms={rooms} />
        ) : currentView === 'rooms' ? (
          <RoomsManagerView rooms={rooms} />
        ) : (
          <UsersManagerView users={users} currentUser={currentUser} setCurrentUser={setCurrentUser} />
        )}
      </div>
    </div>
  </main>
</div>
);}function CalendarView({ currentUser, users, bookings, rooms }) {const [currentDate, setCurrentDate] = useState(new Date());const [selectedDate, setSelectedDate] = useState(null);const [isModalOpen, setIsModalOpen] = useState(false);const [filterRoom, setFilterRoom] = useState('all');const [activeTab, setActiveTab] = useState('new');const monthStart = startOfMonth(currentDate);const monthEnd = endOfMonth(currentDate);const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));const handleDayClick = (day) => {setSelectedDate(day);setActiveTab('new');setIsModalOpen(true);};const handleViewBookings = (day, e) => {e.stopPropagation();setSelectedDate(day);setActiveTab('list');setIsModalOpen(true);};const handleDeleteBooking = async (bookingId) => {if(window.confirm("Sei sicuro di voler eliminare questa prenotazione?")) {await deleteDoc(doc(db, 'bookings', bookingId));}};return ({format(currentDate, "MMMM yyyy", { locale: it })}    <div className="flex items-center gap-3 w-full sm:w-auto">
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
                  >
                    <span className="truncate">{booking.startTime} - {room?.name || 'Aula rimossa'}</span>
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
        <div className="flex border-b border-slate-200 mb-4">
          <button onClick={() => setActiveTab('new')} className={classNames("px-4 py-2 text-sm font-bold border-b-2 transition-colors", activeTab === 'new' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
            Nuova Prenotazione
          </button>
          <button onClick={() => setActiveTab('list')} className={classNames("px-4 py-2 text-sm font-bold border-b-2 transition-colors", activeTab === 'list' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
            Vedi Prenotazioni ({bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd")).length})
          </button>
        </div>

        {activeTab === 'new' ? (
          <BookingForm 
            selectedDate={selectedDate} onClose={() => setIsModalOpen(false)} 
            userRole={currentUser.role} userId={currentUser.id}
            bookings={bookings} rooms={rooms}
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
);}function BookingForm({ selectedDate, onClose, userRole, userId, bookings, rooms }) {const [formData, setFormData] = useState({courseName: '', classroomId: '', startTime: '', endTime: '', specialRequests: ''});const [startDate, setStartDate] = useState(format(selectedDate, "yyyy-MM-dd"));const [endDate, setEndDate] = useState(format(selectedDate, "yyyy-MM-dd"));const [excludeWeekends, setExcludeWeekends] = useState(false);const [excludeSpecific, setExcludeSpecific] = useState(false);const [excludedDates, setExcludedDates] = useState([]);const [tempExcludeDate, setTempExcludeDate] = useState('');const [formError, setFormError] = useState('');const [isSubmitting, setIsSubmitting] = useState(false);const selectedRoomDetails = rooms.find(r => r.id === formData.classroomId);const handleSubmit = async (e) => {e.preventDefault();setFormError('');setIsSubmitting(true);if (formData.endTime <= formData.startTime) {
  setFormError("L'ora di fine deve essere successiva all'ora di inizio.");
  setIsSubmitting(false); return;
}
if (endDate < startDate) {
  setFormError("La data di fine non può essere precedente alla data di inizio.");
  setIsSubmitting(false); return;
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
    setFormError("Nessuna data valida selezionata per la prenotazione.");
    setIsSubmitting(false); return;
  }

  let overlapError = null;
  const newBookings = [];

  for (let i = 0; i < validDates.length; i++) {
    const dateStr = format(validDates[i], "yyyy-MM-dd");
    const isOverlapping = bookings.some(b => 
      b.date === dateStr && b.classroomId === formData.classroomId &&
      formData.startTime < b.endTime && formData.endTime > b.startTime
    );

    if (isOverlapping) {
      overlapError = `Attenzione: l'aula è già occupata il ${format(validDates[i], "dd/MM/yyyy")} in questo orario.`;
      break;
    }

    newBookings.push({ userId: userId, date: dateStr, ...formData });
  }

  if (overlapError) {
    setFormError(overlapError);
    setIsSubmitting(false); return;
  }

  // Salvataggio nel Database
  for (const booking of newBookings) {
    await addDoc(collection(db, 'bookings'), booking);
  }
  onClose();

} catch (error) {
  setFormError("Si è verificato un errore durante il salvataggio.");
  setIsSubmitting(false);
}
};if (userRole === "Visual") {return (Modalità Sola LetturaIl tuo account ha i permessi di sola visualizzazione.);}return ({formError && ( {formError})}  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Corso</label>
    <input required type="text" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 outline-none" value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} />
  </div>
  
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">Seleziona Aula</label>
    <select required className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 outline-none" value={formData.classroomId} onChange={e => setFormData({...formData, classroomId: e.target.value})}>
      <option value="">Scegli un'aula disponibile...</option>
      {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Max {r.capacity} posti)</option>)}
    </select>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Ora Inizio</label>
      <input required type="time" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
    </div>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Ora Fine</label>
      <input required type="time" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
    </div>
  </div>

  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
      <CalendarDays size={16} className="text-indigo-600"/> Periodo
    </h4>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase">Dal Giorno</label>
        <input required type="date" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase">Al Giorno</label>
        <input required type="date" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
    </div>
  </div>

  <div className="pt-4 flex justify-end gap-3 mt-6">
    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Annulla</button>
    <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-md disabled:opacity-50">
      {isSubmitting ? "Salvataggio..." : "Conferma Prenotazione"}
    </button>
  </div>
</form>
);}function UsersManagerView({ users, currentUser, setCurrentUser }) {const [isModalOpen, setIsModalOpen] = useState(false);const [editingUser, setEditingUser] = useState(null);const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'Visual' });const openNewUser = () => { setEditingUser(null); setFormData({ name: '', username: '', password: '', role: 'Visual' }); setIsModalOpen(true); };const openEditUser = (user) => { setEditingUser(user); setFormData({ name: user.name, username: user.username, password: user.password, role: user.role }); setIsModalOpen(true); };const handleDelete = async (userId) => {if(userId === currentUser.id) return;if(window.confirm("Sicuro di eliminare questo utente?")) {await deleteDoc(doc(db, 'users', userId));}};const handleSubmit = async (e) => {e.preventDefault();if (editingUser) {await updateDoc(doc(db, 'users', editingUser.id), formData);if (editingUser.id === currentUser.id) setCurrentUser({id: currentUser.id, ...formData});} else {await addDoc(collection(db, 'users'), formData);}setIsModalOpen(false);};return (Gestione Utenti Nuovo UtenteNomeUsername/PassRuoloAzioni{users.map(user => ({user.name}{user.username}  {user.password}{user.role}<button onClick={() => openEditUser(user)} className="text-indigo-600 font-medium text-sm">{user.id !== currentUser.id && <button onClick={() => handleDelete(user.id)} className="text-red-500 font-medium text-sm">}))}  <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Modifica" : "Nuovo Utente"}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <input required type="text" placeholder="Nome completo" className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <input required type="text" placeholder="Username" className="w-full border p-2 rounded-lg" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
      <input required type="text" placeholder="Password" className="w-full border p-2 rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
      <select className="w-full border p-2 rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
        <option value="Visual">Visual</option><option value="Editor">Editor</option><option value="Master">Master</option>
      </select>
      <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-lg mt-4">Salva</button>
    </form>
  </Modal>
</div>
);}function RoomsManagerView({ rooms }) {const [isModalOpen, setIsModalOpen] = useState(false);const [editingRoom, setEditingRoom] = useState(null);const [formData, setFormData] = useState({ name: '', capacity: '', equipment: { lim: false, projector: false, wifi: false } });const openNewRoom = () => { setEditingRoom(null); setFormData({ name: '', capacity: '', equipment: { lim: false, projector: false, wifi: false } }); setIsModalOpen(true); };const openEditRoom = (room) => { setEditingRoom(room); setFormData({ name: room.name, capacity: room.capacity.toString(), equipment: { ...room.equipment } }); setIsModalOpen(true); };const handleSubmit = async (e) => {e.preventDefault();const roomData = { ...formData, capacity: parseInt(formData.capacity) || 0 };if (editingRoom) {await updateDoc(doc(db, 'rooms', editingRoom.id), roomData);} else {await addDoc(collection(db, 'rooms'), roomData);}setIsModalOpen(false);};const handleDeleteRoom = async (roomId) => {if(window.confirm("Sicuro di voler eliminare questa aula? ATTENZIONE: le prenotazioni collegate potrebbero non essere visualizzate correttamente.")) {await deleteDoc(doc(db, 'rooms', roomId));}};return (Gestione Aule Nuova AulaNomeCapienzaAzioni{rooms.map(room => ({room.name}{room.capacity} posti<button onClick={() => openEditRoom(room)} className="text-indigo-600 font-medium text-sm"><button onClick={() => handleDeleteRoom(room.id)} className="text-red-500 font-medium text-sm">))}  <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? "Modifica Aula" : "Nuova Aula"}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <input required type="text" placeholder="Nome Aula" className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <input required type="number" placeholder="Capienza" className="w-full border p-2 rounded-lg" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
      <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-lg mt-4">Salva</button>
    </form>
  </Modal>
</div>
);}
