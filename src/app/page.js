'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  Droplets, 
  Moon, 
  CheckCircle2, 
  AlertTriangle, 
  Flame,
  Plus,
  Clock,
  Timer as TimerIcon,
  Play
} from 'lucide-react';

/**
 * STRICT CONFIGURATION
 */
const TARGET_CALORIES = 2700;
const TARGET_PROTEIN = 100;
const TARGET_WATER = 4; // Liters

const MEAL_PLAN = [
  { id: 'm1', name: 'Morning Fuel', time: '07:30', foods: 'Milk (250ml), Banana, Peanuts/Almonds', cals: 250, protein: 12, completed: false },
  { id: 'm2', name: 'Breakfast', time: '09:30', foods: '3 Eggs, 2 Bread + Peanut Butter, Banana', cals: 550, protein: 25, completed: false },
  { id: 'm3', name: 'Massive Lunch', time: '13:30', foods: '3 Roti, Rice, Dal, 80g Soya Chunks', cals: 800, protein: 35, completed: false },
  { id: 'm4', name: 'Evening Power', time: '17:00', foods: 'Roasted Chana + Peanuts, Banana Shake', cals: 500, protein: 15, completed: false },
  { id: 'm5', name: 'Solid Dinner', time: '20:30', foods: '3 Roti, Sabzi, 50g Soya or 2 Eggs', cals: 600, protein: 15, completed: false },
  { id: 'm6', name: 'Bedtime', time: '22:30', foods: 'Milk (250ml)', cals: 150, protein: 8, completed: false },
];

const WORKOUT_SPLIT = [
  { 
    day: 'Day 1: Chest + Triceps', 
    exercises: [
      { name: 'Push-ups', sets: 3, reps: '10-20' },
      { name: 'Incline Push-ups', sets: 3, reps: '12' },
      { name: 'Chair Dips', sets: 3, reps: '12' },
      { name: 'Diamond Push-ups', sets: 3, reps: '8-10' },
    ]
  },
  { 
    day: 'Day 2: Back + Biceps', 
    exercises: [
      { name: 'Pull-ups / Rows', sets: 3, reps: '8-10' },
      { name: 'Inverted Rows', sets: 3, reps: '12' },
      { name: 'Backpack Curls', sets: 3, reps: '12-15' },
      { name: 'Chin-ups', sets: 2, reps: 'To failure' },
    ]
  },
  { day: 'Day 3: Rest', exercises: [] },
  { 
    day: 'Day 4: Legs + Core', 
    exercises: [
      { name: 'Squats', sets: 4, reps: '15' },
      { name: 'Lunges', sets: 3, reps: '12/leg' },
      { name: 'Calf Raises', sets: 3, reps: '20' },
      { name: 'Plank', sets: 3, reps: '60s' },
    ]
  },
  { 
    day: 'Day 5: Full Body', 
    exercises: [
      { name: 'Push-ups', sets: 3, reps: '15' },
      { name: 'Squats', sets: 3, reps: '15' },
      { name: 'Pull-ups / Rows', sets: 3, reps: '10' },
      { name: 'Plank', sets: 2, reps: '60s' },
    ]
  },
  { day: 'Day 6: Rest', exercises: [] },
  { day: 'Day 7: Optional / Active', exercises: [] },
];

/**
 * REUSABLE COMPONENTS
 */

const Card = ({ children, className = "" }) => (
  <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ value, max, color = "bg-lime-400" }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-700 ease-out`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userState, setUserState] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [timer, setTimer] = useState(0);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('iron_will_v2');
    const today = new Date().toLocaleDateString();
    
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lastDate !== today) {
        // Reset daily but check streak
        const perfectDay = (parsed.dailyScore || 0) >= 100;
        setUserState({
          ...parsed,
          lastDate: today,
          dailyMeals: MEAL_PLAN,
          dailyWorkoutDone: false,
          dailyWater: 0,
          streak: perfectDay ? (parsed.streak + 1) : 0,
        });
      } else {
        setUserState(parsed);
      }
    } else {
      setUserState({
        lastDate: today,
        streak: 0,
        dailyMeals: MEAL_PLAN,
        dailyWorkoutDone: false,
        dailyWater: 0,
        weight: 65,
        history: []
      });
    }
  }, []);

  // Save persistence
  useEffect(() => {
    if (userState) {
      localStorage.setItem('iron_will_v2', JSON.stringify(userState));
    }
  }, [userState]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!userState) return null;

  // Stats
  const currentCals = userState.dailyMeals.reduce((acc, m) => acc + (m.completed ? m.cals : 0), 0);
  const currentProtein = userState.dailyMeals.reduce((acc, m) => acc + (m.completed ? m.protein : 0), 0);
  const currentDayIndex = new Date().getDay();
  // Adjust JS getDay (0 Sun) to our split (0 Mon)
  const adjustedIdx = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  const todayWorkout = WORKOUT_SPLIT[adjustedIdx];

  const dailyScore = Math.round(
    ((currentCals / TARGET_CALORIES) * 40) + 
    ((currentProtein / TARGET_PROTEIN) * 20) + 
    (userState.dailyWorkoutDone ? 30 : 0) + 
    ((userState.dailyWater / TARGET_WATER) * 10)
  );

  const toggleMeal = (id) => {
    setUserState(prev => ({
      ...prev,
      dailyMeals: prev.dailyMeals.map(m => m.id === id ? { ...m, completed: !m.completed } : m)
    }));
  };

  const addWater = (amt) => {
    setUserState(prev => ({ ...prev, dailyWater: Math.min(prev.dailyWater + amt, 6) }));
  };

  const completeWorkout = () => {
    setUserState(prev => ({ ...prev, dailyWorkoutDone: true }));
    setFocusMode(false);
  };

  const startTimer = (secs) => setTimer(secs);

  /**
   * DASHBOARD
   */
  const Dashboard = () => (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">IRON WILL</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{new Date().toDateString()}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center text-lime-400 font-black text-3xl gap-1">
            <Flame fill="currentColor" size={24} />
            {userState.streak}
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase">Streak</p>
        </div>
      </div>

      <Card className="border-lime-400/20 bg-gradient-to-br from-zinc-900 to-black">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Execution Score</p>
            <h2 className="text-6xl font-black">{dailyScore}%</h2>
          </div>
          <div className="text-right">
             <p className={`text-xs font-bold uppercase ${dailyScore >= 100 ? 'text-lime-400' : 'text-red-500 animate-pulse'}`}>
                {dailyScore >= 100 ? 'Optimal' : 'Insufficient'}
             </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <ProgressBar value={dailyScore} max={100} />
          <p className="text-xs text-zinc-400 italic">
            {dailyScore < 50 ? "You're failing. Pick up the pace." : "Keep the intensity high."}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex justify-between mb-2">
            <Utensils size={16} className="text-orange-500" />
            <span className="text-[10px] font-black text-zinc-500">KCAL</span>
          </div>
          <div className="text-2xl font-black">{currentCals}</div>
          <ProgressBar value={currentCals} max={TARGET_CALORIES} color="bg-orange-500" />
          <p className="text-[10px] text-zinc-500 font-bold mt-1">REMAINING: {TARGET_CALORIES - currentCals}</p>
        </Card>
        
        <Card>
          <div className="flex justify-between mb-2">
            <TrendingUp size={16} className="text-blue-500" />
            <span className="text-[10px] font-black text-zinc-500">PROTEIN</span>
          </div>
          <div className="text-2xl font-black">{currentProtein}g</div>
          <ProgressBar value={currentProtein} max={TARGET_PROTEIN} color="bg-blue-500" />
          <p className="text-[10px] text-zinc-500 font-bold mt-1">TARGET: {TARGET_PROTEIN}g</p>
        </Card>

        <Card className="col-span-2 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Droplets size={16} className="text-cyan-400" />
              <span className="text-[10px] font-black text-zinc-500 uppercase">Hydration</span>
            </div>
            <div className="text-2xl font-black">{userState.dailyWater}L / {TARGET_WATER}L</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => addWater(0.25)} className="bg-zinc-800 p-3 rounded-lg font-black text-xs active:scale-90 transition-transform">+250ml</button>
            <button onClick={() => addWater(0.5)} className="bg-zinc-800 p-3 rounded-lg font-black text-xs active:scale-90 transition-transform">+500ml</button>
          </div>
        </Card>
      </div>

      {dailyScore < 40 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex gap-3 items-center animate-bounce">
          <AlertTriangle className="text-red-500 shrink-0" />
          <p className="text-xs font-bold text-red-200 uppercase tracking-tight">Warning: You are falling behind. Zero missed tasks allowed.</p>
        </div>
      )}
    </div>
  );

  /**
   * MEAL TRACKER
   */
  const DietView = () => (
    <div className="space-y-6 pb-24">
      <h1 className="text-3xl font-black tracking-tighter italic">MEAL TRACKER</h1>
      <div className="space-y-4">
        {userState.dailyMeals.map((meal) => (
          <div 
            key={meal.id} 
            onClick={() => toggleMeal(meal.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              meal.completed ? 'bg-zinc-900/50 border-lime-400/50' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  meal.completed ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {meal.completed ? <CheckCircle2 size={24} /> : <Clock size={20} />}
                </div>
                <div>
                  <h3 className={`font-black ${meal.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>{meal.name}</h3>
                  <p className="text-[10px] font-black text-lime-400 uppercase tracking-widest">{meal.time}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-white">{meal.cals} kcal</div>
                <div className="text-[10px] font-bold text-zinc-500">{meal.protein}g P</div>
              </div>
            </div>
            <p className="text-xs text-zinc-500 ml-13 border-l-2 border-zinc-800 pl-4 py-1">{meal.foods}</p>
          </div>
        ))}
      </div>
    </div>
  );

  /**
   * WORKOUT TRACKER
   */
  const WorkoutView = () => (
    <div className="space-y-6 pb-24">
      <h1 className="text-3xl font-black tracking-tighter italic">WORKOUT</h1>
      <Card className="border-lime-400/30">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-black text-lime-400">{todayWorkout.day}</h2>
            <p className="text-xs text-zinc-500">Approx. 30 mins • Focus on form</p>
          </div>
          {userState.dailyWorkoutDone && (
            <div className="bg-lime-400/10 text-lime-400 px-2 py-1 rounded text-[10px] font-black uppercase">Complete</div>
          )}
        </div>

        {todayWorkout.exercises.length > 0 ? (
          <div className="space-y-3">
            {todayWorkout.exercises.map((ex, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-xl">
                <div>
                  <p className="font-bold text-sm">{ex.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-black">{ex.sets} Sets × {ex.reps} Reps</p>
                </div>
                <div className="text-[10px] font-black text-zinc-700 italic uppercase">Progression: W2+ Add Wt</div>
              </div>
            ))}
            <button 
              disabled={userState.dailyWorkoutDone}
              onClick={() => setFocusMode(true)}
              className={`w-full py-4 rounded-xl font-black text-xl transition-all mt-4 ${
                userState.dailyWorkoutDone ? 'bg-zinc-800 text-zinc-600' : 'bg-lime-400 text-black active:scale-95'
              }`}
            >
              {userState.dailyWorkoutDone ? 'SESSION DONE' : 'START FOCUS MODE'}
            </button>
          </div>
        ) : (
          <div className="text-center py-10 opacity-50">
            <Moon className="mx-auto mb-2" />
            <p className="font-black uppercase tracking-tighter">REST DAY</p>
            <p className="text-xs">Eat to recover. Sleep 8+ hours.</p>
          </div>
        )}
      </Card>

      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-3">Progression Rules</h3>
        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase text-center">
           <div className="bg-zinc-800 p-2 rounded">W1: 10 Reps</div>
           <div className="bg-zinc-800 p-2 rounded">W2: 12-15 Reps</div>
           <div className="bg-zinc-800 p-2 rounded text-lime-400">W3: Add Wt</div>
        </div>
      </div>
    </div>
  );

  /**
   * FOCUS MODE
   */
  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white p-6 flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
           <span className="text-lime-400 font-black tracking-tighter text-2xl italic">FOCUS MODE</span>
           <button onClick={() => setFocusMode(false)} className="bg-zinc-900 px-4 py-2 rounded-full text-xs font-black uppercase">Quit</button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4">
           {todayWorkout.exercises.map((ex, i) => (
             <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex justify-between items-center">
               <div>
                 <p className="text-2xl font-black leading-none mb-2">{ex.name}</p>
                 <div className="flex gap-4">
                    <span className="text-lime-400 font-black text-sm uppercase">{ex.sets} Sets</span>
                    <span className="text-zinc-500 font-black text-sm uppercase">{ex.reps} Reps</span>
                 </div>
               </div>
               <input type="checkbox" className="w-8 h-8 rounded-full accent-lime-400 border-zinc-700 bg-transparent cursor-pointer" />
             </div>
           ))}
        </div>

        <div className="py-6 flex flex-col gap-4">
           {timer > 0 ? (
             <div className="text-center">
                <div className="text-6xl font-black tabular-nums text-lime-400 mb-2">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Rest Timer Active</p>
             </div>
           ) : (
             <div className="grid grid-cols-3 gap-2">
                <button onClick={() => startTimer(30)} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl font-black text-xs">REST 30s</button>
                <button onClick={() => startTimer(60)} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl font-black text-xs">REST 60s</button>
                <button onClick={() => startTimer(90)} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl font-black text-xs">REST 90s</button>
             </div>
           )}

           <button 
             onClick={completeWorkout}
             className="w-full bg-white text-black font-black py-6 rounded-3xl text-2xl active:scale-95 transition-transform"
           >
             FINISH SESSION
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-lime-400 selection:text-black">
      <main className="max-w-md mx-auto p-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'diet' && <DietView />}
        {activeTab === 'workout' && <WorkoutView />}
        {activeTab === 'progress' && (
           <div className="space-y-6 pb-24">
             <h1 className="text-3xl font-black tracking-tighter italic">PROGRESS</h1>
             <Card>
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Weight Consistency (Weekly)</p>
               <div className="flex gap-2 items-end h-32 px-2">
                  {[30, 45, 60, 55, 80, 90, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-zinc-800 rounded-t-lg relative">
                      <div className="absolute bottom-0 w-full bg-lime-400 rounded-t-lg" style={{ height: `${h}%` }} />
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-3 text-[8px] font-black text-zinc-600 uppercase">
                 <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
               </div>
             </Card>
             <Card className="flex justify-between items-center p-6 bg-gradient-to-r from-zinc-900 to-zinc-800">
                <div>
                   <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Body Mass</p>
                   <p className="text-4xl font-black tracking-tighter">72.4 <span className="text-sm text-zinc-500">KG</span></p>
                </div>
                <button className="bg-lime-400 text-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-lime-400/20 active:scale-90 transition-transform">
                  <Plus size={28} />
                </button>
             </Card>
           </div>
        )}
      </main>

      {/* FIXED NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-800 px-4 py-4 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
            { id: 'diet', icon: Utensils, label: 'Diet' },
            { id: 'workout', icon: Dumbbell, label: 'Gym' },
            { id: 'progress', icon: TrendingUp, label: 'Data' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-lime-400 scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: black;
          overflow-x: hidden;
        }
        .ml-13 { margin-left: 3.25rem; }
      `}</style>
    </div>
  );
}