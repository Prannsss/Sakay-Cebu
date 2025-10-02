# 🚖 SakayHub – Cebu Vehicle Rental Platform

SakayHub is a prototype vehicle rental app designed for **Cebu locals and tourists**. It allows users to rent cars, vans, motorbikes, and more, while enabling providers to list and manage their vehicles. The system is built for easy testing with **localStorage**, making it fully functional without a backend.

---

## 🌟 Features

### User (Tourist/Local)
- 🔑 Sign-up / Login (stored in localStorage)
- 🔍 Search vehicles by type, location, and availability
- 📅 Book rentals with custom pick-up and drop-off times
- 💳 Simulated payments (Credit Card, PayPal, Cash on Delivery)
- 🛠 Extend bookings, view history, and contact providers
- ⭐ Leave ratings, reviews, and earn loyalty points

### Vehicle Provider (Owners/Managers)
- 📝 Register and verify provider accounts
- 🚗 Add and manage vehicles (model, pricing, photos, availability)
- 📩 Approve or decline bookings
- 📊 Track earnings and bookings
- 📢 View and respond to user feedback

---

## 💡 Technical Highlights
- **LocalStorage**: Used for users, vehicles, bookings, payments, and reviews  
- **Light/Dark Mode**: Theme toggle with preference saved in localStorage  
- **Responsive UI**: Built with **TailwindCSS** for a clean, modern design  
- **Component-Based**: Separate dashboards for Users and Providers  
- **Charts & Analytics**: Visual insights into booking trends and earnings  

---

## 🛠 Installation & Setup

```bash
# Clone repository
git clone https://github.com/yourusername/sakayhub.git
cd sakayhub

# Install dependencies
npm install

# Start development server
npm run dev
