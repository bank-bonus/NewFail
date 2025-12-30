import React, { useState, useEffect } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { CARTOONS, TRANSLATIONS } from './data';
import { Cartoon, GameState, Language, PlayerStats } from './types';
import { Play, Home, ShoppingCart, Heart, Star, Settings, Clapperboard, Film, Trophy, CheckCircle2, Shield, Zap, Award, Tv } from 'lucide-react';

// --- Components ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false, rounded = false }: any) => {
    const baseStyle = `relative font-oswald uppercase tracking-widest font-bold py-3 px-6 transition-all transform active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-3 z-10 ${rounded ? 'rounded-2xl' : 'border-2 border-black'}`;
    const variants: any = {
        primary: "bg-soviet-red text-white",
        secondary: "bg-soviet-gold text-soviet-dark",
        accent: "bg-soviet-green text-white",
        correct: "bg-soviet-green text-white scale-105",
        wrong: "bg-soviet-red text-white animate-shake"
    };
    return (
        <button onClick={disabled ? undefined : onClick} className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 grayscale' : ''} ${className}`}>
            {children}
        </button>
    );
};

const TVFrame = ({ imageUrl, label }: any) => (
    <div className="relative w-full max-w-[90vw] sm:max-w-md mx-auto z-10 animate-slide-up">
        <div className="wood-pattern p-3 sm:p-4 rounded-xl border-4 border-[#2a110a] shadow-hard-lg relative">
            <div className="flex gap-2 sm:gap-4 items-stretch">
                <div className="flex-1 aspect-[4/3] bg-black rounded-lg border-2 border-black relative overflow-hidden">
                    <img src={imageUrl} alt="Quiz" className="w-full h-full object-cover relative z-10 sepia-[0.1]" />
                </div>
            </div>
            <div className="absolute bottom-[-8px] left-6 bg-soviet-dark text-soviet-gold text-[8px] font-bold px-1.5 py-0.5 border border-soviet-gold uppercase">
                {label}
            </div>
        </div>
    </div>
);

export default function App() {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [lang, setLang] = useState<Language>('ru');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [maxLives, setMaxLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [stars, setStars] = useState(0);
    const [stats, setStats] = useState<PlayerStats>({ highScore: 0, totalStars: 0 });
    const [currentQuestion, setCurrentQuestion] = useState<Cartoon | null>(null);
    const [options, setOptions] = useState<Cartoon[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<any>(null);

    const T = TRANSLATIONS[lang];

    // 1. Инициализация и Баннеры
    useEffect(() => {
        const initVK = async () => {
            try {
                await vkBridge.send('VKWebAppInit');
                const storage = await vkBridge.send('VKWebAppStorageGet', { keys: ['highScore', 'totalStars'] });
                if (storage.keys) {
                    const loaded = { highScore: 0, totalStars: 0 };
                    storage.keys.forEach(k => {
                        if (k.key === 'highScore') loaded.highScore = parseInt(k.value) || 0;
                        if (k.key === 'totalStars') loaded.totalStars = parseInt(k.value) || 0;
                    });
                    setStats(loaded);
                }
            } catch (e) { console.error("VK Init Error", e); }
        };
        initVK();
    }, []);

    useEffect(() => {
        const showBannerStates: GameState[] = ['menu', 'shop', 'gameover'];
        if (showBannerStates.includes(gameState)) {
            vkBridge.send('VKWebAppShowBannerAd', { banner_location: 'bottom' }).catch(e => console.log("Banner error", e));
        } else {
            vkBridge.send('VKWebAppHideBannerAd').catch(e => console.log(e));
        }
    }, [gameState]);

    // 2. Универсальный Хелпер Рекламы (Rewarded)
    const handleAdsWithReward = async (onSuccess: () => void) => {
        try {
            // Сначала проверяем доступность
            const check = await vkBridge.send('VKWebAppCheckNativeAds', { ad_format: 'reward' });
            
            if (check.result) {
                // Показываем видео (используем правильный метод ShowRewardedVideo)
                const data = await vkBridge.send("VKWebAppShowRewardedVideo", { type: 'reward' });
                if (data.result) {
                    onSuccess();
                } else {
                    alert("Нужно досмотреть рекламу до конца, чтобы получить награду!");
                }
            } else {
                alert("Реклама сейчас недоступна. Попробуйте чуть позже.");
            }
        } catch (e: any) {
            console.error("Ad Error", e);
            alert("Ошибка при загрузке рекламы: " + (e.error_data?.error_msg || "Неизвестная ошибка"));
        }
    };

    const handleEarnStarsAd = () => {
        handleAdsWithReward(() => {
            const newTotal = stats.totalStars + 5;
            setStats(prev => ({ ...prev, totalStars: newTotal }));
            vkBridge.send('VKWebAppStorageSet', { key: 'totalStars', value: newTotal.toString() });
        });
    };

    const handleRevive = () => {
        handleAdsWithReward(() => {
            setLives(1);
            setGameState('playing');
            nextQuestion(new Set());
        });
    };

    // 3. Логика Игры
    const startGame = () => {
        setScore(0); setLives(3); setLevel(1); setStars(0);
        setGameState('playing');
        nextQuestion(new Set());
    };

    const nextQuestion = (used: Set<string>) => {
        setSelectedId(null);
        const available = CARTOONS.filter(c => !used.has(c.id));
        const next = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : CARTOONS[0];
        setCurrentQuestion(next);
        const others = CARTOONS.filter(c => c.id !== next.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        setOptions([next, ...others].sort(() => 0.5 - Math.random()));
    };

    const handleAnswer = (selected: Cartoon) => {
        if (selectedId) return;
        setSelectedId(selected.id);
        const isCorrect = selected.id === currentQuestion?.id;
        
        setTimeout(() => {
            if (isCorrect) {
                setScore(s => s + 100);
            } else {
                setLives(l => l - 1);
            }
            setLastResult({ correct: isCorrect, correctItem: currentQuestion });
            setGameState('result');
        }, 800);
    };

    const handleNextResult = () => {
        if (lives <= 0) {
            const newHigh = Math.max(stats.highScore, score);
            const newStars = stats.totalStars + stars;
            setStats({ highScore: newHigh, totalStars: newStars });
            vkBridge.send('VKWebAppStorageSet', { key: 'highScore', value: newHigh.toString() });
            vkBridge.send('VKWebAppStorageSet', { key: 'totalStars', value: newStars.toString() });
            setGameState('gameover');
        } else {
            setGameState('playing');
            nextQuestion(new Set());
        }
    };

    // --- Экраны ---
    if (gameState === 'menu') return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-soviet-cream p-6">
            <div className="bg-white border-[6px] border-soviet-dark rounded-[40px] p-8 w-full max-w-md text-center shadow-xl">
                <h1 className="font-ruslan text-5xl text-soviet-red mb-8 uppercase">СоюзМульт Квиз</h1>
                <div className="flex gap-4 mb-8">
                    <div className="flex-1 bg-soviet-gold/20 p-3 rounded-2xl border-2 border-soviet-gold">
                        <Trophy className="mx-auto mb-1 text-soviet-gold" />
                        <div className="text-xs font-bold">{T.record}: {stats.highScore}</div>
                    </div>
                    <div className="flex-1 bg-soviet-gold/20 p-3 rounded-2xl border-2 border-soviet-gold">
                        <Star className="mx-auto mb-1 text-soviet-gold" fill="currentColor" />
                        <div className="text-xs font-bold">{stats.totalStars}</div>
                    </div>
                </div>
                <div className="space-y-4">
                    <Button fullWidth rounded onClick={startGame} className="py-4 text-xl"><Play fill="currentColor" /> {T.start}</Button>
                    <Button fullWidth rounded variant="secondary" onClick={() => setGameState('shop')} className="py-4"><ShoppingCart /> {T.shop}</Button>
                </div>
            </div>
        </div>
    );

    if (gameState === 'shop') return (
        <div className="min-h-screen bg-soviet-cream p-6 flex flex-col items-center">
            <div className="bg-white border-4 border-soviet-dark rounded-[32px] p-6 w-full max-w-md relative">
                <h2 className="text-2xl font-bold mb-6 uppercase text-center">{T.shop_title}</h2>
                <div className="bg-soviet-green/10 border-2 border-soviet-green p-4 rounded-2xl mb-6 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-sm">Бесплатные звезды</div>
                        <div className="text-[10px] opacity-60">Смотри рекламу — получай +5 ⭐</div>
                    </div>
                    <Button variant="accent" onClick={handleEarnStarsAd} className="py-2 px-4 text-xs">Смотреть</Button>
                </div>
                <Button fullWidth variant="secondary" onClick={() => setGameState('menu')} rounded>Назад</Button>
            </div>
        </div>
    );

    if (gameState === 'gameover') return (
        <div className="min-h-screen bg-soviet-dark flex items-center justify-center p-6">
            <div className="bg-white border-4 border-black rounded-[40px] p-8 w-full max-w-md text-center">
                <h2 className="font-ruslan text-4xl mb-4">Конец игры</h2>
                <div className="text-5xl font-bold text-soviet-red mb-6">{score}</div>
                <div className="space-y-4">
                    <Button fullWidth rounded onClick={handleRevive}><Play fill="currentColor" /> Возродиться (AD)</Button>
                    <Button fullWidth rounded variant="secondary" onClick={() => setGameState('menu')}><Home /> В меню</Button>
                </div>
            </div>
        </div>
    );

    if (gameState === 'result') return (
        <div className="min-h-screen bg-soviet-cream p-4 flex flex-col items-center justify-center">
            <div className="bg-white border-4 border-black rounded-[32px] p-6 w-full max-w-md text-center">
                <div className={`text-2xl font-bold mb-4 ${lastResult?.correct ? 'text-soviet-green' : 'text-soviet-red'}`}>
                    {lastResult?.correct ? T.correct : T.wrong}
                </div>
                <img src={lastResult?.correctItem.imageUrl} className="w-full rounded-2xl mb-4 border-2 border-black" />
                <h3 className="text-xl font-bold mb-4">{lastResult?.correctItem[lang].title}</h3>
                <Button fullWidth rounded onClick={handleNextResult}>{T.next}</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-soviet-cream flex flex-col">
            <div className="bg-soviet-red p-4 flex justify-between items-center text-white border-b-4 border-black">
                <div className="font-bold">Счет: {score}</div>
                <div className="flex gap-1">
                    {[...Array(maxLives)].map((_, i) => <Heart key={i} size={20} fill={i < lives ? "white" : "transparent"} />)}
                </div>
            </div>
            <div className="p-6 flex-1 flex flex-col items-center">
                {currentQuestion && (
                    <>
                        <TVFrame imageUrl={currentQuestion.imageUrl} label="СССР ТВ" />
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-8">
                            {options.map((opt) => (
                                <Button 
                                    key={opt.id} rounded 
                                    variant={selectedId === opt.id ? (opt.id === currentQuestion.id ? 'correct' : 'wrong') : 'secondary'}
                                    onClick={() => handleAnswer(opt)}
                                    disabled={!!selectedId}
                                >
                                    {opt[lang].title}
                                </Button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
