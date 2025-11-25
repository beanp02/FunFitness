# Fun Fitness Tracker (v1.0)

**"Log it before you regret it."**

A humorous, lightweight fitness tracker that judges your life choices. Built with vanilla HTML, CSS, and JavaScript, this app tracks your calories, workouts, and water intake, serving up memes and snarky comments based on your performance.

## Features

### 🍎 Calorie Tracking
- **Food Log**: Add custom foods or select from a preset list.
- **Workout Log**: Track Cardio (Time/Speed/Incline) and Strength (Sets/Reps/Weight/Effort).
- **Net Calculation**: Automatically calculates Calories In vs. Calories Out.

### 💧 Water Tracker
- Interactive water bottle tracker (Goal: 3L/day).
- Visual progress indicators.

### ⚖️ The Judgement Zone
- **Dynamic Memes**: The app reacts to your net calories.
    - **Good**: "Skinny legend in the making."
    - **Bad**: "I see you chose violence (and carbs) today."
- **Motivation Station**: Random motivational quotes to keep you going (or guilt-trip you).

### 📅 History & Persistence
- **Local Storage**: All data is saved locally in your browser.
- **History View**: View past days, see if you hit your goals, and review logs.
- **Editing**: Go back and fix mistakes in previous days.
- **Finish Day**: Lock your day to prevent accidental edits (can be unlocked via History).

## Tech Stack
- **Frontend**: HTML5, CSS3 (Variables, Flexbox/Grid), JavaScript (ES6+).
- **Deployment**: Docker (Nginx).

## Quick Start (Docker)

1.  Clone the repo.
2.  Run with Docker Compose:
    ```bash
    docker-compose up -d --build
    ```
3.  Open `http://localhost` (or your server IP).

## Manual Setup
Simply open `index.html` in any modern web browser. No build step required!

---
*Version 1.0*
