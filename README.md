# BillSplit - Simplify Group Expenses

Welcome to **BillSplit**, a full-stack application built to ease the pain of group bill management. Whether it's a trip, party, or dinner night, BillSplit ensures no one is confused about who owes what. This project was built as part of the **Spider Application Dev Task 2**.

---

## ✨ Features Overview

### 🔐 Level 1: Core Functionality

- **Authentication:**
  - Secure Login & Logout using JWT/session-based auth.

- **User Management:**
  - Search other users.
  - Send/accept/cancel friend requests.

- **Group Management:**
  - Create and manage bill-splitting groups.
  - Add/remove only friends from groups.

- **Expense Management:**
  - Add expenses with categories (e.g., Food, Travel, Tickets).
  - Equally split bills among selected members.
  - Delete expenses (only by creator).
  - See how much each person owes/gets back.

- **Group Control:**
  - Group creator can delete the group.

---

### 🔄 Level 2: Enhanced UX

- **Profile:**
  - View and update user profile info.
  - Upload and change profile picture.

- **Security:**
  - Password reset via email link.

- **Data Visualization:**
  - Category-wise Pie & Doughnut Charts per group.

- **Email Summary:**
  - Send detailed group expense summary to user's email.

- **Splash & Connectivity Screens:**
  - Custom animated splash screen.
  - Internet connectivity check with friendly error screen.

---

### 🌟 Level 3: Power Features

- **OAuth Integration:**
  - Google / Facebook login via Passport.js

- **Push Notifications:**
  - Real-time alerts when a friend request is received or an expense is added.

- **Flexible Bill Splitting:**
  - Unequal splitting via:
    - Percentage (e.g., 60/30/10).
    - Exact amounts (e.g., ₹100/₹50/₹150).

- **Selective Participation:**
  - Choose subset of group members per expense (e.g., 3 out of 5).

---

## 📅 Tech Stack

### Frontend
- React / React Native / Next.js *(Choose based on your implementation)*
- Tailwind CSS / Styled Components
- Chart.js or Recharts (for visualizations)
- Axios / Fetch API

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Firebase (for push notifications or auth)
- Passport.js (OAuth)
- JWT or Express Sessions
- Nodemailer (email summaries & password reset)

---

## 🛍️ Installation & Setup

### Backend:
```bash
cd backend
npm install
npm run dev
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

> Configure `.env` files for both frontend and backend accordingly.

---

## 🛠️ .env Configuration (Sample)

### Backend
```env
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb+srv://...
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_password
FRONTEND_URL=http://localhost:3000
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

---

## 📍 Folder Structure

```
.
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── utils
│   └── ...
├── frontend
│   ├── components
│   ├── pages
│   ├── utils
│   └── ...
```

---

## 🛠️ Future Enhancements
- Settling expenses (one-click payment suggestion)
- Group chats or discussion threads
- PDF export of monthly group summaries

---

## 👥 Author

**[@MradulKSharma06](https://github.com/MradulKSharma06)**

> Developed with passion to solve real-world group trip problems.

Feel free to connect or contribute! ✨

---

## 📁 License

This project is licensed under the [MIT License](LICENSE).
