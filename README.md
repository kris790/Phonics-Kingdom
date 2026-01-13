# 🎙️ Phonics Kingdom

**Phonics Kingdom** is an immersive, play-first educational platform designed for children aged 4-6. It transforms foundational literacy—phonemic awareness, letter-sound correspondence, and CVC blending—into a "stealth learning" adventure.

Built with a "vibe-coding" philosophy and powered by the **Google Gemini API**, Phonics Kingdom leverages generative AI to create a dynamic, adaptive, and infinitely replayable world.

---

## 🌟 The Vision

Most literacy apps are either "digital worksheets" or "empty entertainment." Phonics Kingdom reconciles these by creating a persistent world where spelling and phonics are the core mechanics of play.

- **Objective:** Defeat the **Static Scrambler** and restore the sounds of the Kingdom.
- **Methodology:** Evidence-based phonics curriculum wrapped in a 2.5D gamified experience.
- **AI Core:** Real-time task generation, unique character voices, and custom-drawn visuals for every learning prompt.

---

## 🦊 Meet the Sound Squad

The Kingdom is protected by an original cast of characters, each representing a key phonics pillar:

| Character | Role | Mechanic |
| :--- | :--- | :--- |
| **Brio the Beatboxer** | Master of Rhythm | Phonemic awareness, syllables, and sound blending. |
| **Vowelia** | Magical Weaver | Short vowel recognition and placement. |
| **Diesel the Digger** | Sound Builder | "Digging up" beginning consonants and building word foundations. |
| **Zippy the Zoomer** | Rhyme Racer | Ending sounds, rhyming patterns, and sight words. |

---

## 🚀 Key Features

### 1. **Adaptive Learning Engine**
The app doesn't just show static flashcards. The `gemini-3-flash-preview` model acts as a "Dungeon Master," generating task wording that matches the selected character's personality and the child's current mastery level.

### 2. **Multimodal AI Integration**
- **Visuals:** `gemini-2.5-flash-image` draws a custom illustration for every task to provide context for non-readers.
- **Audio:** `gemini-2.5-flash-preview-tts` provides high-quality, character-specific voices for all instructions.
- **Logic:** Adaptive difficulty ensures children stay in the "flow state"—not too easy to be boring, not too hard to be frustrating.

### 3. **Parent Dashboard**
A jargon-free hub for parents to see real progress.
- **Accuracy Tracking:** See which sounds are mastered and which need more play.
- **Educational Insights:** Plain-language summaries of what "Phonemic Awareness" actually means for their child.
- **Offline Extensions:** AI-suggested real-world activities to reinforce learning.

---

## 🛠️ Technical Stack

- **Frontend:** React 19 (ESM), Tailwind CSS.
- **Intelligence:** `@google/genai` (Google Gemini SDK).
- **Audio:** Web Audio API (PCM Decoding).
- **Visuals:** Vector-based parallax Magic Map + AI-generated Task Art.
- **Fonts:** Dyslexia-friendly (Andika) and high-legibility (Lexend).

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    %% User Interaction Layer
    User["👶 Child (Age 4-6)<br/>👨‍👩‍👧 Parent/Teacher"] --> Browser["🌐 Web Browser<br/>(Chrome, Safari, Edge)"]
    
    %% Frontend Layer - React PWA
    subgraph Frontend ["Frontend Layer - React Progressive Web App (PWA)"]
        direction LR
        PWA["📱 React PWA<br/>(TypeScript + Tailwind CSS)"]
        
        subgraph PWA_Modules ["Core Modules"]
            FE1["🎮 Game Engine<br/>5 interactive task types"]
            FE2["🗺️ Magic Map<br/>Island navigation"]
            FE3["🏠 Parent Hub<br/>Analytics dashboard"]
            FE4["👤 Character System<br/>Brio, Vowelia, Diesel, Zippy"]
        end
        
        PWA --> PWA_Modules
    end
    
    Browser --> PWA
    
    %% Backend Layer - Serverless/Static
    subgraph Backend ["Backend Layer - Serverless/Static Hosting"]
        direction LR
        Hosting["☁️ Static Hosting<br/>(Vercel/Netlify/GitHub Pages)"]
        Serverless["⚡ Serverless Functions<br/>(API routes if needed)"]
        
        Hosting --> Serverless
    end
    
    PWA --> Hosting
    
    %% Database Layer - Browser Storage + Optional Cloud Sync
    subgraph Database ["Database Layer - Local First + Cloud Sync"]
        direction LR
        LocalStorage["💾 Browser LocalStorage<br/>(Primary data store)"]
        IndexedDB["🗃️ IndexedDB<br/>(Larger data - audio, images)"]
        CloudSync["☁️ Cloud Firestore<br/>(Optional sync for multi-device)"]
        
        LocalStorage --> CloudSync
        IndexedDB --> CloudSync
    end
    
    PWA --> LocalStorage
    PWA --> IndexedDB
    
    %% External Services Layer
    subgraph ExternalServices ["External Services"]
        direction LR
        AI_API["🤖 Google Gemini API<br/>(AI content generation)"]
        TTS_API["🔊 Web Speech API<br/>(Text-to-Speech fallback)"]
        Analytics["📊 Google Analytics 4<br/>(Usage analytics)"]
        ErrorTracking["🐛 Sentry<br/>(Error monitoring)"]
        EmailService["✉️ EmailJS/SendGrid<br/>(Parent reports - future)"]
        
        AI_API --> TTS_API
    end
    
    %% Connections
    Serverless --> AI_API
    PWA --> TTS_API
    PWA --> Analytics
    PWA --> ErrorTracking
    
    %% Optional future connections
    Serverless -.-> EmailService
    CloudSync -.-> EmailService

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef user fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    
    class Frontend,Hosting,PWA,PWA_Modules frontend
    class Backend,Serverless backend
    class Database,LocalStorage,IndexedDB,CloudSync database
    class ExternalServices,AI_API,TTS_API,Analytics,ErrorTracking,EmailService external
    class User,Browser user
```

### Architecture Summary

| Layer | Component | Technology | Purpose |
|-------|-----------|------------|---------|
| **Frontend** | React PWA | React 18 + TypeScript + Tailwind CSS | Game UI, task rendering, parent dashboard |
| **Backend** | Static Hosting | Vercel/Netlify Functions | Serves React build, API routes for external calls |
| **Database** | Local Storage | Browser LocalStorage + IndexedDB | Saves game progress, user data, cached assets |
| **External** | AI Service | Google Gemini API | Generates phonics tasks, narratives, images |
| **External** | TTS Service | Web Speech API + Gemini TTS | Text-to-speech for instructions, feedback |
| **External** | Analytics | Google Analytics 4 + Sentry | Usage tracking, error monitoring |

### Key Architecture Decisions

- **Offline-First**: Children play in cars, planes, areas with poor connectivity
- **Cost-Effective**: No server costs until you scale (static hosting is free)
- **Simple Maintenance**: No database administration, server management
- **COPPA Compliant**: Data stays on device by default

### Implementation Status

✅ React PWA, LocalStorage, Web Speech API  
✅ Gemini AI integration (with offline fallback)  
🔜 Cloud sync for multi-device, email reports for parents

---

## � User Flows

```mermaid
flowchart TD
    %% ========== FLOW 1: CHILD PLAYER ==========
    subgraph Flow1 ["👶 Flow 1: Child Player (Age 4-6)"]
        direction TB
        CP1["**Start**<br/>Child opens app in browser"]
        CP2["**No Auth Required**<br/>Immediate access to free content"]
        CP3{"**First Visit?**"}
        CP4["**Character Selection**<br/>Choose Brio, Vowelia, Diesel, or Zippy"]
        CP5["**Magic Map Navigation**<br/>Explore unlocked islands"]
        CP6["**Gameplay Loop**<br/>Complete 3 phonics tasks per island"]
        
        subgraph CP_DB ["Local Database Interactions"]
            CP7["**Save Progress**<br/>LocalStorage: Tasks completed, stars earned"]
            CP8["**Update Analytics**<br/>IndexedDB: Session data, error patterns"]
        end
        
        CP9["**Earn Rewards**<br/>Stars ⭐ for completion<br/>King Shards 💎 for 85%+ accuracy"]
        CP10{"**Try Paid Content?**"}
        CP11["**Free Tier Gate**<br/>'Ask a grown-up to unlock more!'"]
        CP12["**Continue Playing**<br/>Return to Magic Map"]
        
        CP1 --> CP2 --> CP3
        CP3 -- Yes --> CP4
        CP3 -- No --> CP5
        CP4 --> CP5 --> CP6 --> CP7
        CP7 --> CP8 --> CP9 --> CP10
        CP10 -- Yes --> CP11 --> CP12
        CP10 -- No --> CP12
    end
    
    %% ========== FLOW 2: PARENT/PAYING USER ==========
    subgraph Flow2 ["👨‍👩‍👧 Flow 2: Parent/Paying User"]
        direction TB
        PP1["**Start**<br/>Parent opens Parent Hub<br/>(or sees child's prompt)"]
        PP2["**Adult Verification**<br/>Solve simple math puzzle<br/>e.g., 'What is 5 + 3?'"]
        PP3{"**Verification Passed?**"}
        PP4["**Access Parent Hub**<br/>View child's progress, analytics"]
        PP5["**Explore Premium Features**<br/>See what paid tier unlocks"]
        PP6{"**Purchase Decision?**"}
        
        subgraph PP_Payment ["Payment Gateway Flow"]
            PP7["**Select Plan**<br/>Monthly: $4.99<br/>Annual: $49.99 (save 16%)"]
            PP8["**Payment Form**<br/>Stripe embedded checkout"]
            PP9{"**Payment Successful?**"}
            PP10["**Update User Status**<br/>Database: premium=true, expiry_date"]
            PP11["**Grant Access**<br/>Unlock all islands, features"]
            PP12["**Email Receipt**<br/>SendGrid: confirmation + parent report"]
        end
        
        PP13["**Manage Account**<br/>Update payment, add children, set limits"]
        PP14["**Review Analytics**<br/>Mastery reports, error patterns, recommendations"]
        PP15["**Configure Settings**<br/>Audio speed, dyslexia font, content filters"]
        
        PP1 --> PP2 --> PP3
        PP3 -- Yes --> PP4 --> PP5 --> PP6
        PP3 -- No --> PP1
        PP6 -- Yes --> PP7 --> PP8 --> PP9
        PP9 -- Yes --> PP10 --> PP11 --> PP12 --> PP13
        PP9 -- No --> PP5
        PP6 -- No --> PP13
        PP13 --> PP14 --> PP15
    end
    
    %% ========== DATABASE INTERACTIONS ==========
    subgraph Database ["📊 Database Interactions (Cloud - Optional)"]
        direction LR
        DB1["**Firestore Profiles**<br/>User data, children profiles"]
        DB2["**Subscription Records**<br/>Stripe customer IDs, plan details"]
        DB3["**Learning Analytics**<br/>Aggregated progress data"]
        DB4["**Content Metadata**<br/>Island unlocks, feature flags"]
        
        DB1 --> DB2 --> DB3 --> DB4
    end
    
    %% ========== EXTERNAL SERVICES ==========
    subgraph External ["🔗 External Services"]
        direction LR
        EXT1["**Stripe**<br/>Payment processing<br/>Subscription management"]
        EXT2["**SendGrid**<br/>Email receipts<br/>Weekly parent reports"]
        EXT3["**Google Analytics**<br/>Anonymous usage data<br/>Performance metrics"]
        
        EXT1 --> EXT2 --> EXT3
    end
    
    %% ========== CONNECTIONS BETWEEN FLOWS ==========
    CP11 -.-> PP1
    PP11 -.-> CP5
    PP10 --> DB2
    PP12 --> EXT2
    PP8 --> EXT1
    CP8 -.-> DB3
```
### Flow Summary

| User | Auth Required | Data Storage | Key Features |
|------|---------------|--------------|--------------|
| **Child** | ❌ None | LocalStorage + IndexedDB | Zero friction, instant play, offline-first |
| **Parent** | ✅ Math gate | Cloud Firestore | Analytics, payments, settings control |

### Design Principles

- **Children**: Zero friction, no passwords, 3 clicks to first game
- **Parents**: Simple math gate (5+3), dashboard access, payment control
- **COPPA Compliant**: No PII collected from children, device-based identification

### Freemium Model

| Feature | Free Tier | Premium |
|---------|-----------|---------|
| Islands | Consonant Cove only | All 5 islands |
| Characters | 1 character | All 4 characters |
| Analytics | Basic progress | Detailed reports |
| New Content | Delayed | Early access |

**Pricing**: Monthly $4.99 / Annual $49.99 (save 16%)
---

## 🎮 Core Gameplay Loop

```mermaid
flowchart TD
    Start["**START**<br/>Child starts phonics task"]
    Display["**Task Display**<br/>Shows picture 🍋, speaks instruction 🔊"]
    Interaction{"**Child Attempts Answer**"}
    Decision{"**Correct?**"}
    
    %% Success Path
    SuccessFeedback["**SUCCESS** ✅<br/>Green check, 'Great job!'"]
    SuccessTeaching["**Reinforce**<br/>'L says /l/ like lemon!'"]
    SuccessPoints["**Award** ⭐ +1 star"]
    
    %% Failure Path
    FailureFeedback["**TRY AGAIN** ❌<br/>Gentle correction, hints"]
    FailureTeaching["**Teach**<br/>'Actually, L says /l/'"]
    FailureRetry{"**Retry?**"}
    
    %% Progress Check
    MoreTasks{"**More Tasks?**"}
    NextTask["**Next Task**"]
    Complete["**Session Complete** 🎉"]
    Mastery{"**≥85% Accuracy?**"}
    Shard["**💎 Award King Shard**"]
    Save["**Save Progress**<br/>LocalStorage + IndexedDB"]
    End["**END** ↩️ Magic Map"]
    
    Start --> Display --> Interaction --> Decision
    Decision -- Yes --> SuccessFeedback --> SuccessTeaching --> SuccessPoints --> MoreTasks
    Decision -- No --> FailureFeedback --> FailureTeaching --> FailureRetry
    FailureRetry -- Yes --> Interaction
    FailureRetry -- No --> MoreTasks
    MoreTasks -- Yes --> NextTask --> Display
    MoreTasks -- No --> Complete --> Mastery
    Mastery -- Yes --> Shard --> Save --> End
    Mastery -- No --> Save --> End
```

### Pedagogical Design

| Step | Educational Principle |
|------|----------------------|
| **Teaching AFTER answer** | Assessment-first, prevents answer leaks |
| **Corrective feedback** | Zone of Proximal Development |
| **Partial credit** | Growth mindset encouragement |
| **Error tracking** | Data-driven adaptation |
| **85% mastery threshold** | Competency-based progression |

### Error Patterns Tracked

- `b-d-confusion`: Mixes "b" and "d" sounds
- `short-vowels`: Confuses short vowel sounds  
- `ending-sounds`: Struggles with ending sounds
- `blend-segmentation`: Difficulty separating blends
---

## �📥 Getting Started

### Prerequisites
- An active **Google Gemini API Key**.
- A modern browser with Microphone and Audio permissions enabled.

### Setup
1. Clone the repository.
2. Ensure `process.env.API_KEY` is configured in your environment.
3. Serve the `index.html` file using any standard dev server (e.g., Vite, Live Server).

---

## 📋 Roadmap

- [x] Phase 1: Core IP and character logic.
- [x] Phase 2: AI-driven task and visual generation.
- [ ] Phase 3: "Party Play" (Asynchronous cooperative missions).
- [ ] Phase 4: Mobile deployment (iOS/Android/Amazon Fire).

---

## ⚖️ Legal & Privacy

- **IP Status:** All characters (Brio, Vowelia, Diesel, Zippy) and "Phonics Kingdom" branding are original creative works.
- **Privacy:** Designed with **COPPA/GDPR-K** principles. No child-identifiable data is stored; all AI interactions are anonymized.

---

*“Play is the highest form of research.” — Albert Einstein*