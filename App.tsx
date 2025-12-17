import React, { useState, useEffect, useCallback, useMemo } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { CARTOONS, TRANSLATIONS } from './data';
import { Cartoon, GameState, Language, PlayerStats } from './types';
import { Play, Home, RefreshCw, ShoppingCart, Heart, Star, Settings, Pause, X, RotateCcw, Clapperboard } from 'lucide-react';

// --- Components ---

const Button: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger';
    className?: string;
    disabled?: boolean;
    fullWidth?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
    // Retro button style: sharp corners, hard shadow, physical press effect
    const baseStyle = "relative font-oswald uppercase tracking-widest font-bold py-3 px-6 border-2 border-black transition-all transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 z-10";
    
    // Initial shadow state
    const shadowStyle = disabled ? "shadow-none" : "shadow-hard hover:shadow-hard-lg hover:-translate-y-1";

    const variants = {
        primary: "bg-soviet-red text-soviet-cream",
        secondary: "bg-soviet-cream text-soviet-dark",
        accent: "bg-soviet-green text-white",
        danger: "bg-gray-800 text-gray-300"
    };

    return (
        <button 
            onClick={disabled ? undefined : onClick}
            className={`${baseStyle} ${variants[variant]} ${shadowStyle} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-400 border-gray-600' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

const TVFrame: React.FC<{ imageUrl: string; label: string }> = ({ imageUrl, label }) => (
    <div className="relative w-full max-w-md mx-auto z-10">
        {/* Antenna */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-1 h-12 bg-gray-400 rotate-[-30deg] origin-bottom"></div>
            <div className="absolute bottom-0 right-0 w-1 h-12 bg-gray-400 rotate-[30deg] origin-bottom"></div>
        </div>

        {/* TV Body */}
        <div className="wood-pattern p-4 rounded-lg border-4 border-[#3e2716] shadow-hard-lg relative">
            <div className="flex gap-4">
                {/* Screen Area */}
                <div className="flex-1 aspect-[4/3] bg-black rounded-lg border-4 border-black relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                    <img src={imageUrl} alt="Quiz" className="w-full h-full object-cover relative z-10 sepia-[0.3] contrast-125" />
                    <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-br from-white/10 to-black/40 mix-blend-overlay scanlines"></div>
                    <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"></div>
                </div>

                {/* Control Panel Area (Right side for landscape/desktop feel, or simplified for mobile) */}
                <div className="hidden sm:flex flex-col gap-2 w-12 items-center justify-center bg-[#2a1a0e] rounded p-1 border-2 border-[#1a0f08]">
                     <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-gray-600 shadow-hard-sm"></div>
                     <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-gray-600 shadow-hard-sm mb-4"></div>
                     <div className="w-full flex-1 flex flex-col gap-1">
                        {[...Array(6)].map((_,i) => <div key={i} className="w-full h-1 bg-black/50 rounded-full"></div>)}
                     </div>
                </div>
            </div>

            {/* Brand Label */}
            <div className="absolute bottom-[-14px] left-8 bg-[#2a1a0e] text-soviet-gold text-[10px] font-bold px-3 py-1 border-2 border-soviet-gold tracking-[0.2em] shadow-sm uppercase">
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
    
    // Persistent Stats
    const [stats, setStats] = useState<PlayerStats>({ highScore: 0, totalStars: 0 });

    const [currentQuestion, setCurrentQuestion] = useState<Cartoon | null>(null);
    const [options, setOptions] = useState<Cartoon[]>([]);
    const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
    
    // Result State
    const [lastResult, setLastResult] = useState<{correct: boolean, correctItem: Cartoon} | null>(null);
    const [answeredCount, setAnsweredCount] = useState(0);

    const T = TRANSLATIONS[lang];

    // Initialize VK & Load Data
    useEffect(() => {
        const initVK = async () => {
            try {
                const data = await vkBridge.send('VKWebAppGetUserInfo');
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
                console.error("VK Init Error or Standalone mode", e);
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

    const saveStats = (newScore: number, earnedStars: number) => {
        const newStats = {
            highScore: Math.max(stats.highScore, newScore),
            totalStars: stats.totalStars + earnedStars
        };
        setStats(newStats);
        try {
            vkBridge.send('VKWebAppStorageSet', { key: 'highScore', value: newStats.highScore.toString() });
            vkBridge.send('VKWebAppStorageSet', { key: 'totalStars', value: newStats.totalStars.toString() });
        } catch(e) { console.error(e); }
        localStorage.setItem('sovietQuizHighScore', newStats.highScore.toString());
        localStorage.setItem('sovietQuizStars', newStats.totalStars.toString());
    };

    const startGame = () => {
        setScore(0);
        setLives(3);
        setMaxLives(3);
        setLevel(1);
        setStars(0);
        setAnsweredCount(0);
        setUsedQuestionIds(new Set());
        setGameState('playing');
        nextQuestion(new Set(), 1);
    };

    const nextQuestion = (usedIds: Set<string>, currentLevel: number) => {
        const available = CARTOONS.filter(c => !usedIds.has(c.id));
        if (available.length === 0) {
            setUsedQuestionIds(new Set());
            const resetAvailable = CARTOONS;
            const next = resetAvailable[Math.floor(Math.random() * resetAvailable.length)];
            prepareRound(next, resetAvailable);
        } else {
            const next = available[Math.floor(Math.random() * available.length)];
            const nextUsed = new Set(usedIds);
            nextUsed.add(next.id);
            setUsedQuestionIds(nextUsed);
            prepareRound(next, CARTOONS);
        }
    };

    const prepareRound = (correct: Cartoon, all: Cartoon[]) => {
        setCurrentQuestion(correct);
        const others = all.filter(c => c.id !== correct.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        const roundOptions = [correct, ...others].sort(() => 0.5 - Math.random());
        setOptions(roundOptions);
    };

    const handleAnswer = (selected: Cartoon) => {
        if (!currentQuestion) return;
        const isCorrect = selected.id === currentQuestion.id;
        setLastResult({ correct: isCorrect, correctItem: currentQuestion });
        setGameState('result');
        if (isCorrect) {
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
        } else {
            setLives(l => l - 1);
        }
    };

    const handleNextResult = () => {
        if (lives <= 0) {
            saveStats(score, stars);
            setGameState('gameover');
        } else {
            setGameState('playing');
            nextQuestion(usedQuestionIds, level);
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
        nextQuestion(usedQuestionIds, level);
    };

    const togglePause = () => {
        setGameState(current => current === 'playing' ? 'paused' : 'playing');
    };

    const goMenu = () => {
        if (score > 0) saveStats(score, stars);
        setGameState('menu');
    };

    // --- Screens ---

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden paper-texture">
                {/* Decorative borders */}
                <div className="absolute top-0 inset-x-0 h-4 bg-black flex space-x-2 overflow-hidden opacity-80">
                    {[...Array(20)].map((_,i) => <div key={i} className="w-8 h-full bg-white/20 -skew-x-12"></div>)}
                </div>
                <div className="absolute bottom-0 inset-x-0 h-4 bg-black flex space-x-2 overflow-hidden opacity-80">
                     {[...Array(20)].map((_,i) => <div key={i} className="w-8 h-full bg-white/20 -skew-x-12"></div>)}
                </div>

                <div className="max-w-md w-full bg-soviet-cream border-4 border-black p-8 shadow-hard-lg rounded-sm z-10 text-center relative rotate-1">
                    {/* Corner Stamps */}
                    <div className="absolute -top-3 -left-3 text-soviet-red opacity-80 rotate-[-15deg]">
                        <Star size={40} fill="currentColor" />
                    </div>
                    <div className="absolute -bottom-3 -right-3 text-soviet-red opacity-80 rotate-[15deg]">
                        <Star size={40} fill="currentColor" />
                    </div>

                    <div className="mb-6">
                        <h1 className="font-ruslan text-4xl md:text-5xl text-soviet-red drop-shadow-[2px_2px_0_#000] leading-tight break-words">
                            {T.title.toUpperCase()}
                        </h1>
                        <div className="flex items-center justify-center gap-2 mt-2 opacity-70">
                             <div className="h-[2px] w-8 bg-black"></div>
                             <p className="font-oswald font-bold text-soviet-dark tracking-[0.2em] text-xs md:text-sm whitespace-nowrap">{T.subtitle}</p>
                             <div className="h-[2px] w-8 bg-black"></div>
                        </div>
                    </div>
                    
                    {/* Stats Card */}
                    <div className="bg-white border-2 border-black p-4 mb-8 shadow-hard-sm -rotate-1 transform transition hover:rotate-0">
                        <div className="flex justify-between items-center text-soviet-dark font-oswald">
                            <div className="flex flex-col items-center w-1/2 border-r-2 border-gray-200">
                                <span className="text-xs uppercase tracking-wider text-gray-500">{T.record}</span>
                                <span className="text-2xl font-bold">{stats.highScore}</span>
                            </div>
                             <div className="flex flex-col items-center w-1/2">
                                <span className="text-xs uppercase tracking-wider text-gray-500">{T.stars}</span>
                                <span className="text-2xl font-bold flex items-center gap-1 text-soviet-gold drop-shadow-sm">
                                    {stats.totalStars} <Star size={20} fill="currentColor" strokeWidth={2} className="text-black" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 px-2">
                        <Button fullWidth onClick={startGame} className="animate-float">
                            <Play size={24} strokeWidth={3} /> {T.start}
                        </Button>
                        <Button fullWidth variant="secondary" onClick={() => setGameState('shop')}>
                            <ShoppingCart size={24} strokeWidth={3} /> {T.shop}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'shop') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 font-oswald paper-texture">
                <div className="max-w-md w-full bg-soviet-cream border-4 border-black p-6 shadow-hard-lg relative">
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-soviet-red text-soviet-cream px-6 py-1 border-2 border-black shadow-hard-sm font-bold tracking-widest -rotate-2">
                        {T.shop_title}
                    </div>

                    <div className="mt-6 flex justify-between items-center mb-6 border-b-2 border-dashed border-black pb-4">
                        <span className="font-ruslan text-2xl text-soviet-dark">{T.stars}</span>
                        <span className="font-bold text-xl bg-soviet-gold border-2 border-black px-3 py-1 flex items-center gap-2 shadow-hard-sm">
                             {stats.totalStars} <Star size={16} fill="black" />
                        </span>
                    </div>
                    
                    <div className="py-12 text-center text-soviet-dark/60 bg-white/50 border-2 border-black/10 rounded mb-6">
                        <div className="relative inline-block mb-4">
                            <ShoppingCart size={48} className="opacity-50" />
                            <div className="absolute -top-2 -right-2 text-soviet-red font-bold text-xl rotate-12">?</div>
                        </div>
                        <p className="font-bold">{T.shop_msg}</p>
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
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-soviet-dark/90 font-oswald relative">
                 <div className="max-w-md w-full bg-[#f0f0f0] border-4 border-black p-6 shadow-2xl relative rotate-1">
                    {/* "Stamp" Effect */}
                    <div className="absolute top-4 right-4 border-4 border-soviet-red text-soviet-red rounded-full w-20 h-20 flex items-center justify-center rotate-[-20deg] opacity-40 font-bold text-xl pointer-events-none">
                        ФИНАЛ
                    </div>

                    <h2 className="font-ruslan text-4xl mb-6 text-center text-soviet-dark drop-shadow-md">{T.gameover}</h2>
                    
                    <div className="bg-white border-2 border-black p-6 mb-6 text-center shadow-hard-sm">
                        <p className="text-sm uppercase tracking-widest text-gray-500 mb-1">{T.your_score}</p>
                        <p className="text-5xl font-bold text-soviet-red drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">{score}</p>
                        <div className="mt-3 flex justify-center items-center gap-2 text-soviet-dark font-bold bg-soviet-gold/20 py-1 rounded">
                             <span>+{stars}</span> <Star size={16} fill="black" />
                        </div>
                    </div>
                    
                    <p className="text-center mb-6 italic font-serif text-gray-600 border-b-2 border-gray-300 pb-4">{T.gameover_msg}</p>

                    <div className="space-y-4">
                        <Button fullWidth variant="accent" onClick={handleRevive} className="border-dashed">
                             <Play size={20} fill="currentColor" /> {T.revive}
                             <span className="text-[10px] bg-white/20 px-1 rounded ml-1">{T.ad_hint}</span>
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
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-soviet-cream paper-texture font-oswald">
                <div className="max-w-md w-full bg-white border-4 border-black p-6 shadow-hard-lg relative animate-in zoom-in duration-300">
                    <div className={`absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-2 border-2 border-black font-ruslan text-2xl shadow-hard-sm ${lastResult.correct ? 'bg-soviet-green text-white' : 'bg-soviet-red text-white'}`}>
                        {lastResult.correct ? T.correct : T.wrong}
                    </div>
                    
                    <div className="mt-8 border-4 border-black bg-black rounded-sm overflow-hidden relative aspect-video shadow-inner-hard mb-4">
                        <img src={lastResult.correctItem.imageUrl} className="w-full h-full object-contain" />
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">REC</div>
                    </div>

                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-soviet-dark mb-2 leading-tight">{lastResult.correctItem[lang].title}</h3>
                        <div className="inline-block relative">
                             <p className="text-sm text-gray-700 italic font-serif px-6 py-2 bg-soviet-cream border-l-2 border-soviet-red">
                                "{lastResult.correctItem[lang].desc}"
                             </p>
                        </div>
                    </div>

                    <Button fullWidth onClick={handleNextResult}>
                        {T.next}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-soviet-cream font-oswald relative paper-texture">
            {/* Retro Header / Banner */}
            <div className="bg-soviet-red border-b-4 border-black p-3 pt-safe-top z-50 sticky top-0 shadow-hard">
                <div className="max-w-lg mx-auto flex justify-between items-end">
                    {/* Score Ticket */}
                    <div className="bg-soviet-cream border-2 border-black px-2 py-1 shadow-hard-sm transform -rotate-1">
                        <span className="block text-[10px] font-bold text-soviet-dark leading-none tracking-widest">{T.score}</span>
                        <span className="block text-xl font-bold text-soviet-red leading-none">{score}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         {/* Level Badge */}
                         <div className="flex flex-col items-center">
                             <div className="bg-soviet-dark text-soviet-gold text-[10px] px-2 rounded-t font-bold tracking-wider border-x-2 border-t-2 border-black/50">{T.level}</div>
                             <div className="bg-soviet-gold text-soviet-dark font-bold text-xl px-3 border-2 border-black shadow-hard-sm leading-none py-1">{level}</div>
                        </div>

                        {/* Lives */}
                        <div className="flex gap-1 bg-black/10 p-1 rounded border-2 border-black/20 shadow-inner">
                             {[...Array(maxLives)].map((_, i) => (
                                 <Heart key={i} size={22} 
                                    fill={i < lives ? "#D92B2B" : "transparent"}
                                    stroke={i < lives ? "#000" : "#666"}
                                    strokeWidth={2}
                                    className={i < lives ? "drop-shadow-sm" : ""}
                                 />
                             ))}
                        </div>
                    </div>

                    <button onClick={togglePause} className="bg-soviet-cream border-2 border-black p-2 hover:bg-white active:translate-y-1 transition-all shadow-hard-sm rounded-full">
                        <Settings size={20} className="text-soviet-dark" />
                    </button>
                </div>
            </div>

            {/* Game Content */}
            <div className="flex-1 flex flex-col items-center p-4 w-full max-w-lg mx-auto relative z-0">
                {currentQuestion && (
                    <>
                         <div className="w-full mb-6 mt-2">
                             <TVFrame imageUrl={currentQuestion.imageUrl} label={T.tv_brand} />
                         </div>

                         <div className="relative mb-6 transform -rotate-1">
                             <div className="absolute inset-0 bg-black translate-x-1 translate-y-1"></div>
                             <div className="relative bg-soviet-cream border-2 border-black px-6 py-3">
                                 <span className="font-bold tracking-widest text-soviet-dark text-lg block text-center uppercase">{T.question}</span>
                                 {/* Decorative rivets */}
                                 <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full opacity-50"></div>
                                 <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full opacity-50"></div>
                                 <div className="absolute bottom-1 left-1 w-1 h-1 bg-black rounded-full opacity-50"></div>
                                 <div className="absolute bottom-1 right-1 w-1 h-1 bg-black rounded-full opacity-50"></div>
                             </div>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pb-8">
                             {options.map((opt, idx) => (
                                 <Button 
                                    key={opt.id} 
                                    variant="secondary" 
                                    className="min-h-[64px] text-sm leading-tight normal-case text-left pl-4 flex justify-start"
                                    onClick={() => handleAnswer(opt)}
                                 >
                                     <span className="font-bold text-soviet-red mr-2 text-lg opacity-60">
                                         {idx + 1}.
                                     </span>
                                     {opt[lang].title}
                                 </Button>
                             ))}
                         </div>
                    </>
                )}
            </div>

            {/* Pause Modal */}
            {gameState === 'paused' && (
                <div className="absolute inset-0 bg-soviet-dark/80 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-soviet-cream p-8 border-4 border-black w-full max-w-xs shadow-hard-lg text-center relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 font-ruslan tracking-widest text-xl border-2 border-white shadow-hard">
                            {T.pause}
                        </div>
                        <div className="space-y-4 mt-4">
                            <Button fullWidth onClick={togglePause} variant="primary">
                                <Play size={20} /> {T.resume}
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