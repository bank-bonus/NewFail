import React, { useState, useEffect, useCallback, useMemo } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { CARTOONS, TRANSLATIONS } from './data';
import { Cartoon, GameState, Language, PlayerStats } from './types';
import { Play, Home, RefreshCw, ShoppingCart, Heart, Star, Settings, Pause, X, RotateCcw, Clapperboard, Award, Shield, Zap, Tv, Film } from 'lucide-react';

// --- Constants ---

const SHOP_ITEMS = [
    { id: 'shield', icon: Shield, price: 10, name: { ru: 'Защита', en: 'Shield', tr: 'Kalkan' }, desc: { ru: '+1 жизнь в игре', en: '+1 life in game', tr: '+1 can' } },
    { id: 'boost', icon: Zap, price: 25, name: { ru: 'Буст', en: 'Boost', tr: 'Takviye' }, desc: { ru: 'x2 звезды за уровень', en: 'x2 stars per level', tr: 'Seviye başı x2 yıldız' } },
    { id: 'master', icon: Award, price: 50, name: { ru: 'Знаток', en: 'Master', tr: 'Usta' }, desc: { ru: 'Золотая рамка ТВ', en: 'Gold TV Frame', tr: 'Altın TV Çerçevesi' } }
];

// --- Components ---

const Button: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger';
    className?: string;
    disabled?: boolean;
    fullWidth?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
    const baseStyle = "relative font-oswald uppercase tracking-widest font-bold py-2.5 px-4 border-2 border-black transition-all transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 z-10 hover:scale-[1.02]";
    
    const shadowStyle = disabled ? "shadow-none" : "shadow-hard hover:shadow-hard-lg";

    const variants = {
        primary: "bg-soviet-red text-soviet-cream",
        secondary: "bg-soviet-cream text-soviet-dark",
        accent: "bg-soviet-green text-white",
        danger: "bg-gray-800 text-gray-300"
    };

    return (
        <button 
            onClick={disabled ? undefined : onClick}
            className={`${baseStyle} ${variants[variant]} ${shadowStyle} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-300 border-gray-400 grayscale' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

const TVFrame: React.FC<{ imageUrl: string; label: string }> = ({ imageUrl, label }) => (
    <div className="relative w-full max-w-[90vw] sm:max-w-md mx-auto z-10 animate-slide-up">
        {/* Antenna */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 pointer-events-none opacity-40">
            <div className="absolute bottom-0 left-4 w-0.5 h-10 bg-gray-600 rotate-[-25deg] origin-bottom"></div>
            <div className="absolute bottom-0 right-4 w-0.5 h-10 bg-gray-600 rotate-[25deg] origin-bottom"></div>
        </div>

        {/* TV Body */}
        <div className="wood-pattern p-3 sm:p-4 rounded-xl border-4 border-[#2a110a] shadow-hard-lg relative">
            <div className="flex gap-2 sm:gap-4 items-stretch">
                {/* Screen Area */}
                <div className="flex-1 aspect-[4/3] bg-black rounded-lg border-2 border-black relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                    <img src={imageUrl} alt="Quiz" className="w-full h-full object-cover relative z-10 sepia-[0.1] contrast-110" />
                    <div className="absolute inset-0 z-20 pointer-events-none scanlines opacity-30"></div>
                </div>

                {/* Control Panel Area */}
                <div className="flex flex-col gap-1.5 w-8 sm:w-12 items-center justify-start bg-[#1a110a] rounded p-1 border border-black/30">
                     <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#444] border border-black shadow-hard-sm"></div>
                     <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#444] border border-black shadow-hard-sm"></div>
                     <div className="w-full flex-1 flex flex-col gap-1 mt-1 px-0.5 opacity-60">
                        {[...Array(6)].map((_,i) => <div key={i} className="w-full h-0.5 bg-black/80 rounded-full"></div>)}
                     </div>
                </div>
            </div>

            {/* Brand Label */}
            <div className="absolute bottom-[-8px] left-6 bg-soviet-dark text-soviet-gold text-[8px] font-bold px-1.5 py-0.5 border border-soviet-gold tracking-tighter shadow-sm uppercase">
                {label}
            </div>
        </div>
    </div>
);

// --- Main App ---

export default function App() {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [lang, setLang] = useState<Language>('ru');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [maxLives, setMaxLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [stars, setStars] = useState(0);
    const [isWrong, setIsWrong] = useState(false);
    
    const [stats, setStats] = useState<PlayerStats>({ highScore: 0, totalStars: 0 });

    const [currentQuestion, setCurrentQuestion] = useState<Cartoon | null>(null);
    const [options, setOptions] = useState<Cartoon[]>([]);
    const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
    
    const [lastResult, setLastResult] = useState<{correct: boolean, correctItem: Cartoon} | null>(null);
    const [answeredCount, setAnsweredCount] = useState(0);

    const T = TRANSLATIONS[lang];

    // Initialize VK & Load Data
    useEffect(() => {
        const initVK = async () => {
            try {
                await vkBridge.send('VKWebAppInit');
                const userLang = navigator.language.split('-')[0];
                if (['en', 'tr'].includes(userLang)) setLang(userLang as Language);

                const storage = await vkBridge.send('VKWebAppStorageGet', { keys: ['highScore', 'totalStars'] });
                const loadedStats = { highScore: 0, totalStars: 0 };
                storage.keys.forEach(k => {
                    if (k.key === 'highScore') loadedStats.highScore = parseInt(k.value) || 0;
                    if (k.key === 'totalStars') loadedStats.totalStars = parseInt(k.value) || 0;
                });
                setStats(loadedStats);
            } catch (e) {
                console.error("VK Init Error", e);
                const localScore = localStorage.getItem('sovietQuizHighScore');
                const localStars = localStorage.getItem('sovietQuizStars');
                setStats({
                    highScore: localScore ? parseInt(localScore) : 0,
                    totalStars: localStars ? parseInt(localStars) : 0
                });
            }
        };
        initVK();
    }, []);

    const updateStorage = (newHighScore: number, newStars: number) => {
        try {
            vkBridge.send('VKWebAppStorageSet', { key: 'highScore', value: newHighScore.toString() });
            vkBridge.send('VKWebAppStorageSet', { key: 'totalStars', value: newStars.toString() });
        } catch(e) { console.error(e); }
        localStorage.setItem('sovietQuizHighScore', newHighScore.toString());
        localStorage.setItem('sovietQuizStars', newStars.toString());
    };

    const saveStats = (newScore: number, earnedStars: number) => {
        const newStats = {
            highScore: Math.max(stats.highScore, newScore),
            totalStars: stats.totalStars + earnedStars
        };
        setStats(newStats);
        updateStorage(newStats.highScore, newStats.totalStars);
    };

    const handleEarnStarsAd = async () => {
        try {
            const data = await vkBridge.send("VKWebAppShowRewardedVideo");
            if (data.result) {
                const newTotal = stats.totalStars + 5;
                setStats(prev => ({ ...prev, totalStars: newTotal }));
                updateStorage(stats.highScore, newTotal);
            }
        } catch (e) {
            console.error("Ad error", e);
        }
    };

    const startGame = () => {
        setScore(0);
        setLives(3);
        setMaxLives(3);
        setLevel(1);
        setStars(0);
        setAnsweredCount(0);
        const initialUsed = new Set<string>();
        setUsedQuestionIds(initialUsed);
        setGameState('playing');
        nextQuestion(initialUsed);
    };

    const nextQuestion = (used: Set<string>) => {
        let available = CARTOONS.filter(c => !used.has(c.id));
        if (available.length === 0) {
            used.clear();
            available = CARTOONS;
        }
        const next = available[Math.floor(Math.random() * available.length)];
        const nextUsed = new Set(used);
        nextUsed.add(next.id);
        setUsedQuestionIds(nextUsed);

        setCurrentQuestion(next);
        const others = CARTOONS.filter(c => c.id !== next.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        const roundOptions = [next, ...others].sort(() => 0.5 - Math.random());
        setOptions(roundOptions);
    };

    const handleAnswer = (selected: Cartoon) => {
        if (!currentQuestion) return;
        const isCorrect = selected.id === currentQuestion.id;
        if (!isCorrect) {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 500);
            setLives(l => l - 1);
        } else {
            setScore(s => s + 100);
            const newAnswered = answeredCount + 1;
            setAnsweredCount(newAnswered);
            if (newAnswered % 3 === 0) {
                const newLevel = Math.floor(newAnswered / 3) + 1;
                setLevel(newLevel);
                setStars(s => s + 1);
                if (newLevel === 2) setMaxLives(2);
                if (newLevel >= 3) setMaxLives(1);
                setLives(l => Math.min(l, (newLevel === 2 ? 2 : (newLevel >= 3 ? 1 : 3))));
            }
        }
        setLastResult({ correct: isCorrect, correctItem: currentQuestion });
        setGameState('result');
    };

    const handleNextResult = () => {
        if (lives <= 0) {
            saveStats(score, stars);
            setGameState('gameover');
        } else {
            setGameState('playing');
            nextQuestion(usedQuestionIds);
        }
    };

    const handleRevive = () => {
        vkBridge.send("VKWebAppShowRewardedVideo")
            .then((data) => { if (data.result) reviveLogic(); })
            .catch(() => reviveLogic());
    };

    const reviveLogic = () => {
        setLives(1);
        setGameState('playing');
        nextQuestion(usedQuestionIds);
    };

    const togglePause = () => setGameState(curr => curr === 'playing' ? 'paused' : 'playing');
    const goMenu = () => { if (score > 0) saveStats(score, stars); setGameState('menu'); };

    // --- Screens ---

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden paper-texture">
                {/* Visual Elements: Film Strips */}
                <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 bg-black flex flex-col items-center py-4 space-y-6 opacity-80 z-0">
                    {[...Array(12)].map((_, i) => <div key={i} className="w-full h-8 bg-white/5 rounded-sm"></div>)}
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-12 bg-black flex flex-col items-center py-4 space-y-6 opacity-80 z-0">
                    {[...Array(12)].map((_, i) => <div key={i} className="w-full h-8 bg-white/5 rounded-sm"></div>)}
                </div>

                <div className="max-w-md w-full bg-soviet-cream border-4 border-black p-6 sm:p-8 shadow-hard-lg rounded-sm z-10 text-center relative rotate-1 animate-slide-up">
                    {/* Decorative Star/Stamp */}
                    <div className="absolute -top-6 -left-6 w-20 h-20 bg-soviet-red text-white flex items-center justify-center rounded-full border-4 border-black rotate-[-15deg] shadow-hard opacity-90">
                        <Star size={40} fill="currentColor" strokeWidth={2} className="text-black" />
                    </div>

                    <div className="mb-6 relative">
                         {/* Retro Border for Title */}
                         <div className="border-4 border-double border-soviet-red p-4 bg-white/40 shadow-inner">
                            <h1 className="font-ruslan text-4xl sm:text-5xl text-soviet-red drop-shadow-[3px_3px_0_#000] leading-none mb-2">
                                {T.title.toUpperCase()}
                            </h1>
                            <div className="inline-flex items-center gap-2 bg-soviet-dark text-soviet-gold px-4 py-1 border-2 border-black shadow-hard-sm">
                                <p className="font-oswald font-bold tracking-[0.2em] text-[10px] uppercase whitespace-nowrap">{T.subtitle}</p>
                            </div>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-8">
                         <div className="bg-white border-2 border-black p-2 shadow-hard-sm transform -rotate-1">
                             <span className="block text-[10px] uppercase text-gray-500 font-bold">{T.record}</span>
                             <span className="text-xl font-bold">{stats.highScore}</span>
                         </div>
                         <div className="bg-white border-2 border-black p-2 shadow-hard-sm transform rotate-1">
                             <span className="block text-[10px] uppercase text-gray-500 font-bold">{T.stars}</span>
                             <span className="text-xl font-bold flex items-center justify-center gap-1 text-soviet-gold drop-shadow-sm">
                                {stats.totalStars} <Star size={18} fill="currentColor" strokeWidth={2} className="text-black" />
                             </span>
                         </div>
                    </div>

                    <div className="space-y-4">
                        <Button fullWidth onClick={startGame} className="py-4 text-xl">
                            <Play size={24} strokeWidth={3} fill="currentColor" /> {T.start}
                        </Button>
                        <Button fullWidth variant="secondary" onClick={() => setGameState('shop')}>
                            <ShoppingCart size={24} strokeWidth={2} /> {T.shop}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'shop') {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-oswald paper-texture overflow-x-hidden">
                <div className="max-w-md w-full bg-soviet-cream border-4 border-black p-6 shadow-hard-lg relative animate-slide-up">
                     <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-soviet-red text-soviet-cream px-8 py-2 border-2 border-black shadow-hard font-bold tracking-widest -rotate-1 text-xl">
                        {T.shop_title}
                    </div>

                    <div className="mt-8 flex justify-between items-center mb-6 border-b-2 border-dashed border-black/30 pb-4">
                        <span className="font-ruslan text-2xl text-soviet-dark">{T.stars}</span>
                        <span className="font-bold text-xl bg-soviet-gold border-2 border-black px-4 py-1.5 flex items-center gap-2 shadow-hard-sm animate-wobble">
                             {stats.totalStars} <Star size={20} fill="black" />
                        </span>
                    </div>

                    {/* Bonus Block: Watch Ad */}
                    <div className="bg-white border-2 border-black p-4 mb-4 shadow-hard-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-soviet-red text-white text-[9px] px-2 py-0.5 font-bold uppercase rotate-12 translate-x-3 translate-y-1">{T.bonus}</div>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-soviet-gold border-2 border-black rounded-sm shadow-hard-sm group-hover:scale-110 transition-transform">
                                <Film size={24} className="text-black" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-base leading-tight uppercase tracking-tight">{T.earn_stars}</h4>
                                <p className="text-[10px] text-gray-500 leading-tight">{T.watch_ad_desc}</p>
                            </div>
                            <button 
                                onClick={handleEarnStarsAd}
                                className="px-3 py-1.5 bg-soviet-green text-white border-2 border-black font-bold text-xs shadow-hard-sm active:translate-y-0.5 active:shadow-none"
                            >
                                {T.earn}
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {SHOP_ITEMS.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-white border-2 border-black p-3 shadow-hard-sm hover:translate-x-1 transition-transform">
                                <div className="p-2.5 bg-soviet-cream border-2 border-black">
                                    <item.icon size={22} className="text-soviet-red" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="font-bold text-base leading-none uppercase">{item.name[lang]}</h4>
                                    <p className="text-[10px] text-gray-500">{item.desc[lang]}</p>
                                </div>
                                <button 
                                    disabled={stats.totalStars < item.price}
                                    className={`px-3 py-1.5 border-2 border-black font-bold text-xs shadow-hard-sm active:shadow-none active:translate-y-0.5 ${stats.totalStars >= item.price ? 'bg-soviet-gold hover:bg-yellow-400' : 'bg-gray-200 opacity-50 cursor-not-allowed'}`}
                                >
                                    {item.price} ⭐
                                </button>
                            </div>
                        ))}
                    </div>

                    <Button fullWidth variant="secondary" onClick={() => setGameState('menu')}>
                        <Home size={20} /> {T.menu}
                    </Button>
                </div>
            </div>
        );
    }

    if (gameState === 'gameover') {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-soviet-dark/95 font-oswald relative overflow-hidden">
                 <div className="max-w-md w-full bg-white border-4 border-black p-6 shadow-2xl relative rotate-1 animate-slide-up">
                    <h2 className="font-ruslan text-5xl mb-6 text-center text-soviet-dark drop-shadow-md">{T.gameover}</h2>
                    <div className="bg-soviet-cream border-2 border-black p-4 mb-6 text-center shadow-hard-sm">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-1">{T.your_score}</p>
                        <p className="text-5xl font-bold text-soviet-red drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">{score}</p>
                        <div className="mt-3 flex justify-center items-center gap-2 font-bold bg-soviet-gold px-3 py-1 border-2 border-black shadow-hard-sm inline-flex">
                             <span>+{stars}</span> <Star size={16} fill="black" />
                        </div>
                    </div>
                    <p className="text-center mb-6 italic font-serif text-gray-600 leading-relaxed px-4 text-sm">{T.gameover_msg}</p>
                    <div className="space-y-4">
                        <Button fullWidth variant="accent" onClick={handleRevive} className="py-4 text-lg">
                             <Play size={24} fill="currentColor" /> {T.revive}
                             <span className="text-[9px] bg-black/10 px-1 rounded ml-1 font-normal opacity-70 tracking-tighter uppercase">AD</span>
                        </Button>
                        <Button fullWidth variant="secondary" onClick={goMenu}>
                            <Home size={20} /> {T.menu}
                        </Button>
                    </div>
                 </div>
            </div>
        );
    }

    if (gameState === 'result' && lastResult) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-soviet-cream paper-texture font-oswald overflow-hidden">
                <div className={`max-w-md w-full bg-white border-4 border-black p-5 shadow-hard-lg relative animate-slide-up ${isWrong ? 'animate-shake' : ''}`}>
                    <div className={`absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-1.5 border-2 border-black font-ruslan text-2xl shadow-hard ${lastResult.correct ? 'bg-soviet-green text-white rotate-1' : 'bg-soviet-red text-white -rotate-1'}`}>
                        {lastResult.correct ? T.correct : T.wrong}
                    </div>
                    <div className="mt-8 border-4 border-black bg-black rounded-sm overflow-hidden relative aspect-video shadow-inner-hard mb-4">
                        <img src={lastResult.correctItem.imageUrl} className="w-full h-full object-contain" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest animate-pulse">
                            <div className="w-1 h-1 bg-white rounded-full"></div> REC
                        </div>
                    </div>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-soviet-dark mb-2 leading-tight uppercase tracking-tight">{lastResult.correctItem[lang].title}</h3>
                        <div className="inline-block relative px-4">
                             <p className="text-[11px] text-gray-700 italic font-serif py-2 border-y border-dashed border-gray-300">
                                "{lastResult.correctItem[lang].desc}"
                             </p>
                        </div>
                    </div>
                    <Button fullWidth onClick={handleNextResult} className="py-3">
                        {T.next} <Clapperboard size={18} />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col bg-soviet-cream font-oswald relative paper-texture overflow-x-hidden">
            {/* Retro Header */}
            <div className="bg-soviet-red border-b-4 border-black p-2.5 pt-safe-top z-50 sticky top-0 shadow-hard w-full">
                <div className="max-w-lg mx-auto flex justify-between items-end gap-2 px-1">
                    {/* Score Ticket */}
                    <div className="bg-soviet-cream border-2 border-black px-2.5 py-1 shadow-hard-sm transform -rotate-1 min-w-[65px]">
                        <span className="block text-[8px] font-bold text-soviet-dark leading-none tracking-widest uppercase mb-0.5">{T.score}</span>
                        <span className="block text-xl font-bold text-soviet-red leading-none">{score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         {/* Level Badge */}
                         <div className="flex flex-col items-center">
                             <div className="bg-soviet-dark text-soviet-gold text-[8px] px-1.5 rounded-t font-bold tracking-wider border-x-2 border-t-2 border-black/50 uppercase">{T.level}</div>
                             <div className="bg-soviet-gold text-soviet-dark font-bold text-xl px-3.5 border-2 border-black shadow-hard-sm leading-none py-1.5">{level}</div>
                        </div>
                        {/* Lives */}
                        <div className="flex gap-1 bg-black/15 p-1.5 rounded-lg border-2 border-black/20 shadow-inner">
                             {[...Array(maxLives)].map((_, i) => (
                                 <Heart key={i} size={20} 
                                    fill={i < lives ? "#D92B2B" : "transparent"}
                                    stroke={i < lives ? "#000" : "#666"}
                                    strokeWidth={2}
                                    className={`${i < lives ? "drop-shadow-sm" : "opacity-30"}`}
                                 />
                             ))}
                        </div>
                    </div>
                    <button onClick={togglePause} className="bg-soviet-cream border-2 border-black p-2 hover:bg-white active:scale-90 shadow-hard-sm rounded-full">
                        <Settings size={20} className="text-soviet-dark" />
                    </button>
                </div>
            </div>

            {/* Game Content */}
            <div className="flex-1 flex flex-col items-center p-3 w-full max-w-lg mx-auto relative z-0">
                {currentQuestion && (
                    <div className={`w-full space-y-4 sm:space-y-6 ${isWrong ? 'animate-shake' : ''}`}>
                         <div className="w-full">
                             <TVFrame imageUrl={currentQuestion.imageUrl} label={T.tv_brand} />
                         </div>

                         <div className="relative transform -rotate-1 max-w-fit mx-auto scale-90">
                             <div className="absolute inset-0 bg-black translate-x-1 translate-y-1"></div>
                             <div className="relative bg-white border-2 border-black px-6 py-2">
                                 <span className="font-bold tracking-[0.2em] text-soviet-dark text-sm block text-center uppercase whitespace-nowrap">{T.question}</span>
                             </div>
                         </div>

                         {/* ANSWER GRID: Forced 2x2 with smaller padding/text to prevent scrolling */}
                         <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full pb-6">
                             {options.map((opt, idx) => (
                                 <Button 
                                    key={opt.id} 
                                    variant="secondary" 
                                    className="min-h-[60px] sm:min-h-[72px] text-[10px] sm:text-xs leading-tight normal-case text-left pl-3 sm:pl-6 flex justify-start items-center border-2 border-black shadow-hard active:shadow-none"
                                    onClick={() => handleAnswer(opt)}
                                 >
                                     <span className="font-bold text-soviet-red mr-1.5 sm:mr-3 text-lg sm:text-xl opacity-80 font-ruslan">
                                         {idx + 1}.
                                     </span>
                                     <span className="font-oswald font-bold uppercase tracking-tight line-clamp-2">
                                         {opt[lang].title}
                                     </span>
                                 </Button>
                             ))}
                         </div>
                    </div>
                )}
            </div>

            {/* Pause Modal */}
            {gameState === 'paused' && (
                <div className="fixed inset-0 bg-soviet-dark/90 z-[100] flex items-center justify-center p-4">
                    <div className="bg-soviet-cream p-8 border-4 border-black w-full max-w-xs shadow-hard-lg text-center relative rotate-1">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-soviet-red text-white px-8 py-2 font-ruslan tracking-widest text-2xl border-2 border-black shadow-hard-sm -rotate-2">
                            {T.pause}
                        </div>
                        <div className="space-y-4 mt-6">
                            <Button fullWidth onClick={togglePause} variant="primary" className="py-4">
                                <Play size={24} fill="currentColor" /> {T.resume}
                            </Button>
                            <Button fullWidth onClick={goMenu} variant="secondary">
                                <Home size={20} /> {T.menu}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}