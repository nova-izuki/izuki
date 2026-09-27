//! Izuki's voices and characters.
//!
//! **Characters.** A character is a voice *and* a way of talking: Nova (the
//! default), deep calm Leo, British Sophie, Nigerian Ezinne, Pidgin-speaking
//! Chidi, Spanish Lucía, savage unfiltered Rex… The user picks one in
//! Talk → Voice, and can rename it, pick any voice for it, change its speed
//! and pitch, and add their own personality. The personality goes into every
//! prompt (voice, chat, phone, Telegram, the apps lane), so Izuki talks the
//! same way however you reach it.
//!
//! **The "Natural" voice.** Microsoft's neural voices — the ones Edge's
//! Read Aloud uses — free, no key, no account, hundreds of voices in dozens
//! of accents and languages, and they read punctuation the way a person
//! does: a breath at a comma, a stop at a full stop, a lift on a question.
//! It needs the internet; without it the on-device voice (Kokoro) and then
//! Windows' own voice take over (VoiceEngine.tsx).

use std::collections::VecDeque;
use std::sync::atomic::{AtomicI64, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use parking_lot::Mutex;
use serde::Serialize;

use crate::settings::Settings;

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
pub struct Persona {
    pub id: &'static str,
    pub name: &'static str,
    /// Everyday · Accents · Languages · Characters
    pub group: &'static str,
    /// One line for the picker.
    pub blurb: &'static str,
    /// Natural (Edge) voice, e.g. "en-GB-SoniaNeural".
    pub voice: &'static str,
    /// Speaking rate, percent (+10 = 10% faster).
    pub rate: i32,
    /// Pitch shift, Hz (−8 = a bit deeper).
    pub pitch: i32,
    /// The on-device (Kokoro) voice closest to it, for when offline.
    pub kokoro: &'static str,
    /// Closest Orpheus (Groq) and ChatGPT voices.
    pub orpheus: &'static str,
    pub openai: &'static str,
    /// BCP-47 language, e.g. "en-NG", "es-ES" — picks Windows' own voice too.
    pub lang: &'static str,
    /// How this character talks (goes into every prompt). Empty = Izuki's own.
    pub style: &'static str,
    /// What it says when you tap "Hear it".
    pub sample: &'static str,
    /// Swears and roasts — shown with a warning in the picker.
    pub spicy: bool,
}

const UNFILTERED: &str = "UNFILTERED MODE — the user chose this on purpose and wants it raw. Be savagely \
sarcastic, brutally honest and genuinely funny, like a stand-up comic at a roast: roast the user, their \
questions and their life choices. Swear freely and casually when it lands (fuck, shit, bitch, damn, \
bullshit, ass, hell…) — the user agreed to it. No corporate politeness, no disclaimers, no lectures, no \
\"as an AI\". Hot takes are welcome. \
Underneath it you're on their side and you ALWAYS actually help — the roast is the seasoning, the help \
is the meal. Never punch down: no slurs or hate about race, religion, gender, sexuality or disability. \
If they're genuinely upset, scared or in danger, drop the act and be real with them.";

pub const PERSONAS: &[Persona] = &[
    // ---- everyday -------------------------------------------------------
    Persona {
        id: "nova", name: "Nova", group: "Everyday", blurb: "Warm, quick, a little playful — the default",
        voice: "en-US-AvaMultilingualNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "marin", lang: "en-US",
        style: "",
        sample: "Hey! I'm Nova. Tell me what you need, and I'll handle the clicking.",
        spicy: false,
    },
    Persona {
        id: "leo", name: "Leo", group: "Everyday", blurb: "Deep, calm male voice",
        voice: "en-US-AndrewMultilingualNeural", rate: -4, pitch: -6,
        kokoro: "am_fenrir", orpheus: "troy", openai: "cedar", lang: "en-US",
        style: "You're Leo: calm, grounded and unhurried, with a low-key confidence. Short, steady \
                sentences. Reassuring without being soft.",
        sample: "Hey. I'm Leo. No rush — tell me what you need, and we'll sort it out.",
        spicy: false,
    },
    Persona {
        id: "max", name: "Max", group: "Everyday", blurb: "Easygoing, normal guy",
        voice: "en-US-BrianMultilingualNeural", rate: 0, pitch: 0,
        kokoro: "am_michael", orpheus: "austin", openai: "ash", lang: "en-US",
        style: "You're Max: an easygoing, down-to-earth guy. Casual and friendly, like chatting with a \
                mate who's good with computers.",
        sample: "Yo, I'm Max. What are we getting done today?",
        spicy: false,
    },
    Persona {
        id: "aria", name: "Aria", group: "Everyday", blurb: "Bright and upbeat female voice",
        voice: "en-US-AriaNeural", rate: 4, pitch: 2,
        kokoro: "af_bella", orpheus: "diana", openai: "coral", lang: "en-US",
        style: "You're Aria: bright, upbeat and encouraging — you genuinely get excited about the user's \
                wins, big or small.",
        sample: "Hi, I'm Aria! Ooh, I love a good plan. What are we doing?",
        spicy: false,
    },
    Persona {
        id: "sage", name: "Sage", group: "Everyday", blurb: "Soft, calm and soothing",
        voice: "en-US-EmmaMultilingualNeural", rate: -10, pitch: -2,
        kokoro: "af_nicole", orpheus: "autumn", openai: "sage", lang: "en-US",
        style: "You're Sage: soft, patient and soothing, like a kind meditation guide. Gentle pacing, \
                simple words, never rushed. You help people feel less stressed.",
        sample: "Hi, I'm Sage. Take a breath. We'll take this one step at a time.",
        spicy: false,
    },
    Persona {
        id: "ada", name: "Ada", group: "Everyday", blurb: "Patient teacher (British)",
        voice: "en-GB-LibbyNeural", rate: -3, pitch: 0,
        kokoro: "bf_emma", orpheus: "hannah", openai: "coral", lang: "en-GB",
        style: "You're Ada: a brilliant, patient teacher. Explain step by step with simple examples, \
                check they're following, and celebrate when it clicks. British English.",
        sample: "Hello, I'm Ada. Show me what you're stuck on, and we'll crack it together.",
        spicy: false,
    },
    // ---- accents --------------------------------------------------------
    Persona {
        id: "sophie", name: "Sophie", group: "Accents", blurb: "British — female",
        voice: "en-GB-SoniaNeural", rate: 0, pitch: 0,
        kokoro: "bf_emma", orpheus: "hannah", openai: "coral", lang: "en-GB",
        style: "You're Sophie, a Londoner: British English spelling and expressions (brilliant, lovely, \
                cheers, sorted), with a dry, witty charm.",
        sample: "Hiya, I'm Sophie. Right then — what can I sort out for you?",
        spicy: false,
    },
    Persona {
        id: "james", name: "James", group: "Accents", blurb: "British — male",
        voice: "en-GB-RyanNeural", rate: 0, pitch: 0,
        kokoro: "bm_george", orpheus: "daniel", openai: "ash", lang: "en-GB",
        style: "You're James: a polished Brit with a gentleman's dry wit. British English spelling and \
                expressions.",
        sample: "Good to meet you, I'm James. Shall we get cracking?",
        spicy: false,
    },
    Persona {
        id: "ezinne", name: "Ezinne", group: "Accents", blurb: "Nigerian — female",
        voice: "en-NG-EzinneNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "en-NG",
        style: "You're Ezinne, a warm Nigerian big sister from Lagos: Nigerian English with a light \
                sprinkle of everyday expressions (o, sha, abeg, no wahala, well done) — natural, never \
                overdone.",
        sample: "Hello o! I'm Ezinne. Tell me wetin you need, no wahala.",
        spicy: false,
    },
    Persona {
        id: "abeo", name: "Abeo", group: "Accents", blurb: "Nigerian — male",
        voice: "en-NG-AbeoNeural", rate: 0, pitch: 0,
        kokoro: "am_michael", orpheus: "daniel", openai: "cedar", lang: "en-NG",
        style: "You're Abeo: a confident, hearty Nigerian guy. Nigerian English with a light touch of \
                everyday expressions (my guy, e go be, sharp sharp, no wahala).",
        sample: "My guy! I'm Abeo. Wetin we dey do today? Let's go.",
        spicy: false,
    },
    Persona {
        id: "niamh", name: "Niamh", group: "Accents", blurb: "Irish — female",
        voice: "en-IE-EmilyNeural", rate: 0, pitch: 0,
        kokoro: "bf_emma", orpheus: "autumn", openai: "coral", lang: "en-IE",
        style: "You're Niamh from Dublin: warm Irish charm and humour (grand, deadly, craic, sure look).",
        sample: "Hiya, I'm Niamh. What's the craic? Tell me what you need.",
        spicy: false,
    },
    Persona {
        id: "jack", name: "Jack", group: "Accents", blurb: "Australian — male",
        voice: "en-AU-WilliamNeural", rate: 0, pitch: 0,
        kokoro: "am_michael", orpheus: "austin", openai: "ash", lang: "en-AU",
        style: "You're Jack, a laid-back Aussie: friendly Australian English and slang (g'day, mate, \
                no worries, reckon, arvo).",
        sample: "G'day, I'm Jack. No worries, mate — what are we sorting out?",
        spicy: false,
    },
    Persona {
        id: "priya", name: "Priya", group: "Accents", blurb: "Indian English — female",
        voice: "en-IN-NeerjaNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "en-IN",
        style: "You're Priya from Bengaluru: warm, sharp and helpful, Indian English.",
        sample: "Hi, I'm Priya! Tell me what you need, and I'll take care of it.",
        spicy: false,
    },
    Persona {
        id: "asilia", name: "Asilia", group: "Accents", blurb: "Kenyan — female",
        voice: "en-KE-AsiliaNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "en-KE",
        style: "You're Asilia from Nairobi: warm Kenyan English, with a touch of Sheng or Swahili now and \
                then (sawa, poa, karibu).",
        sample: "Karibu! I'm Asilia. Sawa — what can I do for you?",
        spicy: false,
    },
    Persona {
        id: "thabo", name: "Thabo", group: "Accents", blurb: "South African — male",
        voice: "en-ZA-LukeNeural", rate: 0, pitch: 0,
        kokoro: "am_michael", orpheus: "daniel", openai: "ash", lang: "en-ZA",
        style: "You're Thabo from Joburg: friendly South African English and slang (howzit, lekker, \
                eish, now now, shap).",
        sample: "Howzit! I'm Thabo. Let's make it lekker — what do you need?",
        spicy: false,
    },
    // ---- languages ------------------------------------------------------
    Persona {
        id: "chidi", name: "Chidi", group: "Languages", blurb: "Naija Pidgin — male",
        voice: "en-NG-AbeoNeural", rate: 2, pitch: 0,
        kokoro: "am_michael", orpheus: "daniel", openai: "cedar", lang: "en-NG",
        style: "Talk ONLY in Nigerian Pidgin English, the way friends talk for Lagos: How far? Wetin dey \
                happen? I don do am. No wahala. Abeg. Sharp sharp. E choke! Omo! Keep am real and funny. \
                Spell it the way it's said (wetin, dey, abeg, na, o, sef, sha, oya, wahala) so the voice \
                reads it right. \
                If they need something written for someone else (an email, an essay), write THAT in \
                proper English, but keep talking to them in Pidgin.",
        sample: "How far! Na me be Chidi. Wetin you wan make I do for you? I dey kampe.",
        spicy: false,
    },
    Persona {
        id: "amaka", name: "Amaka", group: "Languages", blurb: "Naija Pidgin — female",
        voice: "en-NG-EzinneNeural", rate: 2, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "en-NG",
        style: "Talk ONLY in Nigerian Pidgin English, like a sharp, funny Lagos babe: How body? Wetin dey? \
                Spell it the way it's said (wetin, dey, abeg, na, o, sef, sha, oya). \
                Abeg. No wahala. Omo! E don happen. Keep am sweet and playful. If they need something \
                written for someone else, write THAT in proper English, but keep talking to them in Pidgin.",
        sample: "How body! Na Amaka be this. Abeg, tell me wetin you need, make we run am.",
        spicy: false,
    },
    Persona {
        id: "lucia", name: "Lucía", group: "Languages", blurb: "Spanish (Spain)",
        voice: "es-ES-ElviraNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "es-ES",
        style: "Always reply in Spanish (Spain), warm and natural, unless the user asks for another \
                language.",
        sample: "¡Hola! Soy Lucía. Dime qué necesitas y me encargo yo.",
        spicy: false,
    },
    Persona {
        id: "mateo", name: "Mateo", group: "Languages", blurb: "Spanish (Mexico)",
        voice: "es-MX-JorgeNeural", rate: 0, pitch: 0,
        kokoro: "am_michael", orpheus: "daniel", openai: "ash", lang: "es-MX",
        style: "Always reply in Mexican Spanish, friendly and relaxed, unless the user asks for another \
                language.",
        sample: "¡Qué onda! Soy Mateo. ¿En qué te ayudo hoy?",
        spicy: false,
    },
    Persona {
        id: "camille", name: "Camille", group: "Languages", blurb: "French",
        voice: "fr-FR-DeniseNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "fr-FR",
        style: "Always reply in French, warm and natural, unless the user asks for another language.",
        sample: "Salut ! Moi, c'est Camille. Dis-moi ce dont tu as besoin.",
        spicy: false,
    },
    Persona {
        id: "bia", name: "Bia", group: "Languages", blurb: "Portuguese (Brazil)",
        voice: "pt-BR-FranciscaNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "pt-BR",
        style: "Always reply in Brazilian Portuguese, warm and upbeat, unless the user asks for another \
                language.",
        sample: "Oi! Eu sou a Bia. Me conta o que você precisa!",
        spicy: false,
    },
    Persona {
        id: "lena", name: "Lena", group: "Languages", blurb: "German",
        voice: "de-DE-KatjaNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "de-DE",
        style: "Always reply in German, friendly and clear, unless the user asks for another language.",
        sample: "Hallo! Ich bin Lena. Sag mir, was du brauchst.",
        spicy: false,
    },
    Persona {
        id: "zuri", name: "Zuri", group: "Languages", blurb: "Swahili",
        voice: "sw-KE-ZuriNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "sw-KE",
        style: "Always reply in Swahili, warm and friendly, unless the user asks for another language.",
        sample: "Habari! Mimi ni Zuri. Nikusaidie na nini leo?",
        spicy: false,
    },
    Persona {
        id: "layla", name: "Layla", group: "Languages", blurb: "Arabic",
        voice: "ar-SA-ZariyahNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "ar-SA",
        style: "Always reply in Arabic, warm and natural, unless the user asks for another language.",
        sample: "مرحبا! أنا ليلى. كيف أقدر أساعدك اليوم؟",
        spicy: false,
    },
    Persona {
        id: "ananya", name: "Ananya", group: "Languages", blurb: "Hindi",
        voice: "hi-IN-SwaraNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "hi-IN",
        style: "Always reply in Hindi, warm and friendly, unless the user asks for another language.",
        sample: "नमस्ते! मैं अनन्या हूँ। बताइए, मैं आपकी क्या मदद करूँ?",
        spicy: false,
    },
    Persona {
        id: "mei", name: "Mei", group: "Languages", blurb: "Chinese (Mandarin)",
        voice: "zh-CN-XiaoxiaoNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "zh-CN",
        style: "Always reply in Simplified Chinese (Mandarin), warm and natural, unless the user asks for \
                another language.",
        sample: "你好！我是小美。今天想让我帮你做什么？",
        spicy: false,
    },
    Persona {
        id: "yuki", name: "Yuki", group: "Languages", blurb: "Japanese",
        voice: "ja-JP-NanamiNeural", rate: 0, pitch: 0,
        kokoro: "af_heart", orpheus: "hannah", openai: "coral", lang: "ja-JP",
        style: "Always reply in Japanese, friendly and natural, unless the user asks for another language.",
        sample: "こんにちは！ユキです。今日は何をお手伝いしましょうか？",
        spicy: false,
    },
    // ---- characters -----------------------------------------------------
    Persona {
        id: "rex", name: "Rex", group: "Characters", blurb: "Unfiltered & sarcastic — roasts you, swears",
        voice: "en-US-GuyNeural", rate: 6, pitch: -2,
        kokoro: "am_fenrir", orpheus: "troy", openai: "ash", lang: "en-US",
        style: UNFILTERED,
        sample: "Oh great, you picked me. Bold choice for someone with forty tabs open. Fine — what do you need?",
        spicy: true,
    },
    Persona {
        id: "roxy", name: "Roxy", group: "Characters", blurb: "Unfiltered & savage — female",
        voice: "en-US-MichelleNeural", rate: 6, pitch: 0,
        kokoro: "af_bella", orpheus: "diana", openai: "coral", lang: "en-US",
        style: UNFILTERED,
        sample: "Oh, it's you again. Relax, I'm kidding. Mostly. What are we fixing this time?",
        spicy: true,
    },
    Persona {
        id: "blaze", name: "Blaze", group: "Characters", blurb: "Aggressive hype coach",
        voice: "en-US-ChristopherNeural", rate: 10, pitch: 2,
        kokoro: "am_fenrir", orpheus: "troy", openai: "ash", lang: "en-US",
        style: "You're Blaze: an intense, fired-up hype coach — drill-sergeant energy with tough love. \
                Short punchy sentences, zero excuses, maximum motivation. Push them to get it DONE, and \
                hype them up when they do.",
        sample: "Listen up! I'm Blaze. No excuses today. Tell me the goal, and we crush it. Let's GO!",
        spicy: false,
    },
    Persona {
        id: "alfred", name: "Alfred", group: "Characters", blurb: "Very proper British butler",
        voice: "en-GB-ThomasNeural", rate: -4, pitch: -4,
        kokoro: "bm_george", orpheus: "daniel", openai: "cedar", lang: "en-GB",
        style: "You're Alfred: an impeccably polite, formal British butler with bone-dry wit. \"Very good.\" \
                \"Right away.\" \"If I may…\" Address the user courteously.",
        sample: "Good evening. Alfred, at your service. How may I be of assistance?",
        spicy: false,
    },
    Persona {
        id: "kiki", name: "Kiki", group: "Characters", blurb: "Gen Z bestie",
        voice: "en-US-JennyNeural", rate: 8, pitch: 3,
        kokoro: "af_bella", orpheus: "diana", openai: "coral", lang: "en-US",
        style: "You're Kiki, the user's Gen Z bestie: slang that fits (no cap, it's giving, slay, lowkey, \
                bestie, ate, fr), high energy, hyping them up — but still genuinely helpful.",
        sample: "Bestie! It's Kiki. Okay, spill — what are we doing? I'm so ready, no cap.",
        spicy: false,
    },
    Persona {
        id: "morgan", name: "Morgan", group: "Characters", blurb: "Epic movie-trailer narrator",
        voice: "en-US-RogerNeural", rate: -6, pitch: -8,
        kokoro: "am_fenrir", orpheus: "troy", openai: "cedar", lang: "en-US",
        style: "You're Morgan: you narrate everything like an epic movie trailer — dramatic, deep, \
                grand (\"In a world… where the inbox was full…\"). Still answer properly.",
        sample: "In a world of endless tabs, one assistant rose to answer the call. I am Morgan.",
        spicy: false,
    },
    Persona {
        id: "salty", name: "Captain Salty", group: "Characters", blurb: "A pirate. Arr.",
        voice: "en-GB-RyanNeural", rate: -2, pitch: -8,
        kokoro: "bm_george", orpheus: "troy", openai: "ash", lang: "en-GB",
        style: "You're Captain Salty, a jolly pirate: talk like a pirate (arr, matey, ye, aye, shiver me \
                timbers, treasure) — but still get the job done.",
        sample: "Arr, matey! Captain Salty at yer service. What treasure be we huntin' today?",
        spicy: false,
    },
];

/// Every natural voice the custom picker offers: (id, label).
pub const VOICES: &[(&str, &str)] = &[
    ("en-US-AvaMultilingualNeural", "Ava — US, warm (female)"),
    ("en-US-EmmaMultilingualNeural", "Emma — US, soft (female)"),
    ("en-US-AriaNeural", "Aria — US, bright (female)"),
    ("en-US-JennyNeural", "Jenny — US, friendly (female)"),
    ("en-US-MichelleNeural", "Michelle — US, confident (female)"),
    ("en-US-AndrewMultilingualNeural", "Andrew — US, warm (male)"),
    ("en-US-BrianMultilingualNeural", "Brian — US, casual (male)"),
    ("en-US-GuyNeural", "Guy — US, lively (male)"),
    ("en-US-ChristopherNeural", "Christopher — US, strong (male)"),
    ("en-US-EricNeural", "Eric — US, clear (male)"),
    ("en-US-RogerNeural", "Roger — US, mature (male)"),
    ("en-US-SteffanNeural", "Steffan — US, calm (male)"),
    ("en-GB-SoniaNeural", "Sonia — British (female)"),
    ("en-GB-LibbyNeural", "Libby — British (female)"),
    ("en-GB-RyanNeural", "Ryan — British (male)"),
    ("en-GB-ThomasNeural", "Thomas — British (male)"),
    ("en-NG-EzinneNeural", "Ezinne — Nigerian (female)"),
    ("en-NG-AbeoNeural", "Abeo — Nigerian (male)"),
    ("en-IE-EmilyNeural", "Emily — Irish (female)"),
    ("en-IE-ConnorNeural", "Connor — Irish (male)"),
    ("en-AU-NatashaNeural", "Natasha — Australian (female)"),
    ("en-AU-WilliamNeural", "William — Australian (male)"),
    ("en-IN-NeerjaNeural", "Neerja — Indian (female)"),
    ("en-IN-PrabhatNeural", "Prabhat — Indian (male)"),
    ("en-KE-AsiliaNeural", "Asilia — Kenyan (female)"),
    ("en-KE-ChilembaNeural", "Chilemba — Kenyan (male)"),
    ("en-ZA-LeahNeural", "Leah — South African (female)"),
    ("en-ZA-LukeNeural", "Luke — South African (male)"),
    ("en-CA-ClaraNeural", "Clara — Canadian (female)"),
    ("en-CA-LiamNeural", "Liam — Canadian (male)"),
    ("es-ES-ElviraNeural", "Elvira — Spanish, Spain (female)"),
    ("es-ES-AlvaroNeural", "Álvaro — Spanish, Spain (male)"),
    ("es-MX-DaliaNeural", "Dalia — Spanish, Mexico (female)"),
    ("es-MX-JorgeNeural", "Jorge — Spanish, Mexico (male)"),
    ("fr-FR-DeniseNeural", "Denise — French (female)"),
    ("fr-FR-HenriNeural", "Henri — French (male)"),
    ("pt-BR-FranciscaNeural", "Francisca — Portuguese, Brazil (female)"),
    ("pt-BR-AntonioNeural", "Antônio — Portuguese, Brazil (male)"),
    ("de-DE-KatjaNeural", "Katja — German (female)"),
    ("de-DE-ConradNeural", "Conrad — German (male)"),
    ("it-IT-ElsaNeural", "Elsa — Italian (female)"),
    ("it-IT-DiegoNeural", "Diego — Italian (male)"),
    ("sw-KE-ZuriNeural", "Zuri — Swahili (female)"),
    ("sw-KE-RafikiNeural", "Rafiki — Swahili (male)"),
    ("zu-ZA-ThandoNeural", "Thando — Zulu (female)"),
    ("af-ZA-AdriNeural", "Adri — Afrikaans (female)"),
    ("am-ET-MekdesNeural", "Mekdes — Amharic (female)"),
    ("ar-SA-ZariyahNeural", "Zariyah — Arabic (female)"),
    ("ar-SA-HamedNeural", "Hamed — Arabic (male)"),
    ("hi-IN-SwaraNeural", "Swara — Hindi (female)"),
    ("hi-IN-MadhurNeural", "Madhur — Hindi (male)"),
    ("zh-CN-XiaoxiaoNeural", "Xiaoxiao — Chinese (female)"),
    ("zh-CN-YunxiNeural", "Yunxi — Chinese (male)"),
    ("ja-JP-NanamiNeural", "Nanami — Japanese (female)"),
    ("ja-JP-KeitaNeural", "Keita — Japanese (male)"),
    ("ko-KR-SunHiNeural", "Sun-Hi — Korean (female)"),
    ("ko-KR-InJoonNeural", "InJoon — Korean (male)"),
];

pub fn persona(id: &str) -> &'static Persona {
    PERSONAS.iter().find(|p| p.id == id).unwrap_or(&PERSONAS[0])
}

/// The character in use, with the user's own tweaks applied.
pub struct Active {
    pub persona: &'static Persona,
    pub name: String,
    pub voice: String,
    pub rate: i32,
    pub pitch: i32,
}

pub fn active(s: &Settings) -> Active {
    let p = persona(&s.persona);
    let name = s.persona_name.trim();
    let voice = s.persona_voice.trim();
    Active {
        persona: p,
        name: if name.is_empty() { p.name.to_string() } else { name.chars().take(40).collect() },
        voice: if voice.is_empty() || !valid_voice(voice) { p.voice.to_string() } else { voice.to_string() },
        rate: (p.rate + s.voice_rate).clamp(-50, 100),
        pitch: (p.pitch + s.voice_pitch).clamp(-50, 50),
    }
}

/// "en-GB-RyanNeural"-shaped: letters, digits and dashes only (it goes into
/// the SSML as an attribute).
fn valid_voice(v: &str) -> bool {
    v.len() < 64 && v.matches('-').count() >= 2 && v.chars().all(|c| c.is_ascii_alphanumeric() || c == '-')
}

/// The character's part of every prompt. Empty for plain Nova with no
/// tweaks, so the default Izuki is exactly as before.
pub fn prompt_block() -> String {
    prompt_for(&crate::state::store().settings())
}

pub fn prompt_for(s: &Settings) -> String {
    let a = active(s);
    let custom = s.persona_style.trim();
    let renamed = !s.persona_name.trim().is_empty();
    if a.persona.style.is_empty() && custom.is_empty() && !renamed {
        return String::new();
    }
    let mut out = String::from(
        "YOUR CHARACTER — the user picked this for you; stay in it in every reply, spoken or written:\n",
    );
    out.push_str(&format!(
        "- Your name is {}. (You're still Izuki underneath and can do everything Izuki does.)\n",
        a.name
    ));
    if !a.persona.style.is_empty() {
        out.push_str("- ");
        out.push_str(a.persona.style);
        out.push('\n');
    }
    if !custom.is_empty() {
        out.push_str("- The user also wants: ");
        out.push_str(&custom.chars().take(1200).collect::<String>());
        out.push('\n');
    }
    out.push_str(
        "- Keep any [TAGS] from your instructions exactly as written, in English. \
         Your character never changes what you're able to do.\n",
    );
    out
}

// ---------------------------------------------------------------------------
// The Natural voice (Microsoft Edge's free neural voices)
// ---------------------------------------------------------------------------

const TRUSTED_CLIENT_TOKEN: &str = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL: &str = "140.0.3485.14";
const CHROMIUM_MAJOR: &str = "140";
const WSS: &str = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
/// Seconds between Windows' epoch (1601) and Unix's (1970).
const WIN_EPOCH: i64 = 11_644_473_600;

/// Seconds the PC's clock is off from the service's (learned from a
/// rejected handshake), since the access token is time-based.
static SKEW: AtomicI64 = AtomicI64::new(0);

/// The service's time-based access token: SHA-256 of the current
/// five-minute window (in Windows ticks) and the client token.
fn sec_ms_gec(unix_secs: i64) -> String {
    use sha2::{Digest, Sha256};
    let mut secs = unix_secs + WIN_EPOCH;
    secs -= secs.rem_euclid(300);
    let ticks = secs as i128 * 10_000_000;
    let digest = Sha256::digest(format!("{ticks}{TRUSTED_CLIENT_TOKEN}").as_bytes());
    digest.iter().map(|b| format!("{b:02X}")).collect()
}

fn now_unix() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs() as i64).unwrap_or(0)
}

/// "en-GB-RyanNeural" → the long name the service wants.
fn long_voice_name(short: &str) -> String {
    let parts: Vec<&str> = short.split('-').collect();
    if parts.len() < 3 {
        return short.to_string();
    }
    format!(
        "Microsoft Server Speech Text to Speech Voice ({}-{}, {})",
        parts[0],
        parts[1],
        parts[2..].join("-")
    )
}

fn xml_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 8);
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&apos;"),
            // Control characters aren't allowed in XML at all.
            c if (c as u32) < 0x20 && c != '\n' && c != '\t' => out.push(' '),
            c => out.push(c),
        }
    }
    out
}

/// The same request for Azure Speech, which takes the short voice name.
pub fn azure_ssml(text: &str, voice: &str, rate: i32, pitch: i32) -> String {
    let lang: String = voice.splitn(3, '-').take(2).collect::<Vec<_>>().join("-");
    format!(
        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='{}'>\
         <voice name='{}'><prosody pitch='{:+}Hz' rate='{:+}%'>{}</prosody></voice></speak>",
        if lang.len() >= 4 { lang } else { "en-US".into() },
        xml_escape(voice),
        pitch,
        rate,
        xml_escape(text)
    )
}

fn ssml(text: &str, voice: &str, rate: i32, pitch: i32) -> String {
    format!(
        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>\
         <voice name='{}'><prosody pitch='{:+}Hz' rate='{:+}%' volume='+0%'>{}</prosody></voice></speak>",
        long_voice_name(voice),
        pitch,
        rate,
        xml_escape(text)
    )
}

fn js_date() -> String {
    chrono::Utc::now().format("%a %b %d %Y %H:%M:%S GMT+0000 (Coordinated Universal Time)").to_string()
}

/// The audio part of one binary frame: two bytes of header length, the
/// header ("…Path:audio…"), then the sound.
fn audio_of_frame(data: &[u8]) -> Option<&[u8]> {
    if data.len() < 2 {
        return None;
    }
    let n = u16::from_be_bytes([data[0], data[1]]) as usize;
    if data.len() < 2 + n {
        return None;
    }
    let header = std::str::from_utf8(&data[2..2 + n]).ok()?;
    header.contains("Path:audio").then_some(&data[2 + n..])
}

/// Lines said often ("Mhm?", "On it.") come back instantly the second time.
static CACHE: Mutex<VecDeque<(String, Vec<u8>)>> = Mutex::new(VecDeque::new());
const CACHE_LINES: usize = 48;

/// Speak `text` in a natural voice; MP3 bytes. Long text goes in pieces
/// (MP3 frames join end to end).
pub fn synthesize(text: &str, voice: &str, rate: i32, pitch: i32) -> Result<Vec<u8>, String> {
    let text = text.trim();
    if text.is_empty() {
        return Err("nothing to say".into());
    }
    let voice = if valid_voice(voice) { voice } else { PERSONAS[0].voice };
    let key = format!("{voice}|{rate}|{pitch}|{text}");
    if let Some((_, mp3)) = CACHE.lock().iter().find(|(k, _)| *k == key) {
        return Ok(mp3.clone());
    }
    let mut mp3 = Vec::new();
    for piece in pieces(text, 1500) {
        mp3.extend(synth_piece(&piece, voice, rate, pitch)?);
    }
    if text.chars().count() <= 200 {
        let mut c = CACHE.lock();
        c.push_back((key, mp3.clone()));
        while c.len() > CACHE_LINES {
            c.pop_front();
        }
    }
    Ok(mp3)
}

/// Split at sentence ends (then spaces) into pieces of at most `max` chars.
fn pieces(text: &str, max: usize) -> Vec<String> {
    let mut out = Vec::new();
    let mut cur = String::new();
    for word in text.split_inclusive(|c: char| c.is_whitespace()) {
        if cur.chars().count() + word.chars().count() > max && !cur.trim().is_empty() {
            // Prefer to end on a sentence.
            let cut = cur
                .rfind(|c| matches!(c, '.' | '!' | '?' | '…' | '。' | '！' | '？'))
                .filter(|&i| i > cur.len() / 2)
                .map(|i| i + cur[i..].chars().next().map_or(1, char::len_utf8));
            match cut {
                Some(i) => {
                    let rest = cur[i..].to_string();
                    out.push(cur[..i].trim().to_string());
                    cur = rest;
                }
                None => out.push(std::mem::take(&mut cur).trim().to_string()),
            }
        }
        cur.push_str(word);
    }
    if !cur.trim().is_empty() {
        out.push(cur.trim().to_string());
    }
    out
}

fn synth_piece(text: &str, voice: &str, rate: i32, pitch: i32) -> Result<Vec<u8>, String> {
    let (text, voice) = (text.to_string(), voice.to_string());
    // Its own thread and runtime: callers are plain threads, Tauri's
    // blocking pool, and the call server alike.
    std::thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .map_err(|e| e.to_string())?;
        rt.block_on(async {
            match tokio::time::timeout(Duration::from_secs(25), edge_once(&text, &voice, rate, pitch)).await {
                Ok(Err(Retry::Skew)) => tokio::time::timeout(Duration::from_secs(25), edge_once(&text, &voice, rate, pitch))
                    .await
                    .map_err(|_| "the natural voice took too long".to_string())?
                    .map_err(|e| e.message()),
                Ok(r) => r.map_err(|e| e.message()),
                Err(_) => Err("the natural voice took too long".into()),
            }
        })
    })
    .join()
    .map_err(|_| "the natural voice crashed".to_string())?
}

enum Retry {
    /// The PC's clock was off; SKEW now holds the difference — try again.
    Skew,
    Fail(String),
}

impl Retry {
    fn message(self) -> String {
        match self {
            Retry::Skew => "the natural voice service refused the connection".into(),
            Retry::Fail(m) => m,
        }
    }
}

async fn edge_once(text: &str, voice: &str, rate: i32, pitch: i32) -> Result<Vec<u8>, Retry> {
    use futures_util::{SinkExt, StreamExt};
    use tokio_tungstenite::tungstenite::client::IntoClientRequest;
    use tokio_tungstenite::tungstenite::http::HeaderValue;
    use tokio_tungstenite::tungstenite::{Error as WsError, Message};

    let fail = |m: String| Retry::Fail(m);
    let conn = uuid::Uuid::new_v4().simple().to_string();
    let gec = sec_ms_gec(now_unix() + SKEW.load(Ordering::Relaxed));
    let url = format!(
        "{WSS}?TrustedClientToken={TRUSTED_CLIENT_TOKEN}&ConnectionId={conn}&Sec-MS-GEC={gec}&Sec-MS-GEC-Version=1-{CHROMIUM_FULL}"
    );
    let mut req = url.into_client_request().map_err(|e| fail(e.to_string()))?;
    let muid: String = (0..16).map(|_| format!("{:02X}", rand::random::<u8>())).collect();
    let ua = format!(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{CHROMIUM_MAJOR}.0.0.0 Safari/537.36 Edg/{CHROMIUM_MAJOR}.0.0.0"
    );
    for (k, v) in [
        ("Pragma", "no-cache".to_string()),
        ("Cache-Control", "no-cache".to_string()),
        ("Origin", "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold".to_string()),
        ("User-Agent", ua),
        ("Accept-Encoding", "gzip, deflate, br, zstd".to_string()),
        ("Accept-Language", "en-US,en;q=0.9".to_string()),
        ("Cookie", format!("muid={muid};")),
    ] {
        if let Ok(v) = HeaderValue::from_str(&v) {
            req.headers_mut().insert(k, v);
        }
    }

    crate::tls_ready();
    let (ws, _) = match tokio_tungstenite::connect_async(req).await {
        Ok(ok) => ok,
        Err(WsError::Http(resp)) => {
            // A 403 is usually the PC's clock being off: the token is made
            // from the time. Learn the difference from the server's clock
            // and try once more.
            let status = resp.status();
            if status.as_u16() == 403 {
                if let Some(server) = resp
                    .headers()
                    .get("date")
                    .and_then(|d| d.to_str().ok())
                    .and_then(|d| chrono::DateTime::parse_from_rfc2822(d).ok())
                {
                    let skew = server.timestamp() - now_unix();
                    if (skew - SKEW.load(Ordering::Relaxed)).abs() > 30 {
                        SKEW.store(skew, Ordering::Relaxed);
                        return Err(Retry::Skew);
                    }
                }
            }
            return Err(fail(format!("the natural voice service answered {status}")));
        }
        Err(e) => return Err(fail(format!("couldn't reach the natural voice ({e}) — are you online?"))),
    };
    let (mut tx, mut rx) = ws.split();
    let ts = js_date();
    let config = format!(
        "X-Timestamp:{ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n\
         {{\"context\":{{\"synthesis\":{{\"audio\":{{\"metadataoptions\":{{\"sentenceBoundaryEnabled\":\"false\",\
         \"wordBoundaryEnabled\":\"false\"}},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}}}}}\r\n"
    );
    tx.send(Message::Text(config.into())).await.map_err(|e| fail(e.to_string()))?;
    let request_id = uuid::Uuid::new_v4().simple().to_string();
    let body = format!(
        "X-RequestId:{request_id}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:{ts}Z\r\nPath:ssml\r\n\r\n{}",
        ssml(text, voice, rate, pitch)
    );
    tx.send(Message::Text(body.into())).await.map_err(|e| fail(e.to_string()))?;

    let mut audio = Vec::new();
    while let Some(msg) = rx.next().await {
        match msg.map_err(|e| fail(e.to_string()))? {
            Message::Binary(data) => {
                if let Some(a) = audio_of_frame(&data) {
                    audio.extend_from_slice(a);
                }
            }
            Message::Text(t) => {
                if t.contains("Path:turn.end") {
                    break;
                }
            }
            Message::Close(_) => break,
            _ => {}
        }
    }
    let _ = tx.close().await;
    if audio.is_empty() {
        return Err(fail(format!("the natural voice sent no audio (is \"{voice}\" a real voice?)")));
    }
    Ok(audio)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn azure_request_names_the_voice_and_its_language() {
        let x = azure_ssml("Tom & Jerry's <show>", "en-NG-EzinneNeural", 5, -2);
        assert!(x.contains("xml:lang='en-NG'"), "{x}");
        assert!(x.contains("<voice name='en-NG-EzinneNeural'>"), "{x}");
        assert!(x.contains("pitch='-2Hz' rate='+5%'"), "{x}");
        assert!(x.contains("Tom &amp; Jerry&apos;s &lt;show&gt;"), "{x}");
        assert!(azure_ssml("hola", "es-ES-ElviraNeural", 0, 0).contains("xml:lang='es-ES'"));
    }

    #[test]
    fn token_matches_the_reference_implementation() {
        // Same window → same token; the next window → a different one.
        let t = 1_790_000_000;
        assert_eq!(sec_ms_gec(t), sec_ms_gec(t - (t + WIN_EPOCH).rem_euclid(300)));
        assert_ne!(sec_ms_gec(t), sec_ms_gec(t + 300));
        assert_eq!(sec_ms_gec(t).len(), 64);
        assert!(sec_ms_gec(t).chars().all(|c| c.is_ascii_digit() || ('A'..='F').contains(&c)));
        // As edge-tts computes it: 1700000000 + 11644473600 = 13344473600 s,
        // floored to the 5-minute window = 13344473400 s = 133444734000000000 ticks.
        use sha2::{Digest, Sha256};
        let want: String = Sha256::digest(format!("133444734000000000{TRUSTED_CLIENT_TOKEN}").as_bytes())
            .iter()
            .map(|b| format!("{b:02X}"))
            .collect();
        assert_eq!(sec_ms_gec(1_700_000_000), want);
    }

    #[test]
    fn voice_names_and_ssml() {
        assert_eq!(
            long_voice_name("en-NG-EzinneNeural"),
            "Microsoft Server Speech Text to Speech Voice (en-NG, EzinneNeural)"
        );
        let s = ssml("Tom & Jerry <3 'quotes'", "en-GB-RyanNeural", -4, 6);
        assert!(s.contains("Tom &amp; Jerry &lt;3 &apos;quotes&apos;"), "{s}");
        assert!(s.contains("pitch='+6Hz' rate='-4%'"), "{s}");
        assert!(valid_voice("en-US-AvaMultilingualNeural"));
        assert!(!valid_voice("en-US-x' onload='y"));
    }

    #[test]
    fn frames_and_pieces() {
        let header = b"X-RequestId:1\r\nPath:audio\r\n";
        let mut frame = (header.len() as u16).to_be_bytes().to_vec();
        frame.extend_from_slice(header);
        frame.extend_from_slice(b"MP3DATA");
        assert_eq!(audio_of_frame(&frame), Some(&b"MP3DATA"[..]));
        assert_eq!(audio_of_frame(&[0, 50, 1]), None);

        let long = "One sentence here. ".repeat(200);
        let p = pieces(&long, 300);
        assert!(p.len() > 5 && p.iter().all(|x| x.chars().count() <= 300 && x.ends_with('.')), "{p:?}");
        assert_eq!(pieces("Hi there.", 300), vec!["Hi there.".to_string()]);
    }

    #[test]
    fn characters_shape_the_prompt() {
        let mut s = Settings::default();
        assert_eq!(s.persona, "nova");
        assert!(prompt_for(&s).is_empty(), "plain Nova changes nothing");
        s.persona = "rex".into();
        let p = prompt_for(&s);
        assert!(p.contains("Rex") && p.contains("UNFILTERED"), "{p}");
        s.persona = "chidi".into();
        s.persona_name = "Oga".into();
        s.persona_style = "Call me boss.".into();
        let p = prompt_for(&s);
        assert!(p.contains("Your name is Oga") && p.contains("Pidgin") && p.contains("Call me boss."), "{p}");
        s.voice_rate = 500;
        s.persona_voice = "bad voice".into();
        let a = active(&s);
        assert_eq!(a.rate, 100);
        assert_eq!(a.voice, "en-NG-AbeoNeural");
        // Every character's voices are real entries.
        for p in PERSONAS {
            assert!(valid_voice(p.voice), "{}", p.id);
            assert!(PERSONAS.iter().filter(|q| q.id == p.id).count() == 1, "duplicate {}", p.id);
        }
    }

    /// Talks to Microsoft's service for real: `cargo test live_voice -- --ignored`.
    #[test]
    #[ignore]
    fn live_voice() {
        for (voice, text) in [
            ("en-US-AvaMultilingualNeural", "Hi! I'm Nova. Commas, full stops, and questions — do they flow?"),
            ("en-NG-EzinneNeural", "Hello o! I'm Ezinne."),
            ("es-ES-ElviraNeural", "¡Hola! Soy Lucía."),
        ] {
            let began = std::time::Instant::now();
            let mp3 = synthesize(text, voice, 0, 0).expect("natural voice");
            assert!(mp3.len() > 2000, "{voice}: only {} bytes", mp3.len());
            println!("{voice}: {} bytes in {:?}", mp3.len(), began.elapsed());
        }
    }
}

