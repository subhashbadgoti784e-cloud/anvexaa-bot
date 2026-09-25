import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  proto
} from '@whiskeysockets/baileys';
import pino from 'pino';

const app = express();
app.use(express.json());

const PORT = 3000;
const AUTH_DIR = path.join(process.cwd(), '.baileys_session');

// In-memory state for WhatsApp connection
let waSocket: any = null;
let currentQR: string | null = null;
let currentQRDataUrl: string | null = null;
let connectionStatus: 'idle' | 'generating' | 'qr_ready' | 'connected' | 'error' = 'idle';
let connectedUser: any = null;
let lastError: string | null = null;
const eventLogs: Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'bot' | 'user' | 'error' }> = [];

function addLog(text: string, type: 'info' | 'success' | 'bot' | 'user' | 'error' = 'info') {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  eventLogs.unshift({ id: Math.random().toString(36).substring(2), time, text, type });
  if (eventLogs.length > 50) eventLogs.pop();
}

addLog('WhatsApp Engine Backend Initialized', 'info');

// Auto-Reply reply generator
function getAutoReply(text: string): string {
  const cleaned = text.trim().toLowerCase();
  const greetings = ['hi', 'hello', 'namaste', 'hey', 'start', 'menu', 'hlo', 'hii', 'hy'];
  
  if (greetings.includes(cleaned)) {
    return `Namaste! 🙏 *Anvexaa AI* mein aapka swagat hai.\n\nHum businesses ko grow karne mein madad karte hain using AI-powered video ads, websites aur WhatsApp automation! 🚀\n\nKripya vikalp chunein:\n1️⃣ *AI Services* - Hamari services ki detail\n2️⃣ *Pricing* - Website & Video packages\n3️⃣ *Portfolio & Website* - Hamara kaam aur links\n4️⃣ *Free Demo Book Karein* - Team se baat & Free Demo\n\n👉 *Reply karein:* 1, 2, 3 ya 4 bhejein.`;
  }

  if (cleaned === '1' || cleaned.includes('service') || cleaned.includes('product') || cleaned.includes('work')) {
    return `🚀 *Services by Anvexaa AI*:\n\n1. 🤖 *AI Automation*: WhatsApp 24/7 lead handling, bulk messaging\n2. 💻 *Professional Website*: High-converting modern business website (₹19,999)\n3. 🎬 *AI Video Content*: Engaging AI generated videos (₹1,499 per 1 min)\n4. 🎨 *Animation Video*: 2D/3D explainers (₹1,499 per 1 min)\n5. 📢 *Promotional Ads*: High-ROI Meta/YouTube ads (₹1,499 per 1 min)\n\n💡 Full Pricing ke liye *2* bhejein, ya *Free Demo* ke liye *4* bhejein!`;
  }

  if (cleaned === '2' || cleaned.includes('price') || cleaned.includes('rate') || cleaned.includes('cost') || cleaned.includes('package')) {
    return `💰 *Anvexaa AI - Official Pricing*:\n\n1️⃣ *AI WhatsApp Automation*: Custom Setup + Lead Bot\n2️⃣ *Professional Website*: ₹19,999 (Complete Responsive Website)\n3️⃣ *AI Video Content*: ₹1,499 per 1 min\n4️⃣ *Animation Video*: ₹1,499 per 1 min\n5️⃣ *Promotional Video (Ads)*: ₹1,499 per 1 min\n\n🎁 *Special Offer:* Aapke business type ke hisab se hum ek *FREE DEMO* bana sakte hain! 🙂\n\nFree demo claim karne ke liye *4* reply karein.`;
  }

  if (cleaned === '3' || cleaned.includes('portfolio') || cleaned.includes('website') || cleaned.includes('link')) {
    return `🌐 *Anvexaa AI - Official Details*:\n\n🔗 Website / Portfolio: https://anvexaa.ai\n📍 Hub: Anvexaa AI Tech Hub\n\n✨ Hum All-India businesses ke sath remote aur on-site AI marketing solutions par kaam karte hain.`;
  }

  if (cleaned === '4' || cleaned.includes('demo') || cleaned.includes('call') || cleaned.includes('free') || cleaned.includes('baat')) {
    return `✨ *Free Demo Request Received - Anvexaa AI*:\n\nDhanyawad! Hamari team ko aapka message mil gaya hai. Subhash Meena (+91 8854910735) aapse WhatsApp/call par jald hi connect karenge 🙂\n\n📞 Direct Helpline: +91 8854910735\n• Anvexaa AI Team`;
  }

  return `⚠️ Samajh nahi aaya, kripya 1 se 4 mein se number bhejein:\n\n1️⃣ AI Services\n2️⃣ Pricing (Website ₹19,999 | Video Ads ₹1,499)\n3️⃣ Website & Portfolio\n4️⃣ Free Demo Book Karein`;
}

// Start Baileys WhatsApp Socket
async function startWhatsApp() {
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    connectionStatus = 'generating';
    currentQR = null;
    currentQRDataUrl = null;
    addLog('Connecting to WhatsApp Web Multi-Device servers...', 'info');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    waSocket = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: ['Anvexaa AI Bot', 'Chrome', '1.0.0'],
      syncFullHistory: false
    });

    waSocket.ev.on('creds.update', saveCreds);

    waSocket.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQR = qr;
        connectionStatus = 'qr_ready';
        try {
          currentQRDataUrl = await QRCode.toDataURL(qr, {
            width: 320,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' }
          });
          addLog('Real WhatsApp Web QR Code generated! Please scan from WhatsApp.', 'info');
        } catch (e) {
          console.error('QR Render error:', e);
        }
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        connectionStatus = 'idle';
        currentQR = null;
        currentQRDataUrl = null;
        connectedUser = null;
        addLog(`Connection closed: ${lastDisconnect?.error?.message || 'Disconnected'}. Reconnecting: ${shouldReconnect}`, 'error');

        if (shouldReconnect) {
          setTimeout(() => startWhatsApp(), 3000);
        }
      } else if (connection === 'open') {
        connectionStatus = 'connected';
        currentQR = null;
        currentQRDataUrl = null;
        connectedUser = waSocket?.user || { id: 'Connected' };
        const phone = connectedUser.id?.split(':')[0] || 'Phone';
        addLog(`🎉 WhatsApp Successfully Linked! Number: +${phone}`, 'success');
        addLog('Anvexaa AI Auto-Responder is now ACTIVE for incoming customer messages!', 'bot');
      }
    });

    // Listen for incoming messages
    waSocket.ev.on('messages.upsert', async (m: any) => {
      if (m.type !== 'notify') return;

      for (const msg of m.messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid || remoteJid.endsWith('@g.us')) continue; // skip group chats

        const text = 
          msg.message.conversation || 
          msg.message.extendedTextMessage?.text || 
          msg.message.imageMessage?.caption || 
          '';

        if (!text) continue;

        const senderPhone = remoteJid.replace('@s.whatsapp.net', '');
        addLog(`Incoming message from +${senderPhone}: "${text}"`, 'user');

        const reply = getAutoReply(text);
        
        try {
          await waSocket.sendMessage(remoteJid, { text: reply }, { quoted: msg });
          addLog(`Anvexaa Bot Auto-Replied to +${senderPhone}`, 'bot');
        } catch (err: any) {
          addLog(`Error sending reply: ${err.message}`, 'error');
        }
      }
    });

  } catch (err: any) {
    connectionStatus = 'error';
    lastError = err.message;
    addLog(`Error starting WhatsApp: ${err.message}`, 'error');
  }
}

// API Routes
app.get('/api/wa/status', (req, res) => {
  res.json({
    status: connectionStatus,
    qrDataUrl: currentQRDataUrl,
    user: connectedUser,
    logs: eventLogs,
    lastError
  });
});

app.post('/api/wa/pairing-code', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Enter a valid phone number with country code (e.g. 918854910735)' });
    }

    if (!waSocket || connectionStatus === 'idle') {
      await startWhatsApp();
      // Give socket 2.5s to establish connection
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    addLog(`Requesting real 8-digit WhatsApp linking code for +${cleanPhone}...`, 'info');
    const rawCode = await waSocket.requestPairingCode(cleanPhone);
    const formattedCode = rawCode?.match(/.{1,4}/g)?.join('-') || rawCode;
    addLog(`✅ Real WhatsApp Linking Code Received: ${formattedCode}`, 'success');
    
    res.json({ success: true, pairingCode: formattedCode });
  } catch (err: any) {
    console.error('Pairing code error:', err);
    addLog(`Pairing code error: ${err.message}`, 'error');
    res.status(500).json({ error: err.message || 'Failed to request pairing code from WhatsApp' });
  }
});

app.post('/api/wa/start', async (req, res) => {
  await startWhatsApp();
  res.json({ success: true, status: connectionStatus });
});

app.post('/api/wa/disconnect', async (req, res) => {
  try {
    if (waSocket) {
      await waSocket.logout();
      waSocket = null;
    }
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }
    connectionStatus = 'idle';
    currentQR = null;
    currentQRDataUrl = null;
    connectedUser = null;
    addLog('WhatsApp Session cleared and logged out.', 'info');
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Vite Middleware for Full-stack Dev
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    
    // Serve transformed index.html for all non-api SPA routes
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    // Start WhatsApp engine on server start
    startWhatsApp();
  });
}

startServer();
