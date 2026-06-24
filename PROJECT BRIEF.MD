web application/stitch/projects/17501570917947388685/screens/f9aeb44ce45c4cf8bd9c8e4ef652af67
# Project PRD: Flag Explorer (Bilingual Education App)

## 1. Executive Summary
**Flag Explorer** is a high-fidelity, bilingual (Spanish/English) mobile educational application designed for children aged 4-8. The app uses a "gamified mastery" loop to teach country flags, names, and cultural recognition through interactive painting, audio-visual reinforcement, and a reward-based progression system.

## 2. Target Audience
- **Primary**: Children aged 4–8 (specifically optimized for non-readers and early learners).
- **Secondary**: Parents looking for screen time that is both educational and offline-capable.

## 3. Core Product Pillars
- **Non-Reader Friendly**: Minimal text reliance; navigation via icons and full bilingual voice-overs.
- **Bilingual First**: Every interaction reinforces vocabulary in both Spanish (primary) and English (secondary).
- **Tactile Learning**: Painting mechanics that simulate a "smart brush" to help children memorize flag patterns.
- **Mastery Feedback**: High-energy celebrations and physical "Passport Stamps" to reward progress.

## 4. Feature Requirements

### 4.1. World Map Hub (The Navigation)
- **Interactive Globe**: A central hub where children select a grayed-out country to start a learning session.
- **Progress Tracking**: Countries turn from gray to full color once mastered.
- **Parental Lock**: A secure "Parents Only" portal for settings and exit functions.

### 4.2. Flag Paint Station (The Learning Phase)
- **Silhouette Mode**: A blank outline of the country's flag.
- **Smart Brush Palette**: A limited color palette containing only the correct colors for that specific flag.
- **Bilingual Audio Cues**: 
    - Tapping a color triggers: "[Color Name in Spanish]... [Color Name in English]".
    - Success triggers: "¡Lo lograste! ... You did it!".
- **Alarm Interaction**: A dedicated "Sound Alarm" button on each station to play a fun, country-specific alert sound.

### 4.3. Quiz Phase (The Assessment)
- **Simplified Options**: After every 10 flags, a quiz reviews mastery.
- **No-Shape Rule**: Options feature only the country flag and the bilingual name (e.g., "México / Mexico") to avoid confusing early learners with geographic silhouettes.
- **Audio Support**: Speaker icons next to each option for audio-only identification.

### 4.4. Passport & Rewards (The Gamification)
- **Digital Passport**: A collection screen showing "stamps" for every country completed.
- **Rank Progression**: Users move from *Beginner* to *Explorer*, *Captain*, and eventually *World Expert*.
- **Level Celebrations**: Immersive, full-screen animations with confetti and rank badges upon completing a level set (10 flags).

## 5. Content Roadmap (50 Flags Total)
- **Level 1 (Foundational)**: Mexico, USA, Canada, France, Italy, Spain, Brazil, Japan, Germany, Australia.
- **Level 2 (Expanding)**: UK, India, China, Argentina, Colombia, South Korea, Russia, South Africa, Greece, Egypt.
- **Levels 3–5**: Progressive inclusion of diverse global flags (Sweden, Portugal, Switzerland, Philippines, etc.).

## 6. Technical Specifications
- **Framework**: HTML5 / CSS (Tailwind) optimized for Android Webview.
- **Interactions**: Vanilla JavaScript for DOM-based celebrations (confetti, sparkles).
- **Assets**: 
    - **UI**: High-contrast, "tactile" buttons with physical shadows.
    - **Audio**: Bilingual MP3/WAV files for all labels.
- **Offline Support**: All assets must be bundled to ensure 100% functionality without internet.

## 7. Success Metrics
- **Completion Rate**: Percentage of children who complete a full 10-flag level.
- **Audio Engagement**: Frequency of "Alarm" button and speaker icon usage.
- **Bilingual Retention**: Accuracy in English-label selection during Spanish-prompted quizzes.