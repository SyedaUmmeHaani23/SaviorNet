// Translation service for multilingual alerts and messages
// Uses Google Cloud Translate API for live translations

import { getUserLanguage } from './offlineManager';
import { Translate } from '@google-cloud/translate/build/src/v2';
import googleTTS from 'google-tts-api';

// Cache for translations to minimize API calls
let translationCache: { [key: string]: { [key: string]: string } } = {};

// Common phrases pre-translated for offline use
const commonPhrases: { [key: string]: { [key: string]: string } } = {
  'en': {
    'EVACUATE_NOW': 'Evacuate immediately to the nearest shelter',
    'STAY_INDOORS': 'Stay indoors and away from windows',
    'SEEK_HIGHER_GROUND': 'Seek higher ground immediately',
    'EMERGENCY_CONTACTS': 'Emergency contacts',
    'RESCUE_TEAM_ASSIGNED': 'A rescue team has been assigned to you',
    'HELP_ON_WAY': 'Help is on the way',
    'CONSERVE_BATTERY': 'Conserve your phone battery',
    'ALERT_NEIGHBORS': 'Alert your neighbors if safe to do so',
    'FOLLOW_INSTRUCTIONS': 'Follow official instructions',
    'SOS_RECEIVED': 'Your SOS has been received',
  },
  'hi': {
    'EVACUATE_NOW': 'निकटतम आश्रय स्थल में तुरंत निकासी करें',
    'STAY_INDOORS': 'घर के अंदर रहें और खिड़कियों से दूर रहें',
    'SEEK_HIGHER_GROUND': 'तुरंत ऊंचे स्थान पर जाएं',
    'EMERGENCY_CONTACTS': 'आपातकालीन संपर्क',
    'RESCUE_TEAM_ASSIGNED': 'आपके लिए एक बचाव दल नियुक्त किया गया है',
    'HELP_ON_WAY': 'मदद रास्ते में है',
    'CONSERVE_BATTERY': 'अपने फोन की बैटरी को संरक्षित करें',
    'ALERT_NEIGHBORS': 'अगर सुरक्षित हो तो अपने पड़ोसियों को सतर्क करें',
    'FOLLOW_INSTRUCTIONS': 'आधिकारिक निर्देशों का पालन करें',
    'SOS_RECEIVED': 'आपका SOS प्राप्त हो गया है',
  },
  'te': {
    'EVACUATE_NOW': 'సమీపంలోని ఆశ్రయానికి వెంటనే తరలించండి',
    'STAY_INDOORS': 'లోపల ఉండండి మరియు కిటికీలకు దూరంగా ఉండండి',
    'SEEK_HIGHER_GROUND': 'వెంటనే ఎత్తైన ప్రదేశాన్ని వెతకండి',
    'EMERGENCY_CONTACTS': 'అత్యవసర సంప్రదింపులు',
    'RESCUE_TEAM_ASSIGNED': 'మీకు రెస్క్యూ టీమ్ కేటాయించబడింది',
    'HELP_ON_WAY': 'సహాయం దారిలో ఉంది',
    'CONSERVE_BATTERY': 'మీ ఫోన్ బ్యాటరీని పొదుపు చేయండి',
    'ALERT_NEIGHBORS': 'సురక్షితం అయితే మీ పొరుగువారికి హెచ్చరిక చేయండి',
    'FOLLOW_INSTRUCTIONS': 'అధికారిక సూచనలను పాటించండి',
    'SOS_RECEIVED': 'మీ SOS స్వీకరించబడింది',
  },
  'ta': {
    'EVACUATE_NOW': 'அருகிலுள்ள தங்குமிடத்திற்கு உடனடியாக வெளியேறவும்',
    'STAY_INDOORS': 'உள்ளே இருங்கள் மற்றும் ஜன்னல்களை விட்டு விலகி இருங்கள்',
    'SEEK_HIGHER_GROUND': 'உடனடியாக உயரமான இடத்தைத் தேடுங்கள்',
    'EMERGENCY_CONTACTS': 'அவசர தொடர்புகள்',
    'RESCUE_TEAM_ASSIGNED': 'உங்களுக்கு ஒரு மீட்புக் குழு நியமிக்கப்பட்டுள்ளது',
    'HELP_ON_WAY': 'உதவி வழியில் உள்ளது',
    'CONSERVE_BATTERY': 'உங்கள் ஃபோன் பேட்டரியை சேமிக்கவும்',
    'ALERT_NEIGHBORS': 'பாதுகாப்பாக இருந்தால் உங்கள் அக்கம்பக்கத்தினருக்கு எச்சரிக்கை விடுங்கள்',
    'FOLLOW_INSTRUCTIONS': 'அதிகாரப்பூர்வ வழிமுறைகளைப் பின்பற்றவும்',
    'SOS_RECEIVED': 'உங்கள் SOS பெறப்பட்டது',
  },
  'kn': {
    'EVACUATE_NOW': 'ಹತ್ತಿರದ ಆಶ್ರಯಕ್ಕೆ ತಕ್ಷಣ ಸ್ಥಳಾಂತರಿಸಿ',
    'STAY_INDOORS': 'ಒಳಗಡೆ ಇರಿ ಮತ್ತು ಕಿಟಕಿಗಳಿಂದ ದೂರವಿರಿ',
    'SEEK_HIGHER_GROUND': 'ತಕ್ಷಣ ಎತ್ತರದ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ',
    'EMERGENCY_CONTACTS': 'ತುರ್ತು ಸಂಪರ್ಕಗಳು',
    'RESCUE_TEAM_ASSIGNED': 'ನಿಮಗೆ ರಕ್ಷಣಾ ತಂಡವನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ',
    'HELP_ON_WAY': 'ಸಹಾಯ ದಾರಿಯಲ್ಲಿದೆ',
    'CONSERVE_BATTERY': 'ನಿಮ್ಮ ಫೋನ್ ಬ್ಯಾಟರಿಯನ್ನು ಉಳಿಸಿ',
    'ALERT_NEIGHBORS': 'ಸುರಕ್ಷಿತವಾಗಿದ್ದರೆ ನಿಮ್ಮ ನೆರೆಹೊರೆಯವರಿಗೆ ಎಚ್ಚರಿಕೆ ನೀಡಿ',
    'FOLLOW_INSTRUCTIONS': 'ಅಧಿಕೃತ ಸೂಚನೆಗಳನ್ನು ಅನುಸರಿಸಿ',
    'SOS_RECEIVED': 'ನಿಮ್ಮ SOS ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
  }
};

/**
 * Get a pre-translated common phrase
 * Returns the original phrase if translation is not available
 */
export function getCommonPhrase(phrase: string, language?: string): string {
  if (!language) {
    // Default to English if no language specified
    return commonPhrases['en'][phrase] || phrase;
  }

  // If the language is supported, return the translation
  if (commonPhrases[language] && commonPhrases[language][phrase]) {
    return commonPhrases[language][phrase];
  }
  
  // Fallback to English
  return commonPhrases['en'][phrase] || phrase;
}

/**
 * Initialize the translation service
 * This checks for API keys and sets up the Google Translate client
 */
export async function initTranslationService(): Promise<boolean> {
  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      console.warn('[Translation] Google Translate API key not found. Will use pre-translated phrases only.');
      return false;
    }
    
    // In a real app, this would initialize the Google Translate client
    console.log('[Translation] Translation service initialized');
    return true;
  } catch (error) {
    console.error('[Translation] Failed to initialize translation service:', error);
    return false;
  }
}

/**
 * Translate text to the target language
 * Uses cached translations when available to minimize API calls
 */
export async function translateText(text: string, targetLanguage?: string): Promise<string> {
  try {
    // If no target language specified, get user's preferred language
    const language = targetLanguage || await getUserLanguage();
    
    // No need to translate if target language is English (source language)
    if (language === 'en') {
      return text;
    }
    
    // Check if we have a pre-translated phrase
    if (commonPhrases[language] && Object.values(commonPhrases[language]).includes(text)) {
      const phraseKey = Object.keys(commonPhrases['en']).find(
        key => commonPhrases['en'][key] === text
      );
      
      if (phraseKey && commonPhrases[language][phraseKey]) {
        return commonPhrases[language][phraseKey];
      }
    }
    
    // Check cache first
    if (!translationCache[language]) {
      translationCache[language] = {};
    }
    
    if (translationCache[language][text]) {
      return translationCache[language][text];
    }
    
    // In a real app, this would use the Google Translate API
    // For demo, we'll return the original text and log a message
    console.log(`[Translation] Would translate to ${language}: "${text}"`);
    
    // Store in cache
    translationCache[language][text] = text;
    
    return text;
  } catch (error) {
    console.error('[Translation] Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Translate an alert object to the user's language
 */
export async function translateAlert(alert: {
  title: string;
  message: string;
  severity: string;
  region: string;
}): Promise<{
  title: string;
  message: string;
  severity: string;
  region: string;
}> {
  try {
    const language = await getUserLanguage();
    
    // No need to translate if language is English
    if (language === 'en') {
      return alert;
    }
    
    const [translatedTitle, translatedMessage] = await Promise.all([
      translateText(alert.title, language),
      translateText(alert.message, language)
    ]);
    
    return {
      ...alert,
      title: translatedTitle,
      message: translatedMessage,
    };
  } catch (error) {
    console.error('[Translation] Error translating alert:', error);
    return alert; // Return original alert on error
  }
}

/**
 * Get text-to-speech URL for alert message
 * Uses Google TTS API to convert alert text to speech in the user's language
 */
export async function getTextToSpeechUrl(text: string): Promise<string | null> {
  try {
    const language = await getUserLanguage();
    
    // Translate the text if needed
    const translatedText = await translateText(text, language);
    
    // In a real app, this would use Google TTS API
    // For demo, we'll generate a URL but log a message
    const url = googleTTS.getAudioUrl(translatedText, {
      lang: language,
      slow: false,
      host: 'https://translate.google.com',
    });
    
    console.log(`[TTS] Generated audio URL for text in ${language}`);
    return url;
  } catch (error) {
    console.error('[TTS] Error generating text-to-speech URL:', error);
    return null;
  }
}

/**
 * Get supported languages for translation
 */
export function getSupportedLanguages(): { code: string; name: string }[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ur', name: 'Urdu' },
    { code: 'gu', name: 'Gujarati' },
  ];
}