<div align="center">

# 🚀 Growth (نمو) — Personal Growth OS & Productivity Companion

<p align="center">
  <b>A modern, beautiful, and feature-packed Personal Growth Operating System built with React Native, Expo, and TypeScript.</b>
</p>

[![React Native](https://img.shields.io/badge/React_Native-0.86.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-57.0.8-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**Growth (نمو)** is a state-of-the-art personal growth operating system engineered to transform your daily routines, habit formation, and task execution. Designed with a **"Radiant Clarity"** light design system, glassmorphic UI elements, haptic feedback, and proof-backed task verification, Growth helps you stay accountable, maintain momentum, and achieve your life goals.

---

## ✨ Key Features

### 🎯 Daily Missions & Priority Dashboard
- **Top Priority Missions**: Pin your most critical daily tasks as daily missions on the home dashboard.
- **Greeting & Time Context**: Contextual greeting cards with live completion stats.
- **Life Category Overview**: Visual progress rings breaking down your daily progress across Work, Health, Relationships, and Finance.

### ⚡ Habit Tracker & 3-Day Grace Buffer Shield
- **Streak Tracker**: Automatic streak counting with daily activity verification.
- **🛡️ 3-Day Grace Period System**: Flexible buffer system that protects your active streak if life gets busy for up to 3 consecutive days.
- **Heatmap Grid**: Annual & monthly activity heatmaps visualizing your consistency over time.

### 📋 Proof-Backed Task Manager
- **Proof Required Tasks**: Require tangible evidence before marking critical tasks as completed.
- **📷 Photo Proof**: Attach live camera photos or gallery images.
- **🎙️ Voice Note Proof**: Record initial audio notes or submission voice notes using built-in audio recorder (`expo-av`).
- **📄 Document Proof**: Attach files and custom notes for complete accountability.

### 🏆 Legendary Completion Celebration
- **Trophy & Sparkles Overlay**: Animated celebration popup (`TaskCompletionModal`) with glowing trophy badges, sparkle particle bursts, and motivational quotes.
- **Haptic Feedback**: Haptic notifications (`expo-haptics`) providing tactile celebration on task completion.

### 📊 Dynamic Analytics & Custom Category Manager
- **Interactive Breakdown**: Real-time progress bars for each life category.
- **Category Manager**: Create, edit, and delete custom categories with tailored colors and emojis.
- **Streak Leaderboard**: Rank your highest active habit streaks.

### 📱 Full-Screen Edge-to-Edge & Floating Tab Bar
- **Floating Navigation Bar**: Glassmorphic floating bottom navigation bar with active pastel squircle pills and smooth touch transitions.
- **Responsive Edge-to-Edge**: Fully responsive edge-to-edge layout across iOS, Android, and Web viewports.

---

## 🛠️ Technology Stack

- **Framework**: [Expo 57](https://expo.dev/) & [React Native 0.86](https://reactnative.dev/)
- **Routing**: [Expo Router 57](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State & Storage**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Native SQLite DB) & In-Memory Web DB
- **Animations**: [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/)
- **Icons**: [@expo/vector-icons](https://icons.expo.fyi/) (Ionicons)
- **Audio & Media**: `expo-av`, `expo-image-picker`, `expo-document-picker`
- **Haptics**: `expo-haptics`

---

## 📁 Repository Architecture

```
Growth/
├── app/                        # Expo Router Navigation Pages
│   ├── (tabs)/                 # Main Tab Navigation
│   │   ├── _layout.tsx         # Root Tab Bar Config
│   │   ├── index.tsx           # Dashboard Screen
│   │   ├── habits.tsx          # Habit Tracker Screen
│   │   ├── tasks.tsx           # Tasks & Proof Screen
│   │   ├── calendar.tsx        # Activity Calendar & Heatmap
│   │   └── analytics.tsx       # Performance Analytics
│   ├── habit/                  # Habit Screens ([id].tsx, new.tsx)
│   ├── task/                   # Task Screens (new.tsx)
│   └── _layout.tsx             # App Entry & Context Providers
├── src/                        # Core Application Code
│   ├── components/             # Reusable UI Components
│   │   ├── calendar/           # Activity Calendar & Grace Widgets
│   │   ├── categories/         # Category Manager Modal
│   │   ├── dashboard/          # Dashboard Widgets
│   │   ├── habits/             # Heatmap & Habit Cards
│   │   ├── navigation/         # Custom Floating Tab Bar
│   │   ├── tasks/              # Task Item, Proof Submission & Viewer
│   │   └── ui/                 # Custom Alert Modal, Buttons, Cards
│   ├── constants/              # Theme Tokens, Colors & Categories
│   ├── context/                # Custom Alert & Language Contexts
│   ├── db/                     # SQLite Native & Web Database Clients
│   ├── hooks/                  # Data CRUD Hooks (useTasks, useHabits, etc.)
│   ├── i18n/                   # Multi-language Translations (AR / EN)
│   └── types/                  # TypeScript Type Definitions
├── assets/                     # App Icons, Fonts & Media Assets
├── app.json                    # Expo Build & App Configuration
├── eas.json                    # EAS Build & Package Settings
└── package.json                # Project Dependencies
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on mobile or an Android/iOS emulator

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Amr-khalid/Growth.git
   cd Growth
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npx expo start
   ```

4. **Run on Target Device**:
   - **Android**: Press `a` in terminal or scan QR code with Expo Go app.
   - **iOS**: Press `i` in terminal (macOS required for simulator).
   - **Web**: Press `w` in terminal to run in web browser.

---

## 📦 Building Standalone APK

To build a standalone downloadable Android APK using Expo Application Services (EAS):

```bash
# Build standalone APK
npx eas-cli build -p android --profile preview
```

---

## 👤 Author

- **Amr Khalid** — [GitHub Profile](https://github.com/Amr-khalid)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
