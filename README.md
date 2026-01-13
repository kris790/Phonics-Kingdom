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

---

## 📥 Getting Started

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