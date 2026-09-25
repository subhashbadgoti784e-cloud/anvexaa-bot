import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  ExternalLink,
  Lock,
  ArrowRight,
  Server,
  Zap,
  Radio,
  FileCheck2
} from 'lucide-react';
import { BotConfig } from '../types';
import { AnvexaaLogoGlyph } from './AnvexaaLogo';

interface WebhookTesterProps {
  config: BotConfig;
}

export const WebhookTester: React.FC<WebhookTesterProps> = ({ config }) => {
  const defaultVerifyToken = config.verifyToken || 'anvexaa_secret_123';
  const renderWebhookUrl = 'https://anvexaa-bot.onrender.com/webhook';

  const [hubMode, setHubMode] = useState<string>('subscribe');
  const [hubChallenge, setHubChallenge] = useState<string>('1158201444');
  const [enteredVerifyToken, setEnteredVerifyToken] = useState<string>(defaultVerifyToken);
  
  const [verificationResult, setVerificationResult] = useState<{
    status: number;
    body: string;
    isSuccess: boolean;
    timestamp: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleTestVerification = () => {
    const isSuccess = hubMode === 'subscribe' && enteredVerifyToken === defaultVerifyToken;
    const result = {
      status: isSuccess ? 200 : 403,
      body: isSuccess ? hubChallenge : 'Verification failed (hub.verify_token mismatch)',
      isSuccess,
      timestamp: new Date().toLocaleTimeString()
    };
    setVerificationResult(result);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlGetCommand = `curl -X GET "${renderWebhookUrl}?hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token=${defaultVerifyToken}"`;

  const curlPostCommand = `curl -X POST "${renderWebhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "919876543210",
            "type": "text",
            "text": { "body": "Namaste" }
          }]
        }
      }]
    }]
  }'`;

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 shrink-0">
            <AnvexaaLogoGlyph size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">FastAPI Meta Webhook Handshake & Configuration</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                GET /webhook & POST /webhook
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Jab aap Meta Developer Portal me <strong>"Verify and save"</strong> par click karte hain, Meta <code className="text-cyan-400">hub.challenge</code> bhejta hai. Verify hote hi aapka bot 24/7 real WhatsApp par live reply karega!
            </p>
          </div>
        </div>

        <a
          href="https://developers.facebook.com/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition-all shrink-0"
        >
          <span>Open Meta Developers Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 1-Click Copy Settings for Meta Dashboard */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
          <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
          <span>Meta Portal Par Copy-Paste Karne Ke Liye Ready Values:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Callback URL */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">1. Callback URL</span>
              <p className="font-mono text-xs text-emerald-400 break-all select-all">{renderWebhookUrl}</p>
            </div>
            <button
              onClick={() => copyToClipboard(renderWebhookUrl, 'url')}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'url' ? 'URL Copied!' : 'Copy Callback URL'}</span>
            </button>
          </div>

          {/* Verify Token */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">2. Verify Token</span>
              <p className="font-mono text-xs text-cyan-400 font-bold select-all">{defaultVerifyToken}</p>
            </div>
            <button
              onClick={() => copyToClipboard(defaultVerifyToken, 'token')}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedKey === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'token' ? 'Token Copied!' : 'Copy Verify Token'}</span>
            </button>
          </div>

          {/* Subscribed Fields */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">3. Webhook Subscription Field</span>
              <p className="font-mono text-xs text-purple-400 font-bold">messages</p>
            </div>
            <button
              onClick={() => copyToClipboard('messages', 'field')}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedKey === 'field' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'field' ? 'Field Copied!' : 'Copy "messages" Field'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Handshake Simulator (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Simulate Meta GET /webhook Handshake</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">FastAPI / main.py</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1 font-mono">hub.mode</label>
              <input
                type="text"
                value={hubMode}
                onChange={(e) => setHubMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 font-mono">hub.challenge (Random number from Meta)</label>
              <input
                type="text"
                value={hubChallenge}
                onChange={(e) => setHubChallenge(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 font-mono">
                hub.verify_token (Meta should send this token)
              </label>
              <input
                type="text"
                value={enteredVerifyToken}
                onChange={(e) => setEnteredVerifyToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleTestVerification}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Meta Verification Handshake</span>
              </button>

              <button
                onClick={() => setEnteredVerifyToken('wrong_token_test')}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700"
                title="Test with wrong token"
              >
                Test Wrong Token
              </button>
            </div>
          </div>

          {/* Verification Result Display */}
          {verificationResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 mt-4 transition-all ${
                verificationResult.isSuccess
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/50 text-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  {verificationResult.isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span>
                    {verificationResult.isSuccess
                      ? 'Handshake Successful (HTTP 200 OK)'
                      : 'Handshake Rejected (HTTP 403 Forbidden)'}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {verificationResult.timestamp}
                </span>
              </div>

              <div className="text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                Response Body: <strong className="text-white">{verificationResult.body}</strong>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {verificationResult.isSuccess
                  ? '✅ Token match hua! Meta Developers portal me green checkmark aa jayega aur webhook activate ho jayega.'
                  : '❌ Token mismatch! Meta request reject kar dega. Check karein ki .env me VERIFY_TOKEN aur Meta dashboard me same string ho.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Copyable cURL commands & Meta Setup checklist (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* cURL GET */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Test Webhook GET via Terminal (cURL)</span>
              </span>
              <button
                onClick={() => copyToClipboard(curlGetCommand, 'get')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700"
              >
                {copiedKey === 'get' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'get' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
              {curlGetCommand}
            </pre>
          </div>

          {/* cURL POST */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Simulate Incoming WhatsApp Message POST (cURL)</span>
              </span>
              <button
                onClick={() => copyToClipboard(curlPostCommand, 'post')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700"
              >
                {copiedKey === 'post' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'post' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto max-h-36">
              {curlPostCommand}
            </pre>
          </div>

          {/* Step-by-Step Meta Webhook Setup */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>Meta Dashboard Par 3 Steps:</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300">
              <li>
                <strong>developers.facebook.com</strong> par jakar <strong>WhatsApp &gt; Configuration</strong> kholein.
              </li>
              <li>
                <strong>Webhook &gt; Edit</strong> dabayein: Callback URL mein <code className="text-emerald-400">https://anvexaa-bot.onrender.com/webhook</code> aur Verify Token mein <code className="text-cyan-400">anvexaa_secret_123</code> paste karke <strong>Verify and save</strong> karein.
              </li>
              <li>
                Neeche <strong>Webhook fields</strong> table mein jakar <strong>messages</strong> ke aage <strong>Subscribe</strong> click kar dein.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
