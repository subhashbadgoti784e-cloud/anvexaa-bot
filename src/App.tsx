import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QRWhatsAppConnector } from './components/QRWhatsAppConnector';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { BulkSender } from './components/BulkSender';
import { CodeHub } from './components/CodeHub';
import { WebhookTester } from './components/WebhookTester';
import { SetupGuide } from './components/SetupGuide';
import { MobileLoginModal, UserSession } from './components/MobileLoginModal';
import { AndroidRunnerModal } from './components/AndroidRunnerModal';
import { GitHubUploadModal } from './components/GitHubUploadModal';
import { BotConfig } from './types';
import { downloadProjectZip } from './utils/zipDownloader';
import { MessageSquare, FolderArchive, Smartphone, ShieldCheck, Sparkles, Github } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'qr' | 'simulator' | 'bulk' | 'code' | 'webhook' | 'guide'>('qr');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);

  const [config, setConfig] = useState<BotConfig>({
    businessName: 'Anvexaa AI',
    businessLocation: 'Anvexaa AI Tech Hub',
    googleMapsLink: 'https://anvexaa.ai',
    teamContactNumber: '+91 8854910735',
    whatsappToken: 'EAAeWv9B2r5YBShJwr4qCOcvdQUqNaDebMCPZCpia2WPKkGe1ZCHmGJOuvAUU67NU7FxCrLIoBafHeZCkCddfGlskyVSn9MqAtAvG0RdirfwSaWJLSWfAF5KOlwh5ofqzJSIxJFLOQh3qZCwLONTsgKtZCN0cQfZCgdImRd697NznZCco3kWTp3aQUO2hemGIKZC4PHpv7rC8iy76AtKuK22THZBOUETHuKCXXR8p9ziZAOyDqi7gFEZAnPhEdM34hIwPaTH5NkbqtdOe4LD1qE8pMSg6bUPuQZDZD',
    phoneNumberId: '1312511691952064',
    verifyToken: 'my_secure_whatsapp_verify_token_123',
    defaultTemplateName: 'anvexaa_pitch',
    defaultLanguage: 'en',
    senderName: 'Subhash',
    businessType: 'business'
  });

  // Load persisted session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('anvexaa_user_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSession(parsed);
        if (parsed.name) {
          setConfig((prev) => ({
            ...prev,
            senderName: parsed.name,
            teamContactNumber: parsed.mobileNumber || prev.teamContactNumber
          }));
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        session={session}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAndroidGuide={() => setIsAndroidModalOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'qr' && (
          <QRWhatsAppConnector config={config} setConfig={setConfig} />
        )}

        {activeTab === 'simulator' && (
          <WhatsAppSimulator config={config} setConfig={setConfig} />
        )}

        {activeTab === 'bulk' && (
          <BulkSender config={config} />
        )}

        {activeTab === 'code' && (
          <CodeHub />
        )}

        {activeTab === 'webhook' && (
          <WebhookTester config={config} />
        )}

        {activeTab === 'guide' && (
          <SetupGuide config={config} />
        )}
      </main>

      {/* Mobile Login Modal */}
      <MobileLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        session={session}
        setSession={setSession}
      />

      {/* Android APK & Termux Runner Modal */}
      <AndroidRunnerModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* GitHub Upload Modal */}
      <GitHubUploadModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p>
              <strong className="text-slate-200">Anvexaa AI WhatsApp Bot</strong> — Android PWA & Termux Ready (Cloud API v21.0)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <Github className="w-3.5 h-3.5 fill-current" />
              <span>GitHub</span>
            </button>
            <button
              onClick={() => setIsAndroidModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android App</span>
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              {session ? `Logged in: ${session.name}` : 'Mobile Login'}
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-emerald-300 transition-colors"
            >
              Setup Guide
            </button>
            <button
              onClick={downloadProjectZip}
              className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
