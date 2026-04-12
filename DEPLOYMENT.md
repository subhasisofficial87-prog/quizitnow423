# QuizItNow — Hostinger Deployment Guide

## Prerequisites
- Hostinger Business/Cloud hosting plan with Node.js support
- MySQL database (available via hPanel)
- Domain: aituition.in

## Step 1: Set Up MySQL Database in hPanel

1. Login to Hostinger hPanel → **Databases** → **MySQL Databases**
2. Create a new database: `quizitnow`
3. Create a database user and assign it to the database (all privileges)
4. Note the hostname (usually `localhost` or a specific host for shared hosting)
5. Go to **phpMyAdmin** and import `schema.sql`

## Step 2: Set Up Node.js in hPanel

1. Go to hPanel → **Advanced** → **Node.js**
2. Click **Create Application**
3. Set:
   - Node.js version: **20.x** (LTS)
   - Application mode: **Production**
   - Application root: `/public_html` (or your domain folder)
   - Application URL: your domain
   - Application startup file: `server.js`
4. Click **Create**

## Step 3: Clone/Upload Code

### Option A: Git (recommended)
```bash
# In Hostinger terminal (SSH)
cd /home/username/public_html
git clone https://github.com/yourusername/quizitnow.git .
```

### Option B: File Manager
- Zip the project (excluding node_modules and .next)
- Upload via hPanel File Manager
- Unzip in `/public_html`

## Step 4: Configure Environment Variables

Create `.env.local` in the project root:
```bash
nano /home/username/public_html/.env.local
```

Fill in:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_hostinger_db_user
MYSQL_PASSWORD=your_hostinger_db_password
MYSQL_DATABASE=quizitnow

JWT_SECRET=your_super_secret_32_char_minimum_key_here

ANTHROPIC_API_KEY=sk-ant-your_actual_key

RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=your_live_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx

NEXT_PUBLIC_APP_URL=https://aituition.in
```

## Step 5: Install Dependencies & Build

In Hostinger terminal (SSH):
```bash
cd /home/username/public_html
npm install
npm run build
```

## Step 6: Start the Application

In hPanel → Node.js → Click **Restart** on your application.

OR via SSH:
```bash
NODE_ENV=production node server.js
```

The app will run on the configured port (Hostinger handles proxy).

## Step 7: Configure Domain

1. In hPanel → **Domains** → point your domain to the Node.js app port
2. Enable **SSL** via hPanel → SSL/TLS → Let's Encrypt

## Step 8: Test the Deployment

1. Visit `https://aituition.in`
2. Test registration, login
3. Test book upload (this calls Anthropic API — make sure the key is valid)
4. Test Razorpay payment flow (use test keys first)

## Troubleshooting

### App not starting
- Check logs in hPanel → Node.js → Logs
- Ensure `node_modules` is installed
- Check `.env.local` exists and has correct values

### MySQL connection failed
- Verify MYSQL_HOST (on Hostinger shared hosting, use `localhost`)
- Check user has ALL PRIVILEGES on the database
- Run `schema.sql` again via phpMyAdmin if tables are missing

### Anthropic API errors
- Verify `ANTHROPIC_API_KEY` is correct
- Check API usage limits at console.anthropic.com

### Build errors
- Run `npm run lint` to check TypeScript errors
- Ensure Node.js 20+ is being used

## Maintenance

### Update the app
```bash
cd /home/username/public_html
git pull origin main
npm install
npm run build
# Then restart from hPanel Node.js panel
```

### View logs
```bash
# hPanel → Node.js → Logs
# Or SSH:
tail -f /home/username/logs/nodejs.log
```

## Production Checklist

- [ ] `.env.local` configured with real API keys
- [ ] Database created and `schema.sql` imported
- [ ] SSL certificate enabled
- [ ] Razorpay switched to live keys
- [ ] Test registration and payment flow
- [ ] Monitor error logs after launch
