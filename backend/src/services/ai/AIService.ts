import OpenAI from 'openai';
import axios from 'axios';

export class AIService {
  private openai: OpenAI | null = null;
  private aiProvider: 'openai' | 'openrouter' | 'gemini' = 'openai';
  public openrouterApiKey: string | null = null;
  public geminiApiKey: string | null = null;

  constructor() {
    // Sjekk hvilken provider som skal brukes
    const provider = process.env.AI_PROVIDER || 'openai';
    
    if (provider === 'openrouter') {
      this.aiProvider = 'openrouter';
      this.openrouterApiKey = process.env.OPENROUTER_API_KEY || null;
      console.log('🔍 AIService - Using OpenRouter (GRATIS tier)');
      console.log(`   API Key exists: ${!!this.openrouterApiKey}`);
      if (this.openrouterApiKey) {
        console.log('✅ OpenRouter API key found - using gratis modeller!');
      } else {
        console.warn('⚠️  OpenRouter API key not found. Get one at: https://openrouter.ai/keys');
      }
    } else if (provider === 'gemini') {
      this.aiProvider = 'gemini';
      this.geminiApiKey = process.env.GEMINI_API_KEY || null;
      console.log('🔍 AIService - Using Google Gemini (GRATIS tier)');
      console.log(`   API Key exists: ${!!this.geminiApiKey}`);
      if (this.geminiApiKey) {
        console.log('✅ Gemini API key found - using gratis tier!');
      } else {
        console.warn('⚠️  Gemini API key not found. Get one at: https://aistudio.google.com/app/apikey');
      }
    } else {
      // Standard OpenAI
      this.aiProvider = 'openai';
      const apiKey = process.env.OPENAI_API_KEY;
      console.log('🔍 AIService - Using OpenAI');
      console.log(`   API Key exists: ${!!apiKey}`);
      console.log(`   API Key starts with sk-: ${apiKey?.startsWith('sk-')}`);
      console.log(`   API Key length: ${apiKey?.length || 0}`);
      if (!apiKey || apiKey === 'your_openai_key_here') {
        console.warn('⚠️  OpenAI API key not found. AI features will be limited.');
      } else {
        console.log('✅ OpenAI API key found and appears valid');
      }
      this.openai = new OpenAI({
        apiKey: apiKey || 'mock-key',
      });
    }
  }

  /**
   * Generate a personalized cover letter based on job listing and user profile
   * @param cvText - Optional CV text content. If provided, will be used instead of userProfile
   */
  async generateCoverLetter(
    jobTitle: string,
    company: string,
    jobDescription: string,
    userProfile: {
      fullName: string;
      skills: string[];
      experience: number;
      education?: string;
      bio?: string;
    },
    cvText?: string
  ): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('📝 generateCoverLetter called');
    console.log(`   API Key check: ${!!apiKey && apiKey !== 'your_openai_key_here'}`);
    console.log(`   Has CV text: ${!!cvText}, CV length: ${cvText?.length || 0}`);
    
    if (!apiKey || apiKey === 'your_openai_key_here') {
      console.warn('⚠️  OPENAI_API_KEY not set, returning mock cover letter');
      return this.getMockCoverLetter(jobTitle, company, userProfile);
    }

    try {
      // If CV is available, use a much simpler and more direct prompt
      let prompt: string;
      let systemMessage: string;
      
      if (cvText) {
        // Put CV directly in system message where AI will see it first
        systemMessage = `Du er en ekspert på å skrive DETALJERTE, utfyllende søknadsbrev på norsk. 

DU HAR MOTTATT KANDIDATENS CV:
${cvText}

VIKTIG: Du MÅ bruke KUN informasjon fra CV-en over. Hver setning i søknadsbrevet skal referere til spesifikke ting fra CV-en (utdanning, ferdigheter, erfaring).`;

        // User message with job description and explicit instructions
        prompt = `Skriv et DETALJERT søknadsbrev på 450-600 ord for stillingen "${jobTitle}" hos ${company}.

STILLINGSBESKRIVELSE:
${jobDescription.substring(0, 4000)}

INSTRUKSJONER:
1. Bruk SPESIFIKKE detaljer fra CV-en du har mottatt (navn på skole, eksakte ferdigheter)
2. Matcher CV-detaljer mot stillingens krav
3. Minimum 450 ord - IKKE kortere!
4. Minimum 5 avsnitt med 4-5 setninger hver
5. Minimum 10 spesifikke referanser til CV-innhold
6. Ikke bruk generiske setninger uten CV-referanse

SKRIV NÅ et utfyllende søknadsbrev.`;
      } else {
        systemMessage = 'Du er en profesjonell karriereveileder som hjelper mennesker med å skrive personlige søknadsbrev på norsk.';
        prompt = this.buildCoverLetterPrompt(jobTitle, company, jobDescription, userProfile);
      }

      // Bruk riktig provider
      let generatedText = '';
      
      if (this.aiProvider === 'openrouter') {
        generatedText = await this.callOpenRouter(systemMessage, prompt);
      } else if (this.aiProvider === 'gemini') {
        generatedText = await this.callGemini(systemMessage, prompt);
      } else {
        // Standard OpenAI
        const modelToUse = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        
        console.log('🚀 Calling OpenAI API...');
        console.log(`   Model: ${modelToUse}`);
        console.log(`   System message length: ${systemMessage.length}`);
        console.log(`   User prompt length: ${prompt.length}`);
        
        if (!this.openai) {
          throw new Error('OpenAI client not initialized');
        }
        
        const response = await this.openai.chat.completions.create({
          model: modelToUse,
          messages: [
            {
              role: 'system',
              content: systemMessage,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 4000,
          top_p: 0.95,
        });

        generatedText = response.choices[0]?.message?.content || '';
      }
      
      // Log the response for debugging (kun for OpenAI)
      if (this.aiProvider === 'openai') {
        console.log(`✅ OpenAI API called successfully. Response length: ${generatedText.length} characters`);
        if (generatedText.length < 300) {
          console.warn(`⚠️  WARNING: Generated cover letter is very short (${generatedText.length} chars). This might indicate an issue.`);
          console.log('Generated text preview:', generatedText.substring(0, 200));
        } else {
          console.log(`✅ Generated cover letter is ${generatedText.length} characters - looks good!`);
        }
      }
      
      return generatedText;
    } catch (error: any) {
      console.error('❌ Error generating cover letter with AI:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        response: error.response?.data
      });
      
      // If it's an authentication error, log it clearly
      if (error.status === 401 || error.message?.includes('Incorrect API key') || error.message?.includes('Invalid API key') || error.message?.includes('401')) {
        console.error('🚨 OPENAI API KEY ERROR: The API key appears to be invalid or incorrect!');
        console.error(`   API Key starts with: ${process.env.OPENAI_API_KEY?.substring(0, 10)}...`);
        console.error(`   API Key length: ${process.env.OPENAI_API_KEY?.length || 0}`);
      }
      
      // If it's a quota/billing error, log it clearly
      if (error.status === 429 || error.code === 'insufficient_quota' || error.message?.includes('quota') || error.message?.includes('billing')) {
        console.error('🚨 OPENAI QUOTA ERROR: Du har ikke nok credits eller mangler betalingsinformasjon!');
        console.error('   Gå til: https://platform.openai.com/account/billing');
        console.error('   Du må legge til betalingsmetode eller kjøpe credits for å bruke API-et.');
      }
      
      // OpenRouter spesifikke feil
      if (this.aiProvider === 'openrouter') {
        console.error('🚨 OPENROUTER ERROR - Sjekk følgende:');
        console.error(`   API Key: ${this.openrouterApiKey ? '✅ Funnet' : '❌ Mangler'}`);
        console.error(`   Error: ${error.message}`);
        console.error(`   Response: ${JSON.stringify(error.response?.data || 'Ingen response data')}`);
      }
      
      // Return mock as fallback
      console.warn('⚠️  Falling back to mock cover letter due to error');
      console.warn(`   Provider used: ${this.aiProvider}`);
      return this.getMockCoverLetter(jobTitle, company, userProfile);
    }
  }

  /**
   * Expand search keywords intelligently using AI
   * E.g., "IT" -> ["IT support", "web utvikler", "sikkerhet", "IT teknisk", etc.]
   */
  async expandSearchKeywords(searchTerm: string): Promise<string[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const trimmed = searchTerm.trim();
    
    // Hvis det allerede er flere ord, ikke expander
    if (trimmed.split(/\s+/).length > 2) {
      return [trimmed];
    }

    try {
      // Sjekk hvilken provider vi bruker
      const provider = this.aiProvider || process.env.AI_PROVIDER || 'openai';
      const aiProvider = provider;
      
      if (!aiProvider || aiProvider === 'openai') {
        // Fallback til enkel keyword expansion
        return this.simpleKeywordExpansion(trimmed);
      }

      // Bruk AI til å ekspandere søket
      const prompt = `Du er en ekspert på jobbsøk. Brukeren søker etter jobber med søketermen "${trimmed}".

Ekspander dette søket til 5-8 relevante søketermer på norsk som dekker samme felt, men er mer spesifikke.

Eksempel:
- Input: "IT"
- Output: ["IT support", "web utvikler", "sikkerhet", "IT teknisk", "programmering", "cybersikkerhet", "IT administrator"]

Input: "${trimmed}"
Returner KUN en JSON-array med søketermene, ingen annen tekst:
["term1", "term2", "term3", ...]`;

      if (aiProvider === 'openrouter' && this.openrouterApiKey) {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 200,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openrouterApiKey}`,
              'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
              'X-Title': 'JobCrawl',
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 sekunder timeout
          }
        );

        const content = response.data.choices[0]?.message?.content || '';
        // Prøv å parse JSON fra responsen
        try {
          const terms = JSON.parse(content);
          if (Array.isArray(terms) && terms.length > 0) {
            // Begrens til maks 3-4 beste termer for å unngå for mange scraping-forespørsler
            // Inkluder originalt søk også
            const uniqueTerms = [trimmed, ...terms.filter((t: string) => t && t.toLowerCase() !== trimmed.toLowerCase())];
            // Ta bare de 4 første (inkluderer originalt søk)
            return uniqueTerms.slice(0, 4);
          }
        } catch {
          // Hvis parsing feiler, bruk fallback
        }
      }

      // Fallback
      return this.simpleKeywordExpansion(trimmed);
    } catch (error) {
      console.error('Error expanding keywords with AI:', error);
      return this.simpleKeywordExpansion(trimmed);
    }
  }

  /**
   * Simple keyword expansion without AI (fallback)
   */
  private simpleKeywordExpansion(searchTerm: string): string[] {
    const lower = searchTerm.toLowerCase();
    const expansions: Record<string, string[]> = {
      'it': ['IT support', 'web utvikler', 'sikkerhet'], // Begrens til 3 beste for raskere scraping
      'sikkerhet': ['cybersikkerhet', 'IT sikkerhet'],
      'utvikler': ['web utvikler', 'software utvikler'],
      'design': ['grafisk design', 'UX design'],
    };

    if (expansions[lower]) {
      // Begrens til maks 3-4 termer totalt (inkluderer originalt søk)
      return [searchTerm, ...expansions[lower].slice(0, 3)];
    }

    return [searchTerm];
  }

  /**
   * Use AI to check if a job matches search criteria intelligently
   */
  async doesJobMatchSearch(jobTitle: string, jobDescription: string, searchTerm: string): Promise<boolean> {
    if (!searchTerm || !jobTitle) {
      return true; // Hvis ingen søk, vis alle
    }

    try {
      // Sjekk hvilken provider vi bruker
      const provider = this.aiProvider || process.env.AI_PROVIDER || 'openai';
      const aiProvider = provider;
      
      // Enkel matching uten AI hvis OpenRouter ikke er tilgjengelig
      if (!aiProvider || aiProvider === 'openai') {
        const searchLower = searchTerm.toLowerCase();
        return jobTitle.toLowerCase().includes(searchLower) || 
               jobDescription.toLowerCase().includes(searchLower);
      }

      // Bruk AI for intelligent matching
      const prompt = `Er denne jobben relevant for søket "${searchTerm}"?

Jobbtittel: ${jobTitle}
Beskrivelse: ${jobDescription.substring(0, 500)}...

Svar kun med "JA" eller "NEI".`;

      if (aiProvider === 'openrouter' && this.openrouterApiKey) {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.1, // Lav temperature for mer konsistent svar
            max_tokens: 10,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.openrouterApiKey}`,
              'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
              'X-Title': 'JobCrawl',
              'Content-Type': 'application/json',
            },
            timeout: 5000, // 5 sekunder timeout
          }
        );

        const answer = response.data.choices[0]?.message?.content?.trim().toUpperCase() || '';
        return answer.includes('JA') || answer.includes('YES');
      }

      // Fallback til enkel matching
      const searchLower = searchTerm.toLowerCase();
      return jobTitle.toLowerCase().includes(searchLower) || 
             jobDescription.toLowerCase().includes(searchLower);
    } catch (error) {
      console.error('Error matching job with AI:', error);
      // Fallback til enkel matching ved feil
      const searchLower = searchTerm.toLowerCase();
      return jobTitle.toLowerCase().includes(searchLower) || 
             jobDescription.toLowerCase().includes(searchLower);
    }
  }

  /**
   * Match user profile with job requirements and return relevance score
   */
  async matchJobRelevance(
    jobRequirements: string[],
    userSkills: string[],
    jobTitle: string,
    jobDescription: string
  ): Promise<{ score: number; explanation: string }> {
    if (!process.env.OPENAI_API_KEY) {
      return this.getMockMatchScore(jobRequirements, userSkills);
    }

    try {
      const prompt = `Rate the match between a candidate and a job position on a scale of 0-100.

Job Title: ${jobTitle}
Job Requirements: ${jobRequirements.join(', ')}
Job Description: ${jobDescription.substring(0, 500)}...

Candidate Skills: ${userSkills.join(', ')}

Respond in JSON format with:
{
  "score": <number between 0-100>,
  "explanation": "<brief explanation in Norwegian>"
}`;

      if (!this.openai) {
        return this.getMockMatchScore(jobRequirements, userSkills);
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional recruiter evaluating candidate-job matches.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"score":50,"explanation":"Ungen match"}');
      return result;
    } catch (error) {
      console.error('Error matching job with AI:', error);
      return this.getMockMatchScore(jobRequirements, userSkills);
    }
  }

  /**
   * Suggest improvements for the user's profile based on job listings
   */
  async suggestProfileImprovements(
    userSkills: string[],
    targetJobTitles: string[]
  ): Promise<string[]> {
    if (!process.env.OPENAI_API_KEY) {
      return [
        'Vurder å lære flere relevante verktøy',
        'Tilegn deg mer erfaring innen ditt felt',
        'Bygg ut nettverk i bransjen',
      ];
    }

    try {
      const prompt = `Based on the candidate's current skills and target job titles, suggest 3-5 actionable improvements.

Current Skills: ${userSkills.join(', ')}
Target Jobs: ${targetJobTitles.join(', ')}

Respond with only a JSON array of suggestions in Norwegian:
["suggestion1", "suggestion2", "suggestion3"]`;

      if (!this.openai) {
        return [
          'Vurder å lære flere relevante verktøy',
          'Tilegn deg mer erfaring innen ditt felt',
          'Bygg ut nettverk i bransjen',
        ];
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a career coach providing actionable advice.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      const suggestions = JSON.parse(response.choices[0]?.message?.content || '[]');
      return suggestions;
    } catch (error) {
      console.error('Error generating profile suggestions:', error);
      return [
        'Vurder å lære flere relevante verktøy',
        'Tilegn deg mer erfaring innen ditt felt',
        'Bygg ut nettverk i bransjen',
      ];
    }
  }

  private buildCoverLetterPrompt(
    jobTitle: string,
    company: string,
    jobDescription: string,
    userProfile: any
  ): string {
    return `Skriv et personlig søknadsbrev på norsk for stillingen "${jobTitle}" hos ${company}.

Stilling beskrivelse:
${jobDescription.substring(0, 1000)}

Kandidatens profil:
- Navn: ${userProfile.fullName}
- Erfaring: ${userProfile.experience} år
- Kompetanser: ${userProfile.skills.join(', ')}
- Utdanning: ${userProfile.education || 'Ikke spesifisert'}
${userProfile.bio ? `- Bio: ${userProfile.bio}` : ''}

Søknadsbrevet skal:
1. Være personlig og engasjerende
2. Fremheve relevante ferdigheter
3. Vise interesse for bedriften
4. Være mellom 200-300 ord
5. Være skrevet på norsk`;
  }

  // Removed unused method - kept for reference but not used
  // Commented out to avoid TypeScript errors
  /* eslint-disable */
  /*
  private buildCoverLetterPromptWithCV(
    jobTitle: string,
    company: string,
    jobDescription: string,
    cvText: string,
    fullName: string
  ): string {
    // Use the full formatted CV text (already limited to 4000 by formatCVForAI)
    const fullCvText = cvText;
    
    return `OPPGAVE: Skriv et detaljert, skreddersydd søknadsbrev på norsk for "${jobTitle}" hos ${company}. 

KANDIDATENS NAVN: ${fullName}

═══════════════════════════════════════════════════════════════
STILLINGSBESKRIVELSE OG KRAV:
═══════════════════════════════════════════════════════════════
${jobDescription.substring(0, 3000)}

═══════════════════════════════════════════════════════════════
KANDIDATENS KOMPLETTE CV - DETTE ER DIN ENESTE KILDE TIL INFORMASJON:
═══════════════════════════════════════════════════════════════
${fullCvText}

═══════════════════════════════════════════════════════════════
DETTE ER HELE CV-EN - LES DEN NØYE OG BRUK ALLE DETALJER FRA DEN
═══════════════════════════════════════════════════════════════

VIKTIG: Du har nå både stillingsbeskrivelsen og CV-en. Din oppgave er å:
1. Identifisere konkrete stillingskrav fra stillingsbeskrivelsen
2. Finne matchende erfaring, utdanning, ferdigheter og prosjekter fra CV-en
3. Skrive et detaljert søknadsbrev som viser HVORDAN kandidatens CV matcher stillingen

STEG-FOR-STEG INSTRUKSJONER:
1. LES hele CV-en nøye. Identifiser:
   - Utdanning (skole, linje, år)
   - Arbeidserfaring (tittel, bedrift, periode, oppgaver)
   - Ferdigheter og kompetanse
   - Prosjekter og relevante erfaringer
   - Sertifikater og kurs

2. ANALYSER stillingsbeskrivelsen. Identifiser:
   - Krav til utdanning
   - Krav til erfaring
   - Krav til ferdigheter
   - Annen relevant informasjon

3. MATCH CV-innhold mot stillingskrav:
   - For hvert viktig krav, finn det tilsvarende i CV-en
   - Bruk EKSAKTE formuleringer fra CV-en når du refererer til utdanning, erfaring, ferdigheter
   - Forklar HVORDAN kandidatens CV-detaljer matcher stillingens krav

KRITISKE REGLER - FØLG DISSE NØYE:

REGEL 1: MÅ bruke EKSAKTE ord og setninger fra CV-en
- Hvis CV-en sier "Bachelor i Cybersikkerhet hos Høyskolen i Kristiania" → Bruk denne eksakte formuleringen
- Hvis CV-en sier "Java Mooc Programming 1 diplom fra University of Helsinki" → Nevn dette eksakt
- Hvis CV-en sier "Etisk Hacking, Cyberforsvar, Skysikkerhet" → Bruk disse ordene
- Hvis CV-en sier "38 år, bosatt i Oslo med samboer og to barn" → Du kan referere til dette (relevant for stabilitet)

REGEL 2: MATCH hvert stillingskrav med noe fra CV-en
For hver viktig del av stillingsbeskrivelsen, finn det tilsvarende i CV-en:
- Stillingskrav: "IT-support" → CV har: "IT-support" eller "teknisk IT kompetanse"? → NEVN DET
- Stillingskrav: "Norsk språk" → CV har: "Norsk"? → NEVN DET
- Stillingskrav: "Sikkerhet" → CV har: "Cyberforsvar, Etisk Hacking"? → NEVN DISSE SPESIFIKT

REGEL 3: Struktur - minst 4 avsnitt med konkrete CV-referanser
AVSNITT 1 (Åpning - 2-3 setninger):
- Vis interesse for stillingen
- Nevn én spesifikk ting fra CV-en som matcher (f.eks. "Med min bakgrunn i [fra CV]...")

AVSNITT 2 (Første match - 3-4 setninger):
- Ta et stillingskrav fra stillingsbeskrivelsen
- Vis hvordan CV-en matcher dette KONKRET:
  Eksempel: "Stillingsannonsen krever [X]. Min erfaring med [Y fra CV] gir meg direkte relevans for dette, siden [forklar sammenheng]."

AVSNITT 3 (Andre match - 3-4 setninger):
- Ta et annet stillingskrav
- Vis hvordan CV-en matcher dette KONKRET med spesifikke detaljer fra CV

AVSNITT 4 (Tredje match - 3-4 setninger):
- Ta et tredje stillingskrav eller viktig punkt
- Vis match med konkrete CV-detaljer

AVSNITT 5 (Avslutning - 2-3 setninger):
- Bekreft interesse
- Kanskje nevne én siste CV-detalj som er relevant

REGEL 4: Lengde og detaljer - KRITISK!
- MÅ være 400-600 ord - IKKE kortere enn dette!
- MINIMUM 8-10 spesifikke referanser til CV-innhold (utdanning, ferdigheter, erfaring, prosjekter)
- Hver paragraf MÅ inneholde minst 2-3 konkrete CV-referanser
- Brevet MÅ ha minst 4-5 avsnitt, hvert avsnitt 3-5 setninger

REGEL 5: Eksempler på GODT vs DÅRLIG

❌ DÅRLIG: "Jeg har erfaring innen cybersikkerhet og IT"
✅ GODT: "Min Bachelor i Cybersikkerhet fra Høyskolen i Kristiania, kombinert med spesialisering innen etisk hacking og cyberforsvar fra studiet, gir meg solid grunnlag for IT-support arbeidet hos dere, spesielt når det gjelder sikkerhetsrelaterte oppgaver."

❌ DÅRLIG: "Jeg kan programmere"
✅ GODT: "Gjennom Java Mooc Programming 1 diplom fra University of Helsinki har jeg utviklet praktisk programmeringskompetanse. Dette, kombinert med min tekniske IT-kompetanse fra cybersikkerhetsutdanningen, gjør meg godt rustet for teknisk feilsøking og support-oppgaver."

❌ DÅRLIG: "Jeg er hardtarbeidende og har ledererfaring"
✅ GODT: "Min tidligere erfaring som lokallagsleder, styreleder, fylkesleder og befal i KFUM Sjøspeideren viser min evne til å lede og organisere, noe som er relevant for teamarbeid og kundeservice i stillingen."

REGEL 6: ABSOLUTT FORBYDT
- ❌ Generiske fraser uten CV-referanse: "jeg har mange års erfaring", "jeg er motivert", "jeg har god kompetanse"
- ❌ Å finne opp eller antyde erfaring som IKKE er i CV-en
- ❌ Vage setninger som kunne vært skrevet om hvem som helst
- ❌ Å ikke nevne spesifikke ting fra CV-en (utdanning, ferdigheter, prosjekter)

REGEL 7: KONTROLLER CHECKLISTE FØR DU SKRIVER
Før du skriver, sjekk at du har:
[ ] Identifisert minst 3 spesifikke stillingskrav
[ ] Funnet matchende CV-detaljer for hvert krav
[ ] Brukt eksakte formuleringer fra CV-en
[ ] Nevnt utdanning spesifikt (skole og linje)
[ ] Nevnt spesifikke ferdigheter fra CV-en
[ ] Knyttet CV-detaljer til stillingskrav

SØKNADSBREVET MÅ VÆRE:
- Personlig (bruker CV-detaljer som bare gjelder denne kandidaten)
- Konkret (nevner eksakte ting fra CV)
- Relevant (matcher CV til stillingens krav)
- Overbevisende (viser at kandidaten faktisk har den erfaringen stillingen krever)

START Å SKRIVE NÅ. Hver setning må ha et ankerpunkt i CV-innholdet du har fått.`;
  }
  */

  /**
   * Call OpenRouter API (GRATIS tier med open source modeller)
   */
  private async callOpenRouter(systemMessage: string, prompt: string): Promise<string> {
    if (!this.openrouterApiKey) {
      throw new Error('OpenRouter API key not set');
    }

    // Bruk gratis modeller fra OpenRouter
    const modelToUse = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free'; // Gratis modell
    
    console.log('🚀 Calling OpenRouter API (GRATIS)...');
    console.log(`   Model: ${modelToUse}`);
    console.log(`   System message length: ${systemMessage.length}`);
    console.log(`   User prompt length: ${prompt.length}`);

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: modelToUse,
          messages: [
            {
              role: 'system',
              content: systemMessage,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openrouterApiKey}`,
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'JobCrawl',
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data.choices[0]?.message?.content || '';
      console.log(`✅ OpenRouter API called successfully. Response length: ${generatedText.length} characters`);
      if (generatedText.length < 300) {
        console.warn(`⚠️  WARNING: Generated cover letter is very short (${generatedText.length} chars).`);
      } else {
        console.log(`✅ Generated cover letter is ${generatedText.length} characters - looks good!`);
      }
      return generatedText;
    } catch (error: any) {
      console.error('❌ Error calling OpenRouter API:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Call Google Gemini API (GRATIS tier)
   */
  private async callGemini(systemMessage: string, prompt: string): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not set');
    }

    console.log('🚀 Calling Google Gemini API (GRATIS)...');
    console.log(`   Model: gemini-1.5-flash`); // Gratis modell
    console.log(`   Combined prompt length: ${systemMessage.length + prompt.length}`);

    try {
      // Gemini kombinerer system og user message
      const fullPrompt = `${systemMessage}\n\n${prompt}`;
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4000,
            topP: 0.95,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data.candidates[0]?.content?.parts[0]?.text || '';
      console.log(`✅ Gemini API called successfully. Response length: ${generatedText.length} characters`);
      if (generatedText.length < 300) {
        console.warn(`⚠️  WARNING: Generated cover letter is very short (${generatedText.length} chars).`);
      } else {
        console.log(`✅ Generated cover letter is ${generatedText.length} characters - looks good!`);
      }
      return generatedText;
    } catch (error: any) {
      console.error('❌ Error calling Gemini API:', error.response?.data || error.message);
      throw error;
    }
  }

  private getMockCoverLetter(jobTitle: string, company: string, profile: any): string {
    return `Hei,

Jeg søker på stillingen som ${jobTitle} hos ${company}.

Med min bakgrunn i ${profile.skills.join(' og ')}, og ${profile.experience} års relevant erfaring, tror jeg jeg vil passe godt inn i teamet deres.

Jeg ser frem til å høre fra dere.

Vennlig hilsen,
${profile.fullName}`;
  }

  private getMockMatchScore(
    jobRequirements: string[],
    userSkills: string[]
  ): { score: number; explanation: string } {
    const matches = userSkills.filter(skill =>
      jobRequirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
    );
    
    const score = Math.round((matches.length / jobRequirements.length) * 100);
    
    return {
      score,
      explanation: `${matches.length} av ${jobRequirements.length} krav matcher dine ferdigheter`,
    };
  }
}

