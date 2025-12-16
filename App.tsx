import React, { useState, useEffect, useCallback, useMemo } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { CARTOONS, TRANSLATIONS } from './data';
import { Cartoon, GameState, Language, PlayerStats } from './types';
import { Play, Home, RefreshCw, ShoppingCart, Heart, Star, Settings, Pause, X, RotateCcw } from 'lucide-react';

// --- Components ---

const Button: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger';
    className?: string;
    disabled?: boolean;
    fullWidth?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }) => {
    const baseStyle = "font-oswald uppercase tracking-wider font-bold py-3 px-6 border-b-4 rounded-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2";
    
    const variants = {
        primary: "bg-soviet-red text-soviet-cream border-soviet-dark hover:bg-red-700",
        secondary: "bg-soviet-cream text-soviet-dark border-soviet-dark hover:bg-white",
        accent: "bg-soviet-green text-white border-green-900 hover:bg-green-700",
        danger: "bg-gray-800 text-gray-300 border-black"
    };

    return (
        <button 
            onClick={disabled ? undefined : onClick}
            className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed active:translate-y-0 active:border-b-4' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

const TVFrame: React.FC<{ imageUrl: string; label: string }> = ({ imageUrl, label }) => (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] bg-[#5c3a21] p-3 rounded-2xl border-2 border-[#3e2716] shadow-xl">
        {/* TV Housing */}
        <div className="w-full h-full bg-black rounded-xl border-4 border-soviet-dark relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            <img src={imageUrl} alt="Quiz" className="w-full h-full object-cover relative z-10 sepia-[0.3] contrast-125" />
            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-br from-white/10 to-black/40 mix-blend-overlay scanlines"></div>
            <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"></div>
        </div>
        <div className="absolute bottom-[-16px] right-6 bg-[#3e2716] text-soviet-gold text-[10px] font-bold px-2 py-1 rounded-b-md border border-t-0 border-white/10 tracking-widest">
            {label}
        </div>
    </div>
);

// --- Main App ---

export default function App() {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [lang, setLang] = useState<Language>('ru');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [maxLives, setMaxLives] = useState(3); // Reduces as game gets harder
    const [level, setLevel] = useState(1);
    const [stars, setStars] = useState(0); // Current run stars
    
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
                // Could use user language here, simplified to RU default or check navigator
                const userLang = navigator.language.split('-')[0];
                if (['en', 'tr'].includes(userLang)) setLang(userLang as Language);

                // Load storage
                const storage = await vkBridge.send('VKWebAppStorageGet', { keys: ['highScore', 'totalStars'] });
                const loadedStats = { highScore: 0, totalStars: 0 };
                storage.keys.forEach(k => {
                    if (k.key === 'highScore') loadedStats.highScore = parseInt(k.value) || 0;
                    if (k.key === 'totalStars') loadedStats.totalStars = parseInt(k.value) || 0;
                });
                setStats(loadedStats);
            } catch (e) {
                console.error("VK Init Error or Standalone mode", e);
                // Fallback to local storage for testing
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
        
        // Save to VK/Local
        try {
            vkBridge.send('VKWebAppStorageSet', {
                key: 'highScore', value: newStats.highScore.toString()
            });
            vkBridge.send('VKWebAppStorageSet', {
                key: 'totalStars', value: newStats.totalStars.toString()
            });
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
        nextQuestion(new Set(), 1); // Pass explicit state to avoid closure staleness
    };

    const nextQuestion = (usedIds: Set<string>, currentLevel: number) => {
        const available = CARTOONS.filter(c => !usedIds.has(c.id));
        
        if (available.length === 0) {
            // Victory or Reset (Simple reset for endless feel but with difficulty cap)
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
            
            // Level Up Logic: Every 3 questions
            if (newAnswered % 3 === 0) {
                const newLevel = Math.floor(newAnswered / 3) + 1;
                setLevel(newLevel);
                setStars(s => s + 1);
                
                // Difficulty Spike: Reduce Max Lives
                if (newLevel === 2) setMaxLives(2); // After 3 Qs
                if (newLevel >= 3) setMaxLives(1);  // After 6 Qs
                
                // Clamp current lives to new max
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
        // Mock Ad logic
        vkBridge.send("VKWebAppShowRewardedVideo")
            .then((data) => {
                if (data.result) {
                   reviveLogic();
                }
            })
            .catch((error) => {
                console.log(error); 
                // Fallback for development/testing
                reviveLogic();
            });
    };

    const reviveLogic = () => {
        setLives(1); // Revive with 1 life
        setGameState('playing');
        nextQuestion(usedQuestionIds, level);
    };

    const togglePause = () => {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
    };

    const goMenu = () => {
        // If exiting mid-game, save stats
        if (score > 0) saveStats(score, stars);
        setGameState('menu');
    };

    // --- Screens ---

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-soviet-cream font-oswald relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern opacity-10 pointer-events-none"></div>
                <div className="max-w-md w-full bg-white border-4 border-soviet-red p-6 shadow-[8px_8px_0_#1a1a1a] rounded-lg z-10 text-center relative">
                    <h1 className="font-ruslan text-5xl text-soviet-red mb-2 drop-shadow-[2px_2px_0_#1a1a1a]" dangerouslySetInnerHTML={{__html: T.title}}></h1>
                    <div className="h-1 bg-soviet-dark w-1/2 mx-auto my-4"></div>
                    <p className="font-bold text-gray-600 tracking-widest text-sm mb-6">{T.subtitle}</p>
                    
                    <div className="bg-soviet-dark text-soviet-gold p-3 rounded mb-6 flex justify-between items-center px-6">
                        <div className="flex flex-col items-start">
                            <span className="text-xs opacity-70">{T.record}</span>
                            <span className="text-xl font-bold">{stats.highScore}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-gray-600"></div>
                         <div className="flex flex-col items-end">
                            <span className="text-xs opacity-70">{T.stars}</span>
                            <span className="text-xl font-bold flex items-center gap-1">
                                {stats.totalStars} <Star size={16} fill="currentColor" />
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button fullWidth onClick={startGame}>
                            <Play size={20} /> {T.start}
                        </Button>
                        <Button fullWidth variant="secondary" onClick={() => setGameState('shop')}>
                            <ShoppingCart size={20} /> {T.shop}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'shop') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-soviet-cream font-oswald">
                <div className="max-w-md w-full bg-white border-4 border-soviet-dark p-6 shadow-xl rounded-lg text-center">
                    <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 pb-4">
                        <h2 className="font-ruslan text-3xl text-soviet-dark">{T.shop_title}</h2>
                        <span className="font-bold text-soviet-gold bg-soviet-dark px-3 py-1 rounded flex items-center gap-2">
                             {stats.totalStars} <Star size={16} fill="currentColor" />
                        </span>
                    </div>
                    
                    <div className="py-10 text-gray-500 italic">
                        <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                        <p>{T.shop_msg}</p>
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
                 <div className="max-w-md w-full bg-soviet-red border-[6px] border-double border-soviet-gold p-6 shadow-2xl rounded-lg text-center text-soviet-cream">
                    <h2 className="font-ruslan text-4xl mb-4 drop-shadow-md">{T.gameover}</h2>
                    <div className="bg-soviet-dark p-4 rounded mb-4">
                        <p className="text-sm opacity-80">{T.your_score}</p>
                        <p className="text-4xl font-bold text-soviet-gold">{score}</p>
                        <div className="mt-2 flex justify-center gap-2 text-sm text-gray-400">
                             <span>+{stars} {T.stars}</span>
                        </div>
                    </div>
                    <p className="text-sm mb-6 italic opacity-90">{T.gameover_msg}</p>

                    <div className="space-y-3">
                        <Button fullWidth variant="accent" onClick={handleRevive} className="border-white/50 border-dashed">
                             <Play size={20} /> {T.revive}
                             <span className="text-[10px] block opacity-75 font-normal ml-1">{T.ad_hint}</span>
                        </Button>
                        <Button fullWidth variant="secondary" onClick={goMenu} className="bg-transparent border-soviet-cream text-soviet-cream hover:text-soviet-dark">
                            <Home size={20} /> {T.menu}
                        </Button>
                    </div>
                 </div>
            </div>
        );
    }

    if (gameState === 'result' && lastResult) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-soviet-cream font-oswald">
                <div className="max-w-md w-full bg-white border-4 border-soviet-dark p-5 shadow-[6px_6px_0_#1a1a1a] rounded-lg text-center animate-in fade-in zoom-in duration-300">
                    <h2 className={`font-ruslan text-4xl mb-4 ${lastResult.correct ? 'text-soviet-green' : 'text-soviet-red'}`}>
                        {lastResult.correct ? T.correct : T.wrong}
                    </h2>
                    
                    <div className="border-4 border-soviet-dark rounded mb-4 overflow-hidden relative aspect-video bg-black">
                        <img src={lastResult.correctItem.imageUrl} className="w-full h-full object-contain" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] py-1">{T.frame_label}</div>
                    </div>

                    <h3 className="text-xl font-bold text-soviet-red mb-2">{lastResult.correctItem[lang].title}</h3>
                    <div className="bg-gray-100 p-3 rounded text-left border-l-4 border-soviet-red mb-6">
                        <p className="text-sm text-gray-600 italic leading-tight">"{lastResult.correctItem[lang].desc}"</p>
                    </div>

                    <Button fullWidth onClick={handleNextResult}>
                        {T.next}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-soviet-cream font-oswald relative">
            {/* Header */}
            <div className="bg-soviet-red text-soviet-cream p-3 flex justify-between items-center shadow-md border-b-4 border-red-900 z-50 sticky top-0">
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] opacity-80 font-bold">{T.score}</span>
                    <span className="text-xl font-bold">{score}</span>
                </div>
                
                <div className="flex items-center gap-4">
                     <div className="flex flex-col items-center leading-none">
                        <span className="text-[10px] opacity-80 font-bold">{T.level}</span>
                        <span className="text-xl font-bold text-soviet-gold">{level}</span>
                    </div>
                    <div className="flex gap-1 bg-black/20 px-2 py-1 rounded">
                         {[...Array(maxLives)].map((_, i) => (
                             <Heart key={i} size={20} 
                                className={i < lives ? "fill-soviet-red text-soviet-red" : "text-black/30"} 
                             />
                         ))}
                    </div>
                </div>

                <button onClick={togglePause} className="p-2 hover:bg-black/20 rounded transition-colors">
                    <Settings size={24} />
                </button>
            </div>

            {/* Game Content */}
            <div className="flex-1 flex flex-col items-center p-4 w-full max-w-lg mx-auto relative">
                {currentQuestion && (
                    <>
                         <div className="w-full mb-4 mt-2">
                             <TVFrame imageUrl={currentQuestion.imageUrl} label={T.tv_brand} />
                         </div>

                         <div className="bg-soviet-dark text-soviet-cream px-4 py-2 -skew-x-12 border-l-4 border-soviet-red shadow-md mb-6 inline-block">
                             <span className="block skew-x-12 font-bold tracking-wider">{T.question}</span>
                         </div>

                         <div className="grid grid-cols-2 gap-3 w-full">
                             {options.map((opt) => (
                                 <Button 
                                    key={opt.id} 
                                    variant="secondary" 
                                    className="min-h-[60px] text-sm leading-tight normal-case"
                                    onClick={() => handleAnswer(opt)}
                                 >
                                     {opt[lang].title}
                                 </Button>
                             ))}
                         </div>
                    </>
                )}
            </div>

            {/* Pause Modal */}
            {gameState === 'paused' && (
                <div className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-lg border-4 border-soviet-dark w-full max-w-xs shadow-2xl text-center">
                        <h2 className="font-ruslan text-3xl mb-6 text-soviet-dark">{T.pause}</h2>
                        <div className="space-y-4">
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