# 💰 Finance Tracker

A mobile-first Progressive Web App (PWA) to track your finances, bills, debts, and weekly profits.

## Features

✅ **Account Management**
- Track multiple accounts: Bank, Cash, and 2 Savings accounts
- Add or subtract money from any account
- Real-time total overview

✅ **Weekly Profits Tracking**
- Record all your weekly profits
- Automatic 10% tithe calculation
- Mark profits as paid and choose which account to add them to

✅ **Debt & Bills Tracking**
- Track all your debts and unpaid bills
- Flexible payment options: full or partial payments
- Split payments across multiple accounts
- Choose exactly where to debit from

✅ **Data Management**
- All data stored locally in your browser (localStorage)
- Export your data as JSON file
- Import data on another device
- No internet required after installation

✅ **Mobile Optimized**
- Responsive design that works perfectly on phones
- Touch-friendly buttons (minimum 44px)
- Dark mode support
- Can be installed as a PWA on your home screen

## Installation

### Desktop/Laptop
1. Open `index.html` in a web browser
2. The app works immediately - no installation needed!

### Mobile (PWA Installation)
1. First, generate the app icons:
   - Open `create-icons.html` in a browser
   - Click the download buttons to save icon-192.png and icon-512.png
   - Place these files in the same folder as index.html

2. Host the files on a web server (or use a local server)
   - Option 1: Upload to any web hosting service
   - Option 2: Run a local server (see below)

3. Open the app in your mobile browser
4. Look for "Add to Home Screen" or "Install App" option
5. The app will work offline after installation!

### Running a Local Server

#### Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js:
```bash
npx http-server
```

Then open `http://localhost:8000` in your browser.

## Usage Guide

### Managing Accounts
- Click the **+** button to add money to an account
- Click the **-** button to subtract money from an account
- Your total balance updates automatically

### Adding Profits
1. Click **+ Add Profit** in the profits section
2. Enter a description (optional) and amount
3. Check "Mark as paid" if you want to immediately add it to an account
4. Choose which account receives the profit
5. The app automatically calculates 10% tithe

### Tracking Debts
1. Click **+ Add Debt** in the debts section
2. Enter who you owe (e.g., "Store XYZ") and the amount
3. When ready to pay, click **Pay**
4. Choose full or partial payment
5. Select which account(s) to pay from
6. You can split payment across multiple accounts!

### Exporting/Importing Data
1. Click the **📤** button in the header
2. **Export**: Download your data as a JSON file
3. **Import**: Upload a previously exported JSON file
4. Perfect for switching between phone and desktop!

## Technical Details

- **Pure HTML/CSS/JavaScript** - No frameworks needed
- **LocalStorage API** - Data persists in browser
- **PWA Ready** - Installable and works offline
- **Mobile-First Design** - Optimized for touch screens
- **No Backend Required** - Everything runs in your browser

## Browser Support

Works in all modern browsers:
- Chrome/Edge (recommended for PWA installation)
- Firefox
- Safari
- Opera

## Data Privacy

🔒 **100% Private**
- All data stays on YOUR device
- No data sent to any server
- No tracking or analytics
- No account registration needed

## Files Structure

```
financial-life/
├── index.html          # Main HTML structure
├── style.css           # Styles and responsive design
├── app.js              # Core functionality
├── manifest.json       # PWA configuration
├── sw.js              # Service worker for offline support
├── create-icons.html   # Icon generator utility
├── icon-192.png       # PWA icon (small)
├── icon-512.png       # PWA icon (large)
└── README.md          # This file
```

## Tips

💡 **Best Practices:**
- Export your data regularly as backup
- Use the split payment feature for complex transactions
- Check your tithe calculations weekly
- Install as PWA for the best mobile experience

## License

Free to use and modify for personal use.

---

Built with ❤️ for simple, effective financial tracking
