# 🚀 How to Run Your Portfolio Website

## Method 1: Simple Frontend Only (Recommended for beginners)

### Step 1: Open Command Prompt
1. Press `Win + R`
2. Type `cmd` and press Enter

### Step 2: Navigate to Portfolio Folder
```bash
cd "C:\Users\DELL\Documents\New folder (2)\portfolio"
```

### Step 3: Start Python Server
```bash
python -m http.server 8000
```

### Step 4: Open Your Portfolio
- Open your web browser
- Go to: `http://localhost:8000/dillu.html`
- Or simply: `http://localhost:8000`

---

## Method 2: Full Backend Setup (Advanced)

### Step 1: Install Node.js (if not installed)
- Download from: https://nodejs.org/
- Install the LTS version

### Step 2: Install Dependencies
```bash
cd "C:\Users\DELL\Documents\New folder (2)\portfolio"
npm install express cors
```

### Step 3: Start Backend Server
```bash
node simple-server.js
```

### Step 4: Open Your Portfolio
- Go to: `http://localhost:3001/dillu.html`

---

## 🌟 What You'll See:

### Features Available:
- ✅ **Responsive Design** - Works on all devices
- ✅ **Dark/Light Theme Toggle** - Click the moon/sun icon
- ✅ **Smooth Animations** - Scroll effects and transitions
- ✅ **Interactive Navbar** - With dropdown menu
- ✅ **Contact Form** - With validation and feedback
- ✅ **Download Section** - Resume, portfolio, code samples
- ✅ **Blog Section** - Sample blog posts
- ✅ **Projects Gallery** - Your project showcase
- ✅ **Skills Section** - Animated skill bars
- ✅ **Education Timeline** - Your academic journey
- ✅ **Certificates** - Your achievements

### Navigation:
- **Home** - Hero section with typing effect
- **About** - About you section
- **Education** - Your academic background
- **Skills** - Technical and professional skills
- **Projects ▼** - Dropdown with:
  - All Projects
  - Certificates
  - Blog
- **Downloads** - Resume and resources
- **Contact** - Contact form and info

---

## 🔧 Troubleshooting:

### If Python server doesn't work:
```bash
# Try Python 3
python3 -m http.server 8000

# Or use Node.js
npx http-server -p 8000
```

### If port is busy:
```bash
# Use different port
python -m http.server 8080
# Then visit http://localhost:8080
```

### If backend doesn't work:
```bash
# Check Node.js version
node --version

# Install dependencies again
npm install express cors

# Use simple server
node simple-server.js
```

---

## 📱 Mobile Testing:
- Open Chrome
- Press `F12` for Developer Tools
- Click mobile device icon
- Test responsive design

---

## 🎯 Quick Start:
1. Open Command Prompt
2. Run: `cd "C:\Users\DELL\Documents\New folder (2)\portfolio"`
3. Run: `python -m http.server 8000`
4. Open browser: `http://localhost:8000`

That's it! Your portfolio is now running! 🎉
