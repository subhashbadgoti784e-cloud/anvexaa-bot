import React from 'react';
import { MessageSquare, Send, Code, ShieldCheck, BookOpen, Download, Smartphone, User, CheckCircle2, Github, QrCode } from 'lucide-react';
import { downloadProjectZip } from '../utils/zipDownloader';
import { PWAInstallButton } from './PWAInstallButton';
import { UserSession } from './MobileLoginModal';
import { AnvexaaLogo } from './AnvexaaLogo';

interface NavbarProps {
  activeTab: 'qr' | 'simulator' | 'bulk' | 'code' | 'webhook' | 'guide';
  setActiveTab: (tab: 'qr' | 'simulator' | 'bulk' | 'code' | 'webhook' | 'guide') => void;
  session: UserSession | null;
  onOpenLogin: () => void;
  onOpenAndroidGuide: () => void;
  onOpenGitHubModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  session,
  onOpenLogin,
  onOpenAndroidGuide,
  onOpenGitHubModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Anvexaa AI Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveTab('simulator')}>
            <AnvexaaLogo size="md" showSubtitle={true} />
            <span className="hidden xl:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Cloud API v21.0
            </span>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'qr'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-emerald-400 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Connect</span>
              <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">Free</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Auto-Reply Bot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'bulk'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Bulk Sender</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Deliverables & Code</span>
            </button>

            <button
              onClick={() => setActiveTab('webhook')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'webhook'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Webhook Tester</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Setup Guide</span>
            </button>
          </nav>

          {/* Quick Actions: Android App + Mobile Login + Download ZIP */}
          <div className="flex items-center gap-2">
            {/* PWA / Android Install Button */}
            <PWAInstallButton onOpenAndroidGuide={onOpenAndroidGuide} />

            {/* Mobile Login Button / Session Pill */}
            {session ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/25 transition-all"
                title="Manage Mobile Session"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px]">{session.mobileNumber}</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                title="Mobile Number Login"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Mobile Login</span>
              </button>
            )}

            {/* GitHub Upload Button */}
            <button
              onClick={onOpenGitHubModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:border-slate-500"
              title="Upload project data to GitHub"
            >
              <Github className="w-3.5 h-3.5 fill-current text-white" />
              <span className="hidden sm:inline">GitHub</span>
            </button>

            {/* Download Zip */}
            <button
              onClick={downloadProjectZip}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              title="Download all files in a zip"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ZIP</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="md:hidden flex items-center justify-between pb-3 pt-1 border-t border-slate-800/80 gap-1 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap flex items-center gap-1 font-semibold ${
              activeTab === 'qr' ? 'bg-emerald-500 text-white' : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <QrCode className="w-3 h-3" />
            <span>QR Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'simulator' ? 'bg-emerald-500 text-white font-medium' : 'text-slate-400'
            }`}
          >
            AI Auto-Reply Bot
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'bulk' ? 'bg-emerald-500 text-white font-medium' : 'text-slate-400'
            }`}
          >
            Bulk Sender
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'code' ? 'bg-emerald-500 text-white font-medium' : 'text-slate-400'
            }`}
          >
            Code Files
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'webhook' ? 'bg-emerald-500 text-white font-medium' : 'text-slate-400'
            }`}
          >
            Webhook
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'guide' ? 'bg-emerald-500 text-white font-medium' : 'text-slate-400'
            }`}
          >
            Guide
          </button>
          <button
            onClick={onOpenGitHubModal}
            className="px-2.5 py-1 rounded-md whitespace-nowrap text-slate-200 bg-slate-800 border border-slate-700 flex items-center gap-1"
          >
            <Github className="w-3 h-3 fill-current" />
            <span>GitHub</span>
          </button>
          <button
            onClick={onOpenAndroidGuide}
            className="px-2.5 py-1 rounded-md whitespace-nowrap text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
          >
            📱 Android
          </button>
        </div>
      </div>
    </header>
  );
};
