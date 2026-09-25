import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  CheckCheck, 
  RotateCcw, 
  Settings, 
  Code2, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Mic, 
  Sparkles,
  ExternalLink,
  MapPin,
  Check,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { ChatMessage, BotConfig } from '../types';
import { AnvexaaLogo, AnvexaaLogoGlyph } from './AnvexaaLogo';

interface WhatsAppSimulatorProps {
  config: BotConfig;
  setConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ config, setConfig }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: `Namaste! 🙏 *${config.businessName}* mein aapka swagat hai.\n\nHum businesses ko grow karne mein madad karte hain using AI-powered video ads, websites aur WhatsApp automation! 🚀\n\nKripya vikalp chunein:\n1️⃣ *AI Services* - Hamari services ki detail\n2️⃣ *Pricing* - Website & Video packages\n3️⃣ *Portfolio & Website* - Hamara kaam aur links\n4️⃣ *Free Demo Book Karein* - Team se baat & Free Demo\n\n👉 *Reply karein:* 1, 2, 3 ya 4 bhejein.`,
      timestamp: '10:00 AM',
      status: 'read'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [lastPayload, setLastPayload] = useState<{
    webhookIn: any;
    graphApiOut: any;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Reply generator matching main.py logic precisely
  const generateBotReply = (text: string): string => {
    const cleaned = text.trim().toLowerCase();

    const greetings = ['hi', 'hello', 'namaste', 'pranam', 'hey', 'start', 'menu', 'madat', 'help'];
    if (greetings.includes(cleaned)) {
      return `Namaste! 🙏 *${config.businessName}* mein aapka swagat hai.\n\nHum businesses ko grow karne mein madad karte hain using AI-powered video ads, websites aur WhatsApp automation! 🚀\n\nKripya vikalp chunein:\n1️⃣ *AI Services* - Hamari services ki detail\n2️⃣ *Pricing* - Website & Video packages\n3️⃣ *Portfolio & Website* - Hamara kaam aur links\n4️⃣ *Free Demo Book Karein* - Team se baat & Free Demo\n\n👉 *Reply karein:* 1, 2, 3 ya 4 bhejein.`;
    }

    if (cleaned === '1' || cleaned.includes('service') || cleaned.includes('product') || cleaned.includes('work') || cleaned.includes('ai')) {
      return `🚀 *Services by ${config.businessName}*:\n\nHum aapke business ko grow karne ke liye ye services provide karte hain:\n\n1. 🤖 *AI Automation*: WhatsApp auto-reply, CSV bulk messaging, 24/7 lead handling\n2. 💻 *Professional Website*: High-converting modern business website (₹19,999)\n3. 🎬 *AI Video Content*: Engaging AI generated videos (₹1,499 per 1 min)\n4. 🎨 *Animation Video*: 2D/3D explainers for products (₹1,499 per 1 min)\n5. 📢 *Promotional Video (Ads)*: High-ROI Meta/YouTube ads (₹1,499 per 1 min)\n\n💡 Full Pricing dekhne ke liye *2* bhejein, ya *Free Demo* ke liye *4* bhejein!`;
    }

    if (cleaned === '2' || cleaned.includes('price') || cleaned.includes('rate') || cleaned.includes('cost') || cleaned.includes('package')) {
      return `💰 *${config.businessName} - Official Pricing*:\n\n1️⃣ *AI WhatsApp Automation*: Custom Setup + Lead Bot\n2️⃣ *Professional Website*: ₹19,999 (Complete Responsive Website)\n3️⃣ *AI Video Content*: ₹1,499 per 1 min\n4️⃣ *Animation Video*: ₹1,499 per 1 min\n5️⃣ *Promotional Video (Ads)*: ₹1,499 per 1 min\n\n🎁 *Special Offer:* Aapke business type ke hisab se hum ek *FREE DEMO* bana sakte hain! 🙂\n\nFree demo claim karne ke liye *4* reply karein.`;
    }

    if (cleaned === '3' || cleaned.includes('location') || cleaned.includes('address') || cleaned.includes('website') || cleaned.includes('portfolio')) {
      return `🌐 *${config.businessName} - Official Details*:\n\n📍 Hub: ${config.businessLocation}\n🔗 Website / Portfolio: ${config.googleMapsLink}\n\n✨ Hum All-India businesses ke sath remote aur on-site AI marketing solutions par kaam karte hain.`;
    }

    if (cleaned === '4' || cleaned.includes('demo') || cleaned.includes('baat') || cleaned.includes('call') || cleaned.includes('free')) {
      return `✨ *Free Demo Request Received - ${config.businessName}*:\n\nDhanyawad! Hamari team ko aapka message mil gaya hai. Hum aapke business ke liye ek customized *Free Demo* prepare karenge aur aapse jald hi WhatsApp/call par connect karenge 🙂\n\n📞 Direct Helpline: ${config.teamContactNumber}\n• Anvexaa AI`;
    }

    return `⚠️ Samajh nahi aaya, kripya 1 se 4 mein se number bhejein:\n\n1️⃣ AI Services\n2️⃣ Pricing (Website ₹19,999 | Video Ads ₹1,499)\n3️⃣ Website & Portfolio\n4️⃣ Free Demo Book Karein`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessageId = `msg-${Date.now()}`;

    // Add user message
    const newMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: text,
      timestamp: currentTime,
      status: 'read'
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Build Simulated Meta Webhook payload (GET/POST /webhook structure)
    const simulatedWebhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '919876543210',
                  phone_number_id: config.phoneNumberId || '109876543210987'
                },
                contacts: [{ profile: { name: 'Customer' }, wa_id: '919812345678' }],
                messages: [
                  {
                    from: '919812345678',
                    id: `wamid.${Math.random().toString(36).substring(2)}`,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    text: { body: text },
                    type: 'text'
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const replyBody = generateBotReply(text);

    // Build Simulated Meta Graph API Outgoing payload
    const simulatedGraphApiOut = {
      endpoint: `POST https://graph.facebook.com/v21.0/${config.phoneNumberId || '109876543210987'}/messages`,
      headers: {
        Authorization: `Bearer ${config.whatsappToken ? '••••••••' + config.whatsappToken.slice(-6) : 'EAAxxxxxxxx (from .env)'}`,
        'Content-Type': 'application/json'
      },
      body: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '919812345678',
        type: 'text',
        text: {
          preview_url: true,
          body: replyBody
        }
      }
    };

    setLastPayload({
      webhookIn: simulatedWebhookPayload,
      graphApiOut: simulatedGraphApiOut
    });

    // Simulate realistic network delay (600ms)
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyBody,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]);
    }, 700);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'bot',
        text: `Namaste! 🙏 *${config.businessName}* mein aapka swagat hai.\n\nKripya neeche diye gaye vikalpo (options) mein se chunein:\n\n1️⃣ *Products* - Hamare products ki jaankari\n2️⃣ *Price list* - Latest pricing aur offers\n3️⃣ *Location* - Address aur Google Maps link\n4️⃣ *Humse baat karni hai* - Support team call back\n\n👉 *Kripya reply karein:* 1, 2, 3 ya 4 bhejein.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      }
    ]);
  };

  // Helper to format WhatsApp markdown (*bold* and bullet points)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return (
      <div className="space-y-1 text-sm leading-relaxed whitespace-pre-wrap break-words">
        {lines.map((line, idx) => {
          // Replace *text* with <strong>text</strong>
          const parts = line.split(/(\*[^*]+\*)/g);
          return (
            <p key={idx} className={line === '' ? 'h-2' : ''}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(1, -1)}</strong>;
                }
                // Check if part is a link
                if (part.includes('http')) {
                  const words = part.split(' ');
                  return words.map((w, wIdx) => 
                    w.startsWith('http') ? (
                      <a key={wIdx} href={w} target="_blank" rel="noreferrer" className="text-emerald-700 underline break-all font-medium inline-flex items-center gap-0.5">
                        {w}
                      </a>
                    ) : (
                      w + ' '
                    )
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto">
      {/* Intro Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white">Interactive WhatsApp Auto-Reply Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test the exact Hinglish logic executed by <code className="text-emerald-400 font-mono">main.py</code>. Incoming messages simulate Meta's Webhook POST payload.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://wa.me/${config.teamContactNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi Anvexaa AI, mujhe services ki detail chahiye!')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            title="Open real chat in WhatsApp App"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp App</span>
          </a>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showInspector 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showInspector ? 'Hide Payloads' : 'Inspect Meta Payload'}</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Bot Config</span>
          </button>

          <button
            onClick={resetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition-all"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Phone Simulator on Left, Inspector / Quick Options on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: WhatsApp Smartphone Mockup (5 Cols on LG) */}
        <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-[36px] p-3 bg-slate-900 border-4 border-slate-800 shadow-2xl relative">
            {/* Phone Notch / Speaker */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Inner Screen */}
            <div className="w-full h-[620px] rounded-[28px] overflow-hidden flex flex-col bg-[#efeae2] relative shadow-inner">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white pt-7 pb-2.5 px-3 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-950 border border-cyan-400/40 flex items-center justify-center p-0.5 shadow-md shadow-cyan-500/20 overflow-hidden">
                      <AnvexaaLogoGlyph size={32} />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#075E54] rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm leading-tight max-w-[130px] truncate">{config.businessName}</p>
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-[8px] font-bold" title="Verified WhatsApp Business Account">
                        ✓
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-200">Online | Official AI Solutions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-emerald-100">
                  <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
                  <Video className="w-4 h-4 cursor-pointer hover:text-white" />
                  <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]">
                {/* Security notice banner */}
                <div className="flex justify-center">
                  <div className="bg-amber-100/90 text-amber-900 border border-amber-200 text-[10px] px-2.5 py-1 rounded-md shadow-xs text-center max-w-[260px]">
                    🔒 Messages are end-to-end encrypted. Meta Cloud API v21.0 Webhook active.
                  </div>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-slate-900 shadow-sm relative text-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#d9fdd3] rounded-tr-xs'
                          : 'bg-white rounded-tl-xs'
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[9px] text-slate-500 font-medium">
                          {msg.timestamp}
                        </span>
                        {msg.sender === 'user' && (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Reply Chips for User Test */}
              <div className="bg-white/90 backdrop-blur-xs px-2 py-1.5 border-t border-slate-200/80 flex items-center gap-1 overflow-x-auto text-[11px] no-scrollbar">
                <button
                  onClick={() => handleSendMessage('Hi')}
                  className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 whitespace-nowrap font-medium"
                >
                  🙏 Namaste / Hi
                </button>
                <button
                  onClick={() => handleSendMessage('1')}
                  className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 whitespace-nowrap font-medium"
                >
                  1️⃣ AI Services
                </button>
                <button
                  onClick={() => handleSendMessage('2')}
                  className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 whitespace-nowrap font-medium"
                >
                  2️⃣ Pricing (₹19,999 / ₹1,499)
                </button>
                <button
                  onClick={() => handleSendMessage('3')}
                  className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 whitespace-nowrap font-medium"
                >
                  3️⃣ Website & Links
                </button>
                <button
                  onClick={() => handleSendMessage('4')}
                  className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 whitespace-nowrap font-medium"
                >
                  4️⃣ Free Demo Book Karein
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200">
                <Smile className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-700" />
                <Paperclip className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-700" />

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type 1, 2, 3, 4 or custom text..."
                  className="flex-1 bg-white text-slate-900 placeholder:text-slate-400 text-xs px-3 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                {inputText.trim() ? (
                  <button
                    onClick={() => handleSendMessage()}
                    className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 -ml-0.5" />
                  </button>
                ) : (
                  <button className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Menu Tester & Meta Payload Inspector (6/7 Cols on LG) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-5">
          {/* Official Anvexaa AI Branding Card with 5 AI Services */}
          <AnvexaaLogo size="hero" showServices={true} />

          {/* Quick Keyword Menu Guide Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Hinglish Menu Keywords Specification</span>
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">
              Click any scenario button below to trigger the exact message on the phone and view the FastAPI response:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSendMessage('Namaste')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>Greeting (Hi / Namaste)</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Returns Anvexaa AI welcome message with 1, 2, 3, 4 options menu.
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('1')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>Option 1 (AI Services)</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Sends WhatsApp automation, website, and AI video ads services.
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('2')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>Option 2 (Official Pricing)</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Sends Website: ₹19,999 | Video Ads: ₹1,499/min + Free Demo offer!
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('3')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>Option 3 (Website & Links)</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Sends official site https://anvexaa.ai and portfolio details.
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('4')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>Option 4 (Free Demo Request)</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Confirms Free Demo creation for user's business type & calls back.
                </p>
              </button>

              <button
                onClick={() => handleSendMessage('kuch bhi random query')}
                className="p-3 text-left rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
                  <span>Fallback (Unrecognized)</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-300">
                  Polite guidance: "Samajh nahi aaya, kripya 1 se 4 mein se number bhejein"
                </p>
              </button>
            </div>
          </div>

          {/* Under-the-hood Meta Payloads */}
          {showInspector && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Under The Hood: Meta Webhook & Graph API</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                  HTTP 200 OK
                </span>
              </div>

              {lastPayload ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                      <span>1. Incoming Meta Webhook POST payload (Received at /webhook)</span>
                      <span className="text-emerald-400">POST /webhook</span>
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-48">
                      {JSON.stringify(lastPayload.webhookIn, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                      <span>2. Outgoing WhatsApp Cloud API Request (Sent by main.py)</span>
                      <span className="text-teal-400">graph.facebook.com/v21.0</span>
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-sky-300/90 overflow-x-auto max-h-48">
                      {JSON.stringify(lastPayload.graphApiOut, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                  Send a message from the phone to see the live incoming Meta Webhook payload and outgoing Graph API requests!
                </div>
              )}
            </div>
          )}

          {/* Quick Info Checklist */}
          <div className="bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-900/40 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Production Architecture Rules (from spec)</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero token hardcoding — All keys retrieved via <code className="text-emerald-300 font-mono">os.getenv()</code></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>GET /webhook verifies <code className="text-emerald-300 font-mono">hub.verify_token</code> and returns <code className="text-emerald-300 font-mono">hub.challenge</code></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>POST /webhook always returns 200 OK so Meta doesn't retry delivery infinitely</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bot Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Customize Bot Business Info</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Business Name (BUSINESS_NAME)</label>
                <input
                  type="text"
                  value={config.businessName}
                  onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Location Address (BUSINESS_LOCATION)</label>
                <input
                  type="text"
                  value={config.businessLocation}
                  onChange={(e) => setConfig({ ...config, businessLocation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Google Maps Link (GOOGLE_MAPS_LINK)</label>
                <input
                  type="text"
                  value={config.googleMapsLink}
                  onChange={(e) => setConfig({ ...config, googleMapsLink: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Team Contact Number (TEAM_CONTACT_NUMBER)</label>
                <input
                  type="text"
                  value={config.teamContactNumber}
                  onChange={(e) => setConfig({ ...config, teamContactNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all"
              >
                Save & Apply to Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
