import { Cartoon } from './types';

export const CARTOONS: Cartoon[] = [
  { id: "nu_pogodi", imageUrl: "images/nu_pogodi.jpg", ru: { title: "Ну, погоди!", desc: "Легендарная погоня Волка за Зайцем." }, en: { title: "Well, Just You Wait!", desc: "Legendary chase of the Wolf after the Hare." }, tr: { title: "Seni Gidi Seni!", desc: "Kurt'un Tavşan'ı efsanevi kovalamacası." } },
  { id: "vinni", imageUrl: "images/vinni.jpg", ru: { title: "Винни-Пух", desc: "Винни-Пуха озвучивал Евгений Леонов." }, en: { title: "Winnie-the-Pooh", desc: "Soviet version of the famous bear." }, tr: { title: "Winnie-the-Pooh", desc: "Ünlü ayının Sovyet версиону." } },
  { id: "prostokvashino", imageUrl: "images/prostokvashino.jpg", ru: { title: "Простоквашино", desc: "Дядя Фёдор уехал жить с котом и псом." }, en: { title: "Prostokvashino", desc: "A boy lives in a village with a cat and a dog." }, tr: { title: "Prostokvaşino", desc: "Bir çocuk köyde kedi ve köpekle yaşar." } },
  { id: "bremenskie", imageUrl: "images/bremenskie.jpg", ru: { title: "Бременские музыканты", desc: "Музыкальная фантазия с элементами рок-н-ролла." }, en: { title: "Bremen Musicians", desc: "Musical fantasy with rock-n-roll elements." }, tr: { title: "Bremen Mızıkacıлары", desc: "Rock-n-roll öğeleri içeren müzikal fantezi." } },
  { id: "ezhik", imageUrl: "images/ezhik.jpg", ru: { title: "Ёжик в тумане", desc: "Признан лучшим мультфильмом всех времён." }, en: { title: "Hedgehog in the Fog", desc: "Acclaimed as the best cartoon of all time." }, tr: { title: "Sisteki Kirpi", desc: "Tüm zamanların en iyi çizги filmi seçildi." } },
  { id: "karlson", imageUrl: "images/karlson.jpg", ru: { title: "Малыш и Карлсон", desc: "История о человеке, который живет на крыше." }, en: { title: "Kid and Karlsson", desc: "Story about a man who lives on the roof." }, tr: { title: "Çocuk ve Karlsson", desc: "Çatıda yaşayan bir adamın hikayesi." } },
  { id: "pes", imageUrl: "images/pes.jpg", ru: { title: "Жил-был пёс", desc: "Фраза «Щас спою!» стала крылатой." }, en: { title: "Once Upon a Dog", desc: "The phrase 'I'll sing now!' became legendary." }, tr: { title: "Bir Zamanlar Bir Köpek", desc: "'Şimdi şarkı söyleyeceğim!' efsane oldu." } },
  { id: "taina", imageUrl: "images/taina.jpg", ru: { title: "Тайна третьей планеты", desc: "Фантастическое путешествие Алисы Селезнёвой." }, en: { title: "Mystery of the Third Planet", desc: "Sci-fi adventure of Alice Selezneva." }, tr: { title: "Üçüncü Gezegenin Sırrı", desc: "Alice Selezneva'nın bilim kurgu macerası." } },
  { id: "korabl", imageUrl: "images/korabl.jpg", ru: { title: "Летучий корабль", desc: "Мюзикл про любовь и летучий корабль." }, en: { title: "The Flying Ship", desc: "Musical about love and a flying ship." }, tr: { title: "Uçan Gemi", desc: "Aşk ve uçан gemi hakkında müzikal." } },
  { id: "gena", imageUrl: "images/gena.jpg", ru: { title: "Крокодил Гена", desc: "Здесь впервые прозвучала песня про день рождения." }, en: { title: "Gena the Crocodile", desc: "First appearance of the famous birthday song." }, tr: { title: "Timsah Gena", desc: "Ünlü doğum günü şarkısının ilk çıkışı." } },
  { id: "leopold", imageUrl: "images/leopold.jpg", ru: { title: "Кот Леопольд", desc: "Ребята, давайте жить дружно!" }, en: { title: "Leopold the Cat", desc: "Guys, let's live friendly!" }, tr: { title: "Kedi Leopold", desc: "Çocuklar, dostça yaşayalım!" } },
  { id: "kesha", imageUrl: "images/kesha.jpg", ru: { title: "Попугай Кеша", desc: "Таити, Таити... Нас и здесь неплохо кормят!" }, en: { title: "Parrot Kesha", desc: "Tahiti, Tahiti... We are fed well here too!" }, tr: { title: "Papağan Kesha", desc: "Tahiti, Tahiti... Burada da iyi besleniyoruz!" } },
  { id: "sneg", imageUrl: "images/sneg.jpg", ru: { title: "Падал прошлогодний снег", desc: "Маловато будет!" }, en: { title: "Last Year's Snow Was Falling", desc: "It won't be enough!" }, tr: { title: "Geçen Yılın Karı Yağıyordu", desc: "Bu yetmeyecek!" } },
  { id: "umka", imageUrl: "images/umka.jpg", ru: { title: "Умка", desc: "История о белом медвежонке." }, en: { title: "Umka", desc: "Story about a polar bear cub." }, tr: { title: "Umka", desc: "Kutup ayısı yavrusu hakkında hikaye." } },
  { id: "maugli", imageUrl: "images/maugli.jpg", ru: { title: "Маугли", desc: "Советская экранизация Киплинга." }, en: { title: "Mowgli", desc: "Soviet adaptation of Kipling." }, tr: { title: "Mowgli", desc: "Kipling'in Sovyet uyarlaması." } },
  { id: "cheburashka", imageUrl: "images/cheburashka.jpg", ru: { title: "Чебурашка", desc: "Неизвестный науке зверь с большими ушами." }, en: { title: "Cheburashka", desc: "A creature unknown to science with big ears." }, tr: { title: "Cheburashka", desc: "Bilimin tanımadığı büyük kulaklı bir yaratık." } },
  { id: "vovka", imageUrl: "images/vovka.jpg", ru: { title: "Вовка в Тридевятом царстве", desc: "«И так сойдёт!» — девиз лентяя Вовки." }, en: { title: "Vovka in the Far Far Away Kingdom", desc: "'Good enough!' is the motto of lazy Vovka." }, tr: { title: "Vovka Uzak Krallıkta", desc: "'Böyle de olur!' tembel Vovka'nın sloganıdır." } },
  { id: "popugaev", imageUrl: "images/popugaev.jpg", ru: { title: "38 попугаев", desc: "А в попугаях-то я гораздо длиннее!" }, en: { title: "38 Parrots", desc: "I am much longer in parrots!" }, tr: { title: "38 Papağan", desc: "Papağanlarla ölçülünce çok daha uzunum!" } },
  { id: "kuzya", imageUrl: "images/kuzya.jpg", ru: { title: "Домовёнок Кузя", desc: "Я не жадный, я домовитый!" }, en: { title: "Kuzya the Brownie", desc: "I am not greedy, I am thrifty!" }, tr: { title: "Ev Cini Kuzya", desc: "Cimri değilim, tutumluyum!" } },
  { id: "funtik", imageUrl: "images/funtik.jpg", ru: { title: "Приключения Фунтика", desc: "Подайте на домики для бездомных поросят!" }, en: { title: "Adventures of Funtik", desc: "Donate for houses for homeless piglets!" }, tr: { title: "Funtik'in Maceraları", desc: "Evsiz domuz yavruları için bağış yapın!" } },
  { id: "gav", imageUrl: "images/gav.jpg", ru: { title: "Котёнок по имени Гав", desc: "Давай бояться вместе!" }, en: { title: "A Kitten Named Woof", desc: "Let's be afraid together!" }, tr: { title: "Hav Adında Bir Yavru Kedi", desc: "Birlikte korkalım!" } },
  { id: "ostrov", imageUrl: "images/ostrov.jpg", ru: { title: "Остров сокровищ", desc: "Гротескная экранизация с музыкальными вставками." }, en: { title: "Treasure Island", desc: "Grotesque adaptation with musical interludes." }, tr: { title: "Define Adası", desc: "Müzikal bölümleri olan grotesk bir uyarlama." } },
  { id: "varezhka", imageUrl: "images/varezhka.jpg", ru: { title: "Варежка", desc: "Девочка так хотела собаку, что варежка ожила." }, en: { title: "The Mitten", desc: "A girl wanted a dog so much that her mitten came to life." }, tr: { title: "Eldiven", desc: "Kız o kadar çok köpek istedi ki eldiveni canlandı." } },
  { id: "ded_moroz", imageUrl: "images/ded_moroz.jpg", ru: { title: "Дед Мороз и лето", desc: "Дед Мороз узнает, что такое лето." }, en: { title: "Father Frost and Summer", desc: "Santa Claus finds out what summer is." }, tr: { title: "Ded Moroz ve Yaz", desc: "Noel Baba yazın ne olduğunu öğrenir." } },
  { id: "chipollino", imageUrl: "images/chipollino.jpg", ru: { title: "Чиполлино", desc: "Революция овощей против синьора Помидора." }, en: { title: "Chipollino", desc: "Vegetable revolution against Signor Tomato." }, tr: { title: "Cipollino", desc: "Sinyor Domates'e karşı sebze devrimi." } },
  { id: "antelopa", imageUrl: "images/antelopa.jpg", ru: { title: "Золотая антилопа", desc: "Антилопа выбивала золотые монеты копытами." }, en: { title: "The Golden Antelope", desc: "The antelope struck gold coins with its hooves." }, tr: { title: "Altın Antilop", desc: "Antilop toynaklarıyla altın para basıyordu." } },
  { id: "alenkiy", imageUrl: "images/alenkiy.jpg", ru: { title: "Аленький цветочек", desc: "Сказка о любви красавицы и чудовища." }, en: { title: "The Scarlet Flower", desc: "A fairy tale about the love of beauty and the beast." }, tr: { title: "Kızıl Çiçek", desc: "Güzel ve Çirkin'in aşkını anlatan bir masal." } }
];

export const TRANSLATIONS = {
    ru: { 
        title: "СоюзМультКвиз", subtitle: "МУЛЬТФИЛЬМЫ СССР", start: "ИГРАТЬ", shop: "МАГАЗИН", score: "СЧЕТ", level: "УРОВЕНЬ", record: "РЕКОРД", stars: "ЗВЕЗДЫ", 
        question: "ОТКУДА ЭТО?", frame_label: "КАДР ИЗ МУЛЬТФИЛЬМА", next: "ДАЛЕЕ", correct: "ВЕРНО!", wrong: "ОШИБКА!", gameover: "КОНЕЦ ФИЛЬМА", 
        your_score: "ВАШ РЕЗУЛЬТАТ", gameover_msg: "Плёнка оборвалась! Но вы можете склеить её.", revive: "ВОСКРЕСНУТЬ (+1 ❤)", ad_hint: "Смотреть рекламу", 
        menu: "В МЕНЮ", resume: "ПРОДОЛЖИТЬ", pause: "ПАУЗА", shop_title: "ЛАВКА", shop_msg: "Новинки скоро!", tv_brand: "РУБИН", 
        bonus: "БОНУС", earn_stars: "ПОЛУЧИТЬ ЗВЕЗДЫ", watch_ad_desc: "Смотри рекламу — получай +5 ⭐", earn: "ПОЛУЧИТЬ"
    },
    en: { 
        title: "SovietToonQuiz", subtitle: "USSR CARTOONS", start: "PLAY", shop: "SHOP", score: "SCORE", level: "LEVEL", record: "BEST", stars: "STARS", 
        question: "WHICH ONE?", frame_label: "SCENE FROM CARTOON", next: "NEXT", correct: "CORRECT!", wrong: "WRONG!", gameover: "THE END", 
        your_score: "YOUR SCORE", gameover_msg: "The film broke! But you can fix it.", revive: "REVIVE (+1 ❤)", ad_hint: "Watch Ad", 
        menu: "MENU", resume: "RESUME", pause: "PAUSED", shop_title: "STORE", shop_msg: "New items coming soon!", tv_brand: "RUBIN",
        bonus: "BONUS", earn_stars: "GET STARS", watch_ad_desc: "Watch ad — get +5 ⭐", earn: "GET"
    },
    tr: { 
        title: "SovyetQuiz", subtitle: "SSCB ÇİZGİ FİLMLERİ", start: "OYNA", shop: "MAĞAZA", score: "PUAN", level: "SEVİYE", record: "REKOR", stars: "YILDIZLAR", 
        question: "HANGİSИ?", frame_label: "KARE", next: "SONRAKİ", correct: "DOĞRU!", wrong: "YANLIŞ!", gameover: "FİLMİN SONU", 
        your_score: "PUANINIZ", gameover_msg: "Film koptu! Ama tamir edebilirsin.", revive: "CANLAN (+1 ❤)", ad_hint: "Reklam izle", 
        menu: "MENÜ", resume: "DEVAM", pause: "DURAKLATILDI", shop_title: "DÜKKAN", shop_msg: "Yeni ürünler yakında!", tv_brand: "RUBIN",
        bonus: "BONUS", earn_stars: "YILDIZ KAZAN", watch_ad_desc: "Reklam izle — +5 ⭐ kazan", earn: "KAZAN"
    }
};