# 💰 Financial Life Tracker

A mobile-first Progressive Web App (PWA) for tracking your complete financial portfolio - accounts, profits, debts, tithe, and seed obligations.

![Financial Life Tracker](./public/favicon.png)

## 🌟 Features

### 💳 Account Management
- Track unlimited custom accounts (Bank, Cash, Savings, etc.)
- Choose custom names and icons for each account
- Add or subtract money with simple +/- buttons
- Real-time total balance overview
- Delete accounts you no longer need
- Accounts automatically appear in all payment dropdowns

### 📈 Profit Tracking
- Log weekly/monthly profits with descriptions
- Automatic 20% obligation calculation:
  - 10% for Tithe 🙏
  - 10% for Seed 🌱
- Mark profits as paid and choose destination account(s)
- Split profit payments across multiple accounts
- View profit history with payment status
- Collapsible section to reduce scrolling

### 💸 Tithe & Seed Management
- **Sliding sidebar panel** to track obligations separately
- Obligations automatically accumulate as you add profits
- **Editable amounts** - Add your existing tithe/seed balances
- Pay obligations when ready from any account(s)
- Split payments across multiple accounts
- Visual indicator (red button) when obligations pending
- Independent tracking for Tithe and Seed

### 📋 Debt & Bills Tracking
- Track all debts and unpaid bills
- Full or partial payment options
- Split payments across multiple accounts
- Choose exactly which account(s) to debit from
- Total debts summary
- Collapsible section

### 📊 Financial Overview
- **Total Available**: Sum of all account balances
- **After Bills & Tithe** (in red): Shows true available money after pending obligations
  - Formula: `Total - Debts - Tithe - Seed`
  - Only displays when you have pending obligations

### 💾 Data Management
- All data stored locally in browser (localStorage)
- **Export**: Download complete backup as JSON file
- **Import**: Restore data on another device
- **Reset**: Clear all data and start fresh
- No internet required after installation
- Your data never leaves your device

### 📱 Mobile-First Design
- Responsive layout optimized for phones
- Touch-friendly buttons (44px minimum)
- Smooth animations and transitions
- Dark mode support (auto-detects system preference)
- Installable as PWA on mobile home screen
- Works offline after installation

## 🚀 Quick Start

### Desktop/Browser
1. Open `index.html` in any modern web browser
2. Start tracking your finances immediately!

### Mobile (PWA Installation)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" or "Install App"
3. The app icon will appear on your home screen
4. Launch like a native app - works offline!

## 📖 How To Use

### Setting Up Accounts
1. The app starts with 4 default accounts (Bank, Cash, Savings 1, Savings 2)
2. Click **"+ Add Account"** to create custom accounts
3. Choose a name and icon for each account
4. Add starting balances using the **+** button

### Tracking Profits
1. Click **"+ Add Profit"** in the profits section
2. Enter description and amount
3. Tithe (10%) and Seed (10%) are automatically tracked in the sidebar
4. When ready, click **"Mark Paid"** to add the profit to your accounts

### Managing Tithe & Seed
1. Click the **◀** arrow on the right to open the obligations sidebar
2. **Edit amounts** if you have existing tithe/seed to add
3. Obligations automatically accumulate as you add profits
4. Click **"Pay Tithe"** or **"Pay Seed"** when ready
5. Choose which account(s) to pay from
6. Obligation is cleared after payment

### Tracking Debts
1. Click **"+ Add Debt"** in the debts section
2. Enter description (e.g., "Store XYZ") and amount
3. Click **"Pay"** when ready to settle
4. Choose full or partial payment
5. Select which account(s) to pay from
6. Split payments across multiple accounts if needed

### Exporting/Importing Data
1. Click the **📤** button in the header
2. **Download Data (JSON)**: Export complete backup
3. **Import Data from File**: Restore from backup
4. Perfect for switching between phone and desktop
5. **Reset All Data**: Clear everything and start fresh

## 💡 Pro Tips

### Workflow Optimization
- **Collapse sections** by clicking the section heading to reduce scrolling
- Keep profits collapsed after adding to quickly access debts
- Use the obligations sidebar to see pending tithe/seed at a glance

### Financial Planning
- Check "After Bills & Tithe" (red amount) to see your true available balance
- Export data regularly as backup
- Edit obligation amounts to add your existing tithe/seed balances
- Split payments strategically across accounts

### Organization
- Create accounts for different purposes (Emergency Fund, Vacation, etc.)
- Use descriptive profit descriptions for better tracking
- Mark profits as paid to keep your accounts updated

## 🎨 Customization

### Account Icons Available
💰 💵 💳 🏦 🔒 🔐 💎 🏠 🚗 📱 🎯 ⭐

### Color Scheme
- Primary Blue: Actions and highlights
- Success Green: Positive actions (add money, pay)
- Danger Red: Negative actions (subtract, delete)
- Warning Orange: Obligations and important info
- Supports system dark mode

## 🔒 Privacy & Security

- ✅ **100% Private** - All data stays on YOUR device
- ✅ **No Server** - No data sent anywhere
- ✅ **No Tracking** - No analytics or monitoring
- ✅ **No Account** - No registration required
- ✅ **Offline First** - Works without internet

## 🛠️ Technical Details

### Built With
- Pure HTML5, CSS3, JavaScript (ES6+)
- No frameworks or dependencies
- Progressive Web App (PWA) capabilities
- Service Worker for offline functionality
- LocalStorage for data persistence

### Browser Support
- ✅ Chrome/Edge (recommended for PWA)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Any modern mobile browser

### File Structure
```
financial-life/
├── index.html              # Main app structure
├── style.css              # Styles and responsive design
├── app.js                 # Core functionality
├── manifest.json          # PWA configuration
├── sw.js                  # Service worker for offline
├── public/
│   └── favicon.png        # App icon
├── create-icons.html      # Icon generator utility
├── README.md              # This file
├── UPDATES.md             # Feature changelog
└── TITHE-SEED-FEATURE.md  # Tithe/Seed documentation
```

## 📋 Features Roadmap

### Current Features ✅
- ✅ Custom accounts with icons
- ✅ Profit tracking with auto-calculation
- ✅ Tithe & Seed sidebar panel
- ✅ Debt management with split payments
- ✅ Collapsible sections
- ✅ Export/Import/Reset
- ✅ PWA support
- ✅ Dark mode

### Potential Future Features
- 📅 Date range filtering for profits
- 📊 Charts and graphs
- 🏷️ Categories for expenses
- 📝 Notes/descriptions for transactions
- 🔍 Search functionality
- 📈 Financial reports

## 🐛 Troubleshooting

### Data Not Saving
- Check if localStorage is enabled in browser
- Try exporting and importing data
- Clear browser cache and try again

### PWA Not Installing
- Must be accessed via HTTPS (or localhost)
- Ensure manifest.json and icons are accessible
- Try different browser (Chrome recommended)

### Calculations Seem Wrong
- Check pending tithe/seed in sidebar
- Verify all account balances
- Export data to review all transactions

## 📄 License

Free to use and modify for personal use.

## 🤝 Contributing

This is a personal finance tracker. Feel free to fork and customize for your needs!

## 📞 Support

- Check the documentation files (UPDATES.md, TITHE-SEED-FEATURE.md)
- Review this README for usage instructions
- All features work offline - no external dependencies

## 🙏 Acknowledgments

Built with a focus on:
- Simplicity and ease of use
- Privacy and data ownership
- Mobile-first experience
- Biblical financial stewardship principles

---

**Track your finances. Honor your commitments. Build your future.** 💰🙏🌱

Made with ❤️ for effective personal finance management
