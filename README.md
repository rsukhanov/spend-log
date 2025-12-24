# 📱 SpendLog Frontend (Telegram WebApp)

This is the client-side application (Frontend) for **SpendLog** — a personal AI-powered financial assistant in Telegram.
The project is built as a **Telegram WebApp** (TWA), allowing users to view analytics and manage expenses directly inside the messenger.

> 🤖 **Live Bot:** [@spends_log_bot](https://t.me/spends_log_bot)
> ⚙️ **Backend Repository:** [github.com/rsukhanov/spend-log-b](https://github.com/rsukhanov/spend-log-b)

## ✨ Key Features

- 📊 **Visualization:** Interactive charts and diagrams for expense categories.
- 📅 **History:** Transaction feed with filtering by date and type.
- 🔒 **Security:**
    - The app is accessible **only** within Telegram.
    - `Telegram Init Data` validation ensures requests cannot be forged.
    - API protection via signature verification.

## 🛠 Tech Stack

- **Framework:** [Next.js 15] (App Router)
- **UI Library:** [React]
- **Styling:** [Tailwind CSS] + [shadcn/ui]
- **State Management:** [Zustand]
- **Integration:** Telegram WebApp SDK
- **Icons:** Lucide React