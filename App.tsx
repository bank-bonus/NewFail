
import React, { useState, useEffect } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import { CARTOONS, TRANSLATIONS } from './data';
import { Cartoon, GameState, Language, PlayerStats } from './types';
import { Play, Home, RefreshCw, RotateCcw, ShoppingCart, Heart, Star, Settings, Pause, ShoppingBag, Clapperboard, Award, Shield, Zap, Tv, Film, Trophy, CheckCircle2, Info, Camera, Palette, MonitorPlay } from 'lucide-react';

// --- Types ---

interface ShopItem {
    id: string;
    icon: any;
    price: number;
    name: Record<string, string>;
    desc: Record<string, string>;
    type: 'powerup' | 'skin';
}

// --- Constants ---

const SHOP_ITEMS: ShopItem[] = [
    { id: 'shield', icon: Shield, price: 0, name: { ru: 'Защита', en: 'Shield', tr: 'Kalkan' }, desc: { ru: '+1 жизнь на одну игру', en: '+1 life for one game', tr: 'Bir oyun için +1 can' }, type: 'powerup' },
    { id: 'boost', icon: Zap, price: 100, name: { ru: 'Буст x2', en: 'Boost x2', tr: 'Takviye x2' }, desc: { ru: 'x2 звезды на одну игру', en: 'x2 stars for one game', tr: 'Bir oyun için x2 yıldız' }, type: 'powerup' },
    { id: 'master', icon: Award, price: 500, name: { ru: 'Знаток', en: 'Master', tr: 'Usta' }, desc: { ru: 'Золотой телевизор', en: 'Gold TV Frame', tr: 'Altın TV Чerçevesi' }, type: 'skin' },
    { id: 'tv_red', icon: Tv, price: 200, name: { ru: 'Красный ТВ', en: 'Red TV', tr: 'Kırmızı TV' }, desc: { ru: 'Красный корпус', en: 'Red body', tr: 'Kırmızı göвде' }, type: 'skin' },
    { id: 'tv_silver', icon: Palette, price: 300, name: { ru: 'Серебряный ТВ', en: 'Silver TV', tr: 'Gümüş ТВ' }, desc: { ru: 'Металлический блеск', en: 'Silver body', tr: 'Gümüş göвде' }, type: 'skin' }
];

// --- Components ---

const AdBanner: React.FC = () => {
    return (
        <div className="vkwebbanner fixed bottom-0 left-0 right-0 h-[65px] bg-[#f0f2f5] flex items-center justify-center z-[80] border-t border-black/10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="w-full max-w-lg flex items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-soviet-gold rounded-lg flex items-center justify-center border border-black/10 shadow-sm overflow-hidden">
                        <Star size={20} fill="black" />
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Рекламная сеть ВКонтакте</div>
                        <div className="text-black text-xs font-bold leading-tight uppercase line-clamp-1">Играйте в лучшие игры каталога!</div>
                    </div>
                </div>
                <div className="bg-[#447bba] text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-sm active:opacity-80 transition-opacity">Перейти</div>
            </div>
        </div>
    );
};

const Toast: React.FC<{ message: string | null }> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-full flex justify-center px-4">
            <div className="bg-soviet-dark/95 text-white px-6 py-3 rounded-full border-2 border-black shadow-hard-lg flex items-center gap-3 animate-slide-up">
                <Info size={18} className="text-soviet-gold" />
                <span className="font-oswald font-bold text-xs uppercase tracking-widest text-center">{message}</span>
            </div>
        </div>
    );
};

const Button: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'correct' | 'wrong';
    className?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    rounded?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false, rounded = false }) => {
    const baseStyle = `relative font-oswald uppercase tracking-widest font-bold py-3 px-6 transition-all transform active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-3 z-10 ${rounded ? 'rounded-2xl' : 'border-2 border-black'}`;
    const shadowStyle = disabled ? "shadow-none" : "shadow-[0_6px_0_0_rgba(0,0,0,0.15)]";
    const variants = {
        primary: "bg-soviet-red text-white",
        secondary: "bg-soviet-gold text-soviet-dark",
        accent: "bg-soviet-green text-white",
        danger: "bg-gray-800 text-gray-300",
        correct: "bg-soviet-green text-white scale-105",
        wrong: "bg-soviet-red text-white animate-shake"
    };
    return (
        <button 
            onClick={disabled ? undefined : onClick}
            className={`${baseStyle} ${variants[variant]} ${shadowStyle} ${fullWidth ? 'w-full' : ''} ${disabled && variant !== 'correct' && variant !== 'wrong' ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

const TVFrame: React.FC<{ imageUrl: string; label: string; skin?: string }> = ({ imageUrl, label, skin }) => {
    const getSkinStyles = () => {
        switch(skin) {
            case 'master': return 'bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600 border-yellow-800 shadow-yellow-500/20';
            case 'tv_red': return 'bg-soviet-red border-red-900 shadow-red-500/20';
            case 'tv_silver': return 'bg-gradient-to-br from-gray-300 via-white to-gray-500 border-gray-600 shadow-gray-400/20';
            default: return 'wood-pattern border-[#2a110a]';
        }
    };
    const isMetallic = skin === 'master' || skin === 'tv_silver';
    return (
        <div className="relative w-full max-w-[90vw] sm:max-w-md mx-auto z-10 animate-slide-up">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 pointer-events-none opacity-40">
                <div className="absolute bottom-0 left-4 w-0.5 h-10 bg-gray-600 rotate-[-25deg] origin-bottom"></div>
                <div className="absolute bottom-0 right-4 w-0.5 h-10 bg-gray-600 rotate-[25deg] origin-bottom"></div>
            </div>
            <div className={`${getSkinStyles()} p-3 sm:p-4 rounded-xl border-4 shadow-hard-lg relative`}>
                <div className="flex gap-2 sm:gap-4 items-stretch">
                    <div className="flex-1 aspect-[4/3] bg-black rounded-lg border-2 border-black relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                        <img src={imageUrl} alt="Quiz" className="w-full h-full object-cover relative z-10 sepia-[0.1] contrast-110" />
                        <div className="absolute inset-0 z-20 pointer-events-none scanlines opacity-30"></div>
                    </div>
                    <div className={`flex flex-col gap-1.5 w-8 sm:w-12 items-center justify-start ${isMetallic ? 'bg-black/20' : 'bg-[#1a110a]'} rounded p-1 border border-black/30`}>
                         <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#444] border border-black shadow-hard-sm"></div>
                         <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#444] border border-black shadow-hard-sm"></div>
                         <div className="w-full flex-1 flex flex-col gap-1 mt-1 px-0.5 opacity-60">
                            {[...Array(6)].map((_,i) => <div key={i} className="w-full h-0.5 bg-black/80 rounded-full"></div>)}
                         </div>
                    </div>
                </div>
                <div className={`absolute bottom-[-8px] left-6 ${isMetallic ? 'bg-gray-800 text-white' : 'bg-soviet-dark text-soviet-gold'} text-[8px] font-bold px-1.5 py-0.5 border border-black/30 tracking-tighter shadow-sm uppercase`}>
                    {label}
                </div>
            </div>
        </div>
    );
};

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
    
    // Stats & Persistence
    const [stats, setStats] = useState<PlayerStats>({ highScore: 0, totalStars: 0 });
    const [purchasedSkins, setPurchasedSkins] = useState<Set<string>>(new Set<string>());
    const [activePowerups, setActivePowerups] = useState<Set<string>>(new Set<string>());
    const [activeTvSkin, setActiveTvSkin] = useState<string>('default');

    // UI State
    const [toast, setToast] = useState<string | null>(null);
    const [purchaseModal, setPurchaseModal] = useState<{item: ShopItem, success: boolean} | null>(null);
    const [cinemaCartoon, setCinemaCartoon] = useState<Cartoon | null>(null);

    const T = (TRANSLATIONS as any)[lang];

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // Game logic
    const [currentQuestion, setCurrentQuestion] = useState<Cartoon | null>(null);
    const [options, setOptions] = useState<Cartoon[]>([]);
    const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set<string>());
    const [lastResult, setLastResult] = useState<{correct: boolean, correctItem: Cartoon} | null>(null);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Initialize VK & Load Data
    useEffect(() => {
        const initVK = async () => {
            try {
                await vkBridge.send('VKWebAppInit');
                const userLang = navigator.language.split('-')[0];
                if (['en', 'tr'].includes(userLang)) setLang(userLang as Language);

                const storage = await vkBridge.send('VKWebAppStorageGet', { 
                    keys: ['highScore', 'totalStars', 'purchasedSkins', 'activeSkin', 'activePowerups'] 
                });
                
                if (storage.keys) {
                    const loadedStats = { highScore: 0, totalStars: 0 };
                    storage.keys.forEach(k => {
                        if (k.key === 'highScore') loadedStats.highScore = parseInt(k.value) || 0;
                        if (k.key === 'totalStars') loadedStats.totalStars = parseInt(k.value) || 0;
                        if (k.key === 'purchasedSkins') setPurchasedSkins(new Set<string>(JSON.parse(k.value || '[]') as string[]));
                        if (k.key === 'activeSkin') setActiveTvSkin(k.value || 'default');
                        if (k.key === 'activePowerups') setActivePowerups(new Set<string>(JSON.parse(k.value || '[]') as string[]));
                    });
                    setStats(loadedStats);
                }
            } catch (e) {
                console.error("VK Init Error", e);
            }
        };
        initVK();
    }, []);

    const updateStorage = (newHighScore: number, newStars: number, skins?: Set<string>, skin?: string, powerups?: Set<string>) => {
        try {
            vkBridge.send('VKWebAppStorageSet', { key: 'highScore', value: newHighScore.toString() });
            vkBridge.send('VKWebAppStorageSet', { key: 'totalStars', value: newStars.toString() });
            if (skins) vkBridge.send('VKWebAppStorageSet', { key: 'purchasedSkins', value: JSON.stringify(Array.from(skins)) });
            if (skin) vkBridge.send('VKWebAppStorageSet', { key: 'activeSkin', value: skin });
            if (powerups) vkBridge.send('VKWebAppStorageSet', { key: 'activePowerups', value: JSON.stringify(Array.from(powerups)) });
        } catch(e) { console.error(e); }
    };

    const handleWatchCartoon = () => {
        if (stats.totalStars >= 1000) {
            const randomC = CARTOONS[Math.floor(Math.random() * CARTOONS.length)];
            const newTotal = stats.totalStars - 1000;
            setStats(prev => ({ ...prev, totalStars: newTotal }));
            updateStorage(stats.highScore, newTotal, purchasedSkins, activeTvSkin, activePowerups);
            setCinemaCartoon(randomC);
        } else {
            showToast(T.ad_not_ready);
        }
    };

    const handlePurchase = (item: ShopItem) => {
        if (item.type === 'skin') {
            if (purchasedSkins.has(item.id)) {
                setActiveTvSkin(item.id);
                updateStorage(stats.highScore, stats.totalStars, purchasedSkins, item.id, activePowerups);
                showToast(lang === 'ru' ? "Дизайн изменен" : "TV skin changed");
                return;
            }
        } else {
            if (activePowerups.has(item.id)) {
                showToast(lang === 'ru' ? "Бонус уже активирован на эту игру" : "Already active for this game");
                return;
            }
        }
        
        if (stats.totalStars >= item.price) {
            setPurchaseModal({ item, success: false });
        } else {
            showToast(T.ad_not_ready);
        }
    };

    const handlePowerupByAd = async (itemId: string) => {
        if (activePowerups.has(itemId)) {
             showToast(lang === 'ru' ? "Бонус уже активирован" : "Already active");
             return;
        }
        try {
            await vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' });
            // Explicitly typing the new Set to avoid 'Set<unknown>' error in some build environments
            const newPowerups = new Set<string>(activePowerups).add(itemId);
            setActivePowerups(newPowerups);
            updateStorage(stats.highScore, stats.totalStars, purchasedSkins, activeTvSkin, newPowerups);
            showToast(lang === 'ru' ? "Бонус активирован!" : "Powerup activated!");
        } catch (e) {
            showToast(lang === 'ru' ? "Реклама недоступна" : "Ad unavailable");
        }
    };

    const confirmPurchase = () => {
        if (!purchaseModal) return;
        const item = purchaseModal.item;
        const newTotal = stats.totalStars - item.price;
        
        let newSkins = purchasedSkins;
        let newSkin = activeTvSkin;
        let newPowerups = activePowerups;

        if (item.type === 'skin') {
            // Explicitly typing the new Set to avoid 'Set<unknown>' error
            newSkins = new Set<string>(purchasedSkins).add(item.id);
            newSkin = item.id;
        } else {
            // Explicitly typing the new Set to avoid 'Set<unknown>' error
            newPowerups = new Set<string>(activePowerups).add(item.id);
        }

        setStats(prev => ({ ...prev, totalStars: newTotal }));
        setPurchasedSkins(newSkins);
        setActiveTvSkin(newSkin);
        setActivePowerups(newPowerups);
        
        updateStorage(stats.highScore, newTotal, newSkins, newSkin, newPowerups);
        setPurchaseModal({ item, success: true });
    };

    const startGame = () => {
        setScore(0);
        const bonusLives = activePowerups.has('shield') ? 1 : 0;
        const startingLives = 3 + bonusLives;
        setLives(startingLives);
        setMaxLives(startingLives);
        setLevel(1);
        setStars(0);
        setAnsweredCount(0);
        setSelectedId(null);
        setUsedQuestionIds(new Set<string>());
        setGameState('playing');
        nextQuestion(new Set<string>());
    };

    const nextQuestion = (used: Set<string>) => {
        setSelectedId(null);
        let available = CARTOONS.filter(c => !used.has(c.id));
        if (available.length === 0) {
            used.clear();
            available = CARTOONS;
        }
        const next = available[Math.floor(Math.random() * available.length)];
        // Explicitly typing the new Set to avoid 'Set<unknown>' error
        const nextUsed = new Set<string>(used);
        nextUsed.add(next.id);
        setUsedQuestionIds(nextUsed);

        setCurrentQuestion(next);
        const others = CARTOONS.filter(c => c.id !== next.id).sort(() => 0.5 - Math.random()).slice(0, 3);
        const roundOptions = [next, ...others].sort(() => 0.5 - Math.random());
        setOptions(roundOptions);
    };

    const handleAnswer = (selected: Cartoon) => {
        if (!currentQuestion || selectedId) return;
        setSelectedId(selected.id);
        const isCorrect = selected.id === currentQuestion.id;
        
        setTimeout(() => {
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
                    
                    const multiplier = activePowerups.has('boost') ? 2 : 1;
                    setStars(s => s + (1 * multiplier));
                    
                    if (!activePowerups.has('shield')) {
                        if (newLevel === 2) setMaxLives(2);
                        if (newLevel >= 3) setMaxLives(1);
                        setLives(l => Math.min(l, (newLevel === 2 ? 2 : (newLevel >= 3 ? 1 : 3))));
                    }
                }
            }
            setLastResult({ correct: isCorrect, correctItem: currentQuestion });
            setGameState('result');
        }, 1000);
    };

    const handleAdRevive = async () => {
        try {
            await vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' });
            setLives(1);
            setGameState('playing');
            nextQuestion(usedQuestionIds);
        } catch (e) {
            showToast(lang === 'ru' ? "Реклама недоступна" : "Ad unavailable");
        }
    };

    const handleNextResult = () => {
        if (lives <= 0) {
            setGameState('gameover');
        } else {
            setGameState('playing');
            nextQuestion(usedQuestionIds);
        }
    };

    const togglePause = () => setGameState(curr => curr === 'playing' ? 'paused' : 'playing');
    const goMenu = () => { 
        if (gameState === 'playing' || gameState === 'result' || gameState === 'gameover') {
            const newHighScore = Math.max(stats.highScore, score);
            const newTotalStars = stats.totalStars + stars;
            const emptyPowerups = new Set<string>();
            setStats({ highScore: newHighScore, totalStars: newTotalStars });
            setActivePowerups(emptyPowerups);
            updateStorage(newHighScore, newTotalStars, purchasedSkins, activeTvSkin, emptyPowerups);
        }
        setGameState('menu'); 
    };

    // --- Screens ---

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden pb-[140px]">
                <Toast message={toast} />
                <div className="max-w-md w-full bg-white border-[6px] border-soviet-dark rounded-[40px] shadow-menu-card relative overflow-hidden flex flex-col items-center p-8 animate-slide-up">
                    <div className="absolute top-0 inset-x-0 h-4 bg-soviet-red"></div>
                    <div className="mt-6 mb-8 text-center relative w-full flex flex-col items-center">
                        <div className="absolute top-2 left-2 opacity-10 -rotate-12"><Film size={48} className="text-soviet-red" /></div>
                        <div className="absolute bottom-2 right-2 opacity-10 rotate-12"><Film size={48} className="text-soviet-red" /></div>
                        <div className="font-ruslan text-[44px] sm:text-[56px] leading-[0.85] text-soviet-red flex flex-col items-center drop-shadow-sm uppercase">
                            <span>СОЮЗ</span><span className="relative z-10">МУЛЬТ</span><span>КВИЗ</span>
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-center gap-3 mb-8 opacity-70">
                         <div className="h-[1px] bg-gray-300 flex-1"></div>
                         <div className="flex items-center gap-2">
                            <Tv size={14} className="text-soviet-dark" />
                            <span className="font-oswald font-bold text-xs sm:text-sm text-soviet-dark tracking-[0.15em] uppercase whitespace-nowrap">{T.subtitle}</span>
                            <Tv size={14} className="text-soviet-dark" />
                         </div>
                         <div className="h-[1px] bg-gray-300 flex-1"></div>
                    </div>
                    <div className="flex gap-4 mb-8 w-full justify-center">
                        <div className="bg-[#fdf3cc] border-2 border-[#e6d8a2] rounded-[20px] px-4 py-3 flex flex-col items-center relative flex-1">
                             <div className="flex items-center gap-2 text-soviet-dark/60"><Trophy size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">{T.record}</span></div>
                             <span className="text-xl font-bold text-soviet-dark">{stats.highScore}</span>
                        </div>
                        <div className="bg-[#fdf3cc] border-2 border-[#e6d8a2] rounded-[20px] px-4 py-3 flex flex-col items-center relative flex-1">
                             <div className="flex items-center gap-2 text-soviet-dark/60"><Star size={14} fill="currentColor" /> <span className="text-[10px] font-bold uppercase tracking-widest">{T.stars}</span></div>
                             <span className="text-xl font-bold text-soviet-dark">{stats.totalStars}</span>
                        </div>
                    </div>
                    <div className="w-full space-y-4 px-2">
                        <Button fullWidth rounded onClick={startGame} className="py-5 text-xl sm:text-2xl tracking-[0.1em]"><Play size={24} fill="currentColor" /> {T.start}</Button>
                        <Button fullWidth rounded variant="secondary" onClick={() => setGameState('shop')} className="py-5 text-lg sm:text-xl tracking-[0.1em] border-none"><ShoppingCart size={24} /> {T.shop}</Button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-2 bg-soviet-red opacity-80"></div>
                </div>
                <AdBanner />
            </div>
        );
    }

    if (gameState === 'shop') {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-oswald paper-texture overflow-x-hidden pb-[140px]">
                <Toast message={toast} />
                <div className="max-w-md w-full bg-white border-4 border-soviet-dark p-6 rounded-[32px] shadow-hard-lg relative animate-slide-up">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-soviet-red text-soviet-cream px-8 py-2 border-2 border-black shadow-hard font-bold tracking-widest -rotate-1 text-xl rounded-full uppercase">{T.shop_title}</div>
                    <div className="mt-8 flex justify-between items-center mb-6 border-b-2 border-dashed border-black/10 pb-4">
                        <span className="font-ruslan text-2xl text-soviet-dark">{T.stars}</span>
                        <span className="font-bold text-xl bg-soviet-gold border-2 border-black px-4 py-1.5 flex items-center gap-2 shadow-hard-sm animate-wobble rounded-full">{stats.totalStars} <Star size={20} fill="black" /></span>
                    </div>
                    
                    <div className="bg-[#fff9e6] border-2 border-yellow-400 p-4 mb-4 shadow-hard-sm relative overflow-visible group rounded-2xl">
                        <div className="absolute -top-3 -right-2 bg-soviet-red text-white text-[9px] px-2 py-0.5 font-bold uppercase rotate-12 shadow-sm rounded border border-black/20 z-20 whitespace-nowrap min-w-[50px] text-center">{T.bonus}</div>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-soviet-gold border-2 border-black rounded-xl shadow-hard-sm group-hover:scale-110 transition-transform"><Camera size={24} className="text-black" /></div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-sm sm:text-base leading-tight uppercase tracking-tight">{T.earn_stars}</h4>
                                <p className="text-[9px] sm:text-[10px] text-gray-500 leading-tight">{T.watch_ad_desc}</p>
                            </div>
                            <button onClick={handleWatchCartoon} className="px-3 py-1.5 bg-soviet-green text-white border-2 border-black font-bold text-xs shadow-hard-sm active:translate-y-0.5 active:shadow-none rounded-lg">{T.earn}</button>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {SHOP_ITEMS.map(item => {
                            const isOwned = item.type === 'skin' ? purchasedSkins.has(item.id) : activePowerups.has(item.id);
                            const isActiveSkin = item.type === 'skin' && activeTvSkin === item.id;
                            const isShield = item.id === 'shield';
                            
                            let btnLabel = `${item.price} ⭐`;
                            if (isActiveSkin) btnLabel = "✓";
                            else if (isOwned) btnLabel = item.type === 'skin' ? "ВЫБРАТЬ" : "АКТИВНО";

                            return (
                                <div key={item.id} className={`flex items-center gap-4 bg-[#f8f8f8] border-2 ${isActiveSkin ? 'border-soviet-gold shadow-md' : 'border-black/5'} p-3 rounded-2xl shadow-sm hover:translate-x-1 transition-transform`}>
                                    <div className={`p-2.5 rounded-xl border-2 ${isActiveSkin ? 'bg-soviet-gold border-black' : 'bg-soviet-cream border-black/10'}`}>
                                        <item.icon size={22} className={isActiveSkin ? 'text-black' : 'text-soviet-red'} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-bold text-sm leading-none uppercase">{item.name[lang]}</h4>
                                        <p className="text-[10px] text-gray-500 leading-tight">{item.desc[lang]}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {(!isShield || isOwned) && (
                                            <button 
                                                disabled={stats.totalStars < item.price && !isOwned}
                                                onClick={() => handlePurchase(item)}
                                                className={`px-3 py-1.5 border-2 border-black font-bold text-[10px] shadow-hard-sm active:shadow-none active:translate-y-0.5 rounded-lg min-w-[70px] ${
                                                    isActiveSkin ? 'bg-soviet-green text-white' : 
                                                    isOwned ? (item.type === 'skin' ? 'bg-soviet-gold' : 'bg-soviet-green text-white cursor-default') :
                                                    (stats.totalStars >= item.price ? 'bg-white' : 'bg-gray-200 opacity-50')
                                                }`}
                                            >
                                                {btnLabel}
                                            </button>
                                        )}
                                        {isShield && !isOwned && (
                                            <button 
                                                onClick={() => handlePowerupByAd(item.id)}
                                                className="px-4 py-2.5 bg-soviet-gold text-soviet-dark border-2 border-black font-bold text-[10px] rounded-xl shadow-hard-sm flex items-center justify-center gap-2 active:translate-y-0.5 active:shadow-none transition-all uppercase whitespace-nowrap"
                                            >
                                                <MonitorPlay size={14} /> {T.free_via_ad}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Button fullWidth variant="secondary" onClick={() => setGameState('menu')} rounded><Home size={20} /> {T.menu}</Button>
                </div>
                <AdBanner />
            </div>
        );
    }

    if (gameState === 'gameover') {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-soviet-dark/95 font-oswald relative overflow-hidden pb-[140px]">
                 <Toast message={toast} />
                 <div className="max-w-md w-full bg-white border-4 border-black p-6 shadow-2xl relative rotate-1 animate-slide-up rounded-[40px]">
                    <h2 className="font-ruslan text-5xl mb-6 text-center text-soviet-dark drop-shadow-md uppercase">{T.gameover}</h2>
                    <div className="bg-soviet-cream border-2 border-black p-4 mb-6 text-center shadow-hard-sm rounded-3xl">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-1">{T.your_score}</p>
                        <p className="text-5xl font-bold text-soviet-red drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">{score}</p>
                        <div className="mt-3 flex justify-center items-center gap-2 font-bold bg-soviet-gold px-3 py-1 border-2 border-black shadow-hard-sm inline-flex rounded-full"><span>+{stars}</span> <Star size={16} fill="black" /></div>
                    </div>
                    <p className="text-center mb-6 italic font-serif text-gray-600 leading-relaxed px-4 text-sm">{T.gameover_msg}</p>
                    <div className="space-y-4">
                        <Button fullWidth rounded variant="accent" onClick={handleAdRevive} className="py-5 text-base border-2 border-black animate-float ring-4 ring-soviet-gold/40 shadow-[0_0_20px_rgba(244,196,48,0.4)]">
                            <MonitorPlay size={24} /> {T.revive_ad}
                        </Button>
                        <Button fullWidth rounded onClick={startGame} className="py-4 text-lg border-2 border-black">
                            <RotateCcw size={24} /> {T.revive}
                        </Button>
                        <Button fullWidth rounded variant="secondary" onClick={goMenu}><Home size={20} /> {T.menu}</Button>
                    </div>
                 </div>
                 <AdBanner />
            </div>
        );
    }

    if (gameState === 'result' && lastResult) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-soviet-cream paper-texture font-oswald overflow-hidden pb-[100px]">
                <div className={`max-w-md w-full bg-white border-4 border-black p-5 shadow-hard-lg relative animate-slide-up rounded-[32px] ${isWrong ? 'animate-shake' : ''}`}>
                    <div className={`absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-1.5 border-2 border-black font-ruslan text-2xl shadow-hard rounded-full ${lastResult.correct ? 'bg-soviet-green text-white rotate-1' : 'bg-soviet-red text-white -rotate-1'}`}>{lastResult.correct ? T.correct : T.wrong}</div>
                    <div className="mt-8 border-4 border-black bg-black rounded-[24px] overflow-hidden relative aspect-video shadow-inner-hard mb-4">
                        <img src={lastResult.correctItem.imageUrl} className="w-full h-full object-contain" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest animate-pulse"><div className="w-1 h-1 bg-white rounded-full"></div> REC</div>
                    </div>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-soviet-dark mb-2 leading-tight uppercase tracking-tight">{lastResult.correctItem[lang].title}</h3>
                        <div className="inline-block relative px-4"><p className="text-[11px] text-gray-700 italic font-serif py-2 border-y border-dashed border-gray-300">"{lastResult.correctItem[lang].desc}"</p></div>
                    </div>
                    <Button fullWidth rounded onClick={handleNextResult} className="py-3">{T.next} <Clapperboard size={18} /></Button>
                </div>
                <AdBanner />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col bg-soviet-cream font-oswald relative paper-texture overflow-x-hidden pb-[100px]">
            <Toast message={toast} />
            <div className="bg-soviet-red border-b-4 border-black p-2.5 pt-safe-top z-50 sticky top-0 shadow-hard w-full">
                <div className="max-w-lg mx-auto flex justify-between items-end gap-2 px-1">
                    <div className="bg-soviet-cream border-2 border-black px-2.5 py-1 shadow-hard-sm transform -rotate-1 min-w-[65px] rounded-lg">
                        <span className="block text-[8px] font-bold text-soviet-dark leading-none tracking-widest uppercase mb-0.5">{T.score}</span>
                        <span className="block text-xl font-bold text-soviet-red leading-none">{score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="flex flex-col items-center">
                             <div className="bg-soviet-dark text-soviet-gold text-[8px] px-1.5 rounded-t font-bold tracking-wider border-x-2 border-t-2 border-black/50 uppercase">{T.level}</div>
                             <div className="bg-soviet-gold text-soviet-dark font-bold text-xl px-3.5 border-2 border-black shadow-hard-sm leading-none py-1.5 rounded-b-lg">{level}</div>
                        </div>
                        <div className="flex gap-1 bg-black/15 p-1.5 rounded-xl border-2 border-black/20 shadow-inner">
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
                    <button onClick={togglePause} className="bg-soviet-cream border-2 border-black p-2 hover:bg-white active:scale-90 shadow-hard-sm rounded-full"><Settings size={20} className="text-soviet-dark" /></button>
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center p-3 w-full max-w-lg mx-auto relative z-0">
                {currentQuestion && (
                    <div className={`w-full space-y-4 sm:space-y-6 ${isWrong ? 'animate-shake' : ''}`}>
                         <div className="w-full flex flex-col items-center">
                             <TVFrame imageUrl={currentQuestion.imageUrl} label={T.tv_brand} skin={activeTvSkin} />
                             {activePowerups.size > 0 && (
                                <div className="mt-2 flex gap-2">
                                    {activePowerups.has('shield') && <div className="bg-soviet-green text-white text-[9px] px-3 py-1 rounded-full border-2 border-black shadow-hard-sm font-bold uppercase tracking-tight animate-float">Доп. жизнь активна</div>}
                                    {activePowerups.has('boost') && <div className="bg-soviet-gold text-soviet-dark text-[9px] px-3 py-1 rounded-full border-2 border-black shadow-hard-sm font-bold uppercase tracking-tight animate-float">Буст звезд активен</div>}
                                </div>
                             )}
                         </div>
                         <div className="relative transform -rotate-1 max-w-fit mx-auto scale-90">
                             <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-lg"></div>
                             <div className="relative bg-white border-2 border-black px-6 py-2 rounded-lg">
                                 <span className="font-bold tracking-[0.2em] text-soviet-dark text-sm block text-center uppercase whitespace-nowrap">{T.question}</span>
                             </div>
                         </div>
                         <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full pb-6">
                             {options.map((opt, idx) => {
                                 const isSelected = selectedId === opt.id;
                                 const isCorrect = opt.id === currentQuestion.id;
                                 let variant: any = "secondary";
                                 if (isSelected) { variant = isCorrect ? "correct" : "wrong"; }
                                 return (
                                     <Button 
                                        key={opt.id} rounded variant={variant} disabled={!!selectedId}
                                        className={`min-h-[60px] sm:min-h-[72px] text-[10px] sm:text-xs leading-tight normal-case text-left pl-3 sm:pl-6 flex justify-start items-center border-none ${!selectedId ? 'hover:scale-[1.02]' : ''}`}
                                        onClick={() => handleAnswer(opt)}
                                     >
                                         <span className={`font-bold mr-1.5 sm:mr-3 text-lg sm:text-xl font-ruslan ${isSelected ? 'text-white' : 'text-soviet-red opacity-80'}`}>{idx + 1}.</span>
                                         <span className="font-oswald font-bold uppercase tracking-tight line-clamp-2">{opt[lang].title}</span>
                                     </Button>
                                 );
                             })}
                         </div>
                    </div>
                )}
            </div>
            {gameState === 'paused' && (
                <div className="fixed inset-0 bg-soviet-dark/90 z-[100] flex items-center justify-center p-4">
                    <div className="bg-soviet-cream p-8 border-4 border-black w-full max-w-xs shadow-hard-lg text-center relative rotate-1 rounded-[32px]">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-soviet-red text-white px-8 py-2 font-ruslan tracking-widest text-2xl border-2 border-black shadow-hard-sm -rotate-2 rounded-full uppercase">{T.pause}</div>
                        <div className="space-y-4 mt-6">
                            <Button fullWidth rounded onClick={togglePause} variant="primary" className="py-4"><Play size={24} fill="currentColor" /> {T.resume}</Button>
                            <Button fullWidth rounded onClick={goMenu} variant="secondary"><Home size={20} /> {T.menu}</Button>
                        </div>
                    </div>
                </div>
            )}
            <AdBanner />
        </div>
    );
}
