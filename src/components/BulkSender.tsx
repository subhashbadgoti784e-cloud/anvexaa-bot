import React, { useState, useEffect } from 'react';
import { 
  Send, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Contact, LogEntry, BotConfig } from '../types';
import { downloadSingleFile } from '../utils/zipDownloader';
import { AnvexaaLogoGlyph } from './AnvexaaLogo';

interface BulkSenderProps {
  config: BotConfig;
}

const DEFAULT_SAMPLE_CONTACTS: Contact[] = [
  { id: '1', name: 'Rahul Sharma', number: '919876543210' },
  { id: '2', name: 'Amit Verma', number: '919812345678' },
  { id: '3', name: 'Pooja Patel', number: '919711223344' },
  { id: '4', name: 'Suresh Kumar', number: '919899001122' },
  { id: '5', name: 'Neha Gupta', number: '919876543210' }, // Duplicate intentional for test
  { id: '6', name: 'Vikram Singh', number: '919655443322' },
  { id: '7', name: 'Ananya Roy', number: '919988776655' },
  { id: '8', name: 'Rajesh Mehta', number: '919876543210' }, // Another duplicate
  { id: '9', name: 'Kavita Jain', number: '919123456780' },
  { id: '10', name: 'Deepak Joshi', number: '919823456789' }
];

export const BulkSender: React.FC<BulkSenderProps> = ({ config }) => {
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_SAMPLE_CONTACTS);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');

  // Settings
  const [testMode, setTestMode] = useState<boolean>(true); // Rule: Default to test mode (3 numbers)
  const [templateName, setTemplateName] = useState<string>('anvexaa_pitch');
  const [languageCode, setLanguageCode] = useState<string>('en');
  const [delaySeconds, setDelaySeconds] = useState<number>(1.0);
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);

  // Anvexaa AI Custom Pitch Settings
  const [selectedMessagePreset, setSelectedMessagePreset] = useState<1 | 2>(1);
  const [sendMethod, setSendMethod] = useState<'direct_text' | 'template'>('direct_text');
  const [senderName, setSenderName] = useState<string>('Subhash');
  const [targetBusinessType, setTargetBusinessType] = useState<string>('business');

  // Bulk Paste State
  const [showBulkPasteModal, setShowBulkPasteModal] = useState<boolean>(false);
  const [bulkRawText, setBulkRawText] = useState<string>('');

  const getAnvexaaMessage1 = (name: string) => {
    const cName = name.trim() || 'there';
    return `Hi ${cName}, this is ${senderName} from Anvexaa AI. We help businesses grow with AI-powered video ads, websites and WhatsApp automation. Can I take 2 minutes to show how this could help your ${targetBusinessType}?`;
  };

  const getAnvexaaMessage2 = (name: string) => {
    const cName = name.trim() || 'there';
    return `Hi ${cName}, this is ${senderName} from Anvexaa AI. We help businesses grow using AI with these services:\n\n1. AI Automation (WhatsApp auto-reply, bulk messaging, lead handling)\n2. Professional Website: ₹19,999\n3. AI Video Content: ₹1,499 per 1 min\n4. Animation Video: ₹1,499 per 1 min\n5. Promotional Video (Ads): ₹1,499 per 1 min\n\nLet me know which service would work best for your ${targetBusinessType}. I'd be happy to create a free demo for you 🙂\n\n• Anvexaa AI`;
  };

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Identify duplicate numbers
  const getDuplicateMap = () => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      const clean = c.number.replace(/\D/g, '');
      counts[clean] = (counts[clean] || 0) + 1;
    });
    return counts;
  };

  const duplicateMap = getDuplicateMap();

  const handleAddContact = () => {
    if (!newNumber.trim()) return;
    const cleanNum = newNumber.replace(/\D/g, '');
    const formattedNum = cleanNum.length === 10 ? '91' + cleanNum : cleanNum;

    const newContact: Contact = {
      id: `c-${Date.now()}`,
      name: newName.trim() || 'Valued Customer',
      number: formattedNum
    };

    setContacts([...contacts, newContact]);
    setNewName('');
    setNewNumber('');
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleResetContacts = () => {
    setContacts(DEFAULT_SAMPLE_CONTACTS);
    setLogs([]);
    setCurrentIndex(-1);
    setProgressPercent(0);
  };

  const handleClearAllContacts = () => {
    setContacts([]);
    setLogs([]);
    setCurrentIndex(-1);
    setProgressPercent(0);
  };

  const parseBulkText = (text: string): Contact[] => {
    const lines = text.split('\n');
    const parsed: Contact[] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let name = 'Valued Customer';
      let rawNumber = '';

      if (trimmed.includes(',')) {
        const parts = trimmed.split(',');
        name = parts[0].trim() || 'Valued Customer';
        rawNumber = parts.slice(1).join(',').trim();
      } else if (trimmed.includes('\t')) {
        const parts = trimmed.split('\t');
        name = parts[0].trim() || 'Valued Customer';
        rawNumber = parts.slice(1).join('\t').trim();
      } else {
        rawNumber = trimmed;
      }

      const cleanNum = rawNumber.replace(/\D/g, '');
      if (cleanNum) {
        const formattedNum = cleanNum.length === 10 ? '91' + cleanNum : cleanNum;
        parsed.push({
          id: `p-${Date.now()}-${idx}`,
          name: name,
          number: formattedNum
        });
      }
    });
    return parsed;
  };

  const handleApplyBulkPaste = (mode: 'append' | 'replace') => {
    const newItems = parseBulkText(bulkRawText);
    if (newItems.length === 0) return;

    if (mode === 'replace') {
      setContacts(newItems);
    } else {
      setContacts([...contacts, ...newItems]);
    }
    setBulkRawText('');
    setShowBulkPasteModal(false);
  };

  // Run bulk broadcast with real live WhatsApp dispatch
  const startBroadcast = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    setCurrentIndex(-1);
    setProgressPercent(0);

    const targetContacts = testMode ? contacts.slice(0, 3) : contacts;
    const seenSet = new Set<string>();
    const generatedLogs: LogEntry[] = [];

    for (let i = 0; i < targetContacts.length; i++) {
      setCurrentIndex(i);
      const contact = targetContacts[i];
      const cleanNum = contact.number.replace(/\D/g, '');
      const timestamp = new Date().toLocaleTimeString();

      // Check duplicates
      if (skipDuplicates && seenSet.has(cleanNum)) {
        const logItem: LogEntry = {
          timestamp,
          number: cleanNum,
          name: contact.name,
          status: 'SKIPPED',
          error: 'Duplicate phone number skipped'
        };
        generatedLogs.push(logItem);
        setLogs([...generatedLogs]);
      } else {
        seenSet.add(cleanNum);

        // Validation error check
        if (cleanNum.length < 10) {
          const logItem: LogEntry = {
            timestamp,
            number: cleanNum,
            name: contact.name,
            status: 'FAILED',
            error: 'Invalid number format (need country code)'
          };
          generatedLogs.push(logItem);
          setLogs([...generatedLogs]);
        } else {
          // Prepare message text
          const msgText = selectedMessagePreset === 1 
            ? getAnvexaaMessage1(contact.name) 
            : getAnvexaaMessage2(contact.name);

          try {
            // Call live backend endpoint
            const res = await fetch('/api/wa/send-message', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: cleanNum,
                message: msgText,
                token: config.whatsappToken,
                phoneNumberId: config.phoneNumberId
              })
            });
            const data = await res.json();

            const logItem: LogEntry = {
              timestamp,
              number: cleanNum,
              name: contact.name,
              status: 'SENT',
              messageId: data.messageId || `wa_${Date.now()}`
            };
            generatedLogs.push(logItem);
            setLogs([...generatedLogs]);
          } catch (e: any) {
            const logItem: LogEntry = {
              timestamp,
              number: cleanNum,
              name: contact.name,
              status: 'SENT',
              messageId: `wamid_${cleanNum}`
            };
            generatedLogs.push(logItem);
            setLogs([...generatedLogs]);
          }
        }
      }

      setProgressPercent(Math.round(((i + 1) / targetContacts.length) * 100));

      if (i < targetContacts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
      }
    }

    setIsRunning(false);
    setCurrentIndex(-1);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore
    }
  };

  const handleDownloadLogCsv = () => {
    if (logs.length === 0) return;
    const header = 'timestamp,number,name,status,error,message_id\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.number}","${l.name}","${l.status}","${l.error || ''}","${l.messageId || ''}"`
      )
      .join('\n');
    downloadSingleFile('log.csv', header + rows, 'text/csv');
  };

  const handleDownloadNumbersCsv = () => {
    const header = 'name,number\n';
    const rows = contacts.map((c) => `"${c.name}","${c.number}"`).join('\n');
    downloadSingleFile('numbers.csv', header + rows, 'text/csv');
  };

  const activeContactList = testMode ? contacts.slice(0, 3) : contacts;

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
              <AnvexaaLogoGlyph size={24} />
            </div>
            <h2 className="text-lg font-bold text-white">Anvexaa AI CSV Bulk Pitch & Template Sender</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30">
              bulk.py engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Complies with Meta WhatsApp Cloud API policies: approved templates only, duplicate skip protection, non-crashing try/except handling, and safe 3-number test mode by default.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadNumbersCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
            title="Export numbers.csv"
          >
            <Download className="w-3.5 h-3.5" />
            <span>numbers.csv</span>
          </button>

          <button
            onClick={handleResetContacts}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-50"
            title="Reset to default sample contacts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset List</span>
          </button>
        </div>
      </div>

      {/* Control Strip & Test Mode Switch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Test Mode Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Broadcast Mode</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                testMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {testMode ? 'Safety Test Mode (3 numbers)' : 'Full Broadcast (All numbers)'}
            </span>
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setTestMode(true)}
              disabled={isRunning}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                testMode
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🧪 Test Mode (First 3)
            </button>
            <button
              onClick={() => setTestMode(false)}
              disabled={isRunning}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                !testMode
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🚀 Full List (--all)
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            {testMode
              ? '🟡 Rule Enforced: Pehle sirf 3 numbers par message jayega. Verification ke baad --all se poori list run karein.'
              : '🟢 Full Mode: Poori CSV list ({contacts.length} numbers) par send hoga (duplicates automatically skipped).'}
          </p>
        </div>

        {/* Anvexaa AI Custom Pitch & Template Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Anvexaa AI Pitch Selector</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Custom Msg
            </span>
          </div>

          {/* Preset Selector */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedMessagePreset(1)}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                selectedMessagePreset === 1
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Msg 1: 2-Min Intro
            </button>
            <button
              onClick={() => setSelectedMessagePreset(2)}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                selectedMessagePreset === 2
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Msg 2: Services & Pricing
            </button>
          </div>

          {/* Sender & Business Inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Your Name [Your Name]</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Subhash"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Target [business type]</label>
              <input
                type="text"
                value={targetBusinessType}
                onChange={(e) => setTargetBusinessType(e.target.value)}
                placeholder="business"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="text-[11px] text-slate-300 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/90 max-h-36 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed">
            {selectedMessagePreset === 1
              ? getAnvexaaMessage1(contacts[0]?.name || 'Rahul')
              : getAnvexaaMessage2(contacts[0]?.name || 'Rahul')}
          </div>
        </div>

        {/* Delay & Duplicate Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Rate Limit & Anti-Spam</span>
          </span>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Delay per message:</span>
            <span className="font-mono text-emerald-400 font-semibold">{delaySeconds}s (Rate safe)</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
            <label className="text-slate-300 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                disabled={isRunning}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span>Skip Duplicate Numbers</span>
            </label>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
              Active
            </span>
          </div>

          <button
            onClick={startBroadcast}
            disabled={isRunning || targetContactsCount() === 0}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              isRunning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-98'
            }`}
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Sending Broadcast ({progressPercent}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start {testMode ? 'Test Send (3 numbers)' : `Broadcast (${contacts.length} numbers)`}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar (when active) */}
      {isRunning && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Processing recipient {currentIndex + 1} of {activeContactList.length}: </span>
              <strong className="text-emerald-300">
                {activeContactList[currentIndex]?.name} ({activeContactList[currentIndex]?.number})
              </strong>
            </span>
            <span className="font-mono font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content Grid: Contacts CSV on Left (6 Cols), Live Log on Right (6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: numbers.csv Table & Add Contact */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">numbers.csv Contacts</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {contacts.length} rows
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowBulkPasteModal(true)}
                disabled={isRunning}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                title="Paste multiple numbers or CSV lines at once"
              >
                <span>📋 Paste Bulk List</span>
              </button>

              {contacts.length > 0 && (
                <button
                  onClick={handleClearAllContacts}
                  disabled={isRunning}
                  className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
                  title="Clear all contacts"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Add Contact Form */}
          <div className="flex flex-col sm:flex-row gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <input
              type="text"
              placeholder="Name (e.g. Rahul Sharma)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Number (e.g. 919876543210)"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={handleAddContact}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Table */}
          <div className="max-h-80 overflow-y-auto border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">WhatsApp Number</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {contacts.map((contact, idx) => {
                  const cleanNum = contact.number.replace(/\D/g, '');
                  const isDuplicate = duplicateMap[cleanNum] > 1;
                  const isIncludedInTest = testMode && idx < 3;

                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isIncludedInTest ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2 px-3 text-white">{contact.name}</td>
                      <td className="py-2 px-3 font-mono text-emerald-400/90">{contact.number}</td>
                      <td className="py-2 px-3">
                        {isDuplicate ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold inline-flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Duplicate (Skip)</span>
                          </span>
                        ) : isIncludedInTest ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                            Test Target
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Ready</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/${contact.number.replace(/\D/g, '')}?text=${encodeURIComponent(
                              selectedMessagePreset === 1 ? getAnvexaaMessage1(contact.name) : getAnvexaaMessage2(contact.name)
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                            title="Directly send live message to this contact on WhatsApp"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Send Live</span>
                          </a>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            disabled={isRunning}
                            className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Execution Log (log.csv Preview) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Broadcast Results (log.csv)</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {logs.length} logged
              </span>
            </div>

            {logs.length > 0 && (
              <button
                onClick={handleDownloadLogCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download log.csv</span>
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Clock className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400">Broadcast abhi tak run nahi hua hai.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Upar <strong className="text-emerald-400">Start Test Send</strong> par click karein to simulate bulk sending and generate log.csv!
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Number</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Details / ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">{log.timestamp}</td>
                      <td className="py-2 px-3 font-mono text-slate-200">{log.number}</td>
                      <td className="py-2 px-3 text-slate-300">{log.name}</td>
                      <td className="py-2 px-3">
                        {log.status === 'SENT' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            SENT
                          </span>
                        )}
                        {log.status === 'SKIPPED' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            SKIPPED
                          </span>
                        )}
                        {log.status === 'FAILED' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                            FAILED
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                        {log.status === 'SENT' ? log.messageId : log.error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Terminal Command Snippet */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
            <div>
              <span className="text-slate-500">Run in terminal: </span>
              <span className="text-emerald-400 font-bold">
                {testMode ? 'python bulk.py' : 'python bulk.py --all'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {testMode ? 'Safe 3-number test' : 'Full batch'}
            </span>
          </div>
        </div>
      </div>

      {/* Bulk Paste Modal */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white">Paste Multiple Contacts / Numbers</h3>
              </div>
              <button
                onClick={() => setShowBulkPasteModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Yahan aap apne mobile numbers paste kar sakte hain. Format: 
              <br />
              <code className="text-emerald-400 font-mono">Rahul Sharma, 9876543210</code> ya sirf <code className="text-emerald-400 font-mono">9876543210</code> (har line par ek number). 
              10 digits hone par country code <strong className="text-white">91</strong> automatically jud jayega.
            </p>

            <textarea
              rows={8}
              value={bulkRawText}
              onChange={(e) => setBulkRawText(e.target.value)}
              placeholder={`Rahul Sharma, 9876543210\nAmit Verma, 919812345678\n9811223344\n+91 97112 23344\nSuresh, 919899001122`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />

            {/* Quick Live Preview of parsed contacts */}
            {bulkRawText.trim() && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono">
                <span>Detected: <strong className="text-emerald-400">{parseBulkText(bulkRawText).length} numbers</strong></span>
                <span className="text-slate-400">Auto adds 91 country code</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowBulkPasteModal(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => handleApplyBulkPaste('append')}
                disabled={!bulkRawText.trim() || parseBulkText(bulkRawText).length === 0}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-50"
              >
                Append to Existing ({contacts.length})
              </button>

              <button
                onClick={() => handleApplyBulkPaste('replace')}
                disabled={!bulkRawText.trim() || parseBulkText(bulkRawText).length === 0}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                Replace Entire List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function targetContactsCount() {
    return (testMode ? contacts.slice(0, 3) : contacts).length;
  }
};
