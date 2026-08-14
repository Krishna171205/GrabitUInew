'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MS } from '@/components/gb/kit';

interface NodeData {
  id: string;
  label: string;
  category: 'top' | 'mid-left' | 'left-grid' | 'mid-right' | 'right-card' | 'bottom' | 'sub-bottom';
  description: string;
  metric: string;
  subText?: string;
  icon?: string;
  badges?: string[];
}

export default function EcosystemArchitecture() {
  const [activeNode, setActiveNode] = useState<string>('core');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes: Record<string, NodeData> = {
    core: {
      id: 'core',
      label: 'Grabbit Platform',
      category: 'top',
      description: 'Central real-time orchestration engine linking mobile orders, POS systems, kitchen displays, and instant payments.',
      metric: '99.99% Uptime • 12ms Latency',
      subText: '14,250 live orders processed / hr'
    },
    pos: {
      id: 'pos',
      label: 'Café POS Sync',
      category: 'top',
      description: 'Bi-directional real-time inventory and menu synchronization with Petpooja, Square, Toast & Lightspeed.',
      metric: '< 100ms Sync',
      icon: 'sync'
    },
    preorder: {
      id: 'preorder',
      label: 'Pre-Orders Engine',
      category: 'top',
      description: 'Intelligent arrival-time prediction algorithm scheduling kitchen prep for zero customer wait time.',
      metric: 'Zero Wait Algorithm',
      icon: 'schedule'
    },
    legacy: {
      id: 'legacy',
      label: 'Legacy Billing',
      category: 'top',
      description: 'Bridge existing enterprise ERP and legacy billing hardware without altering barista workflows.',
      metric: 'Plug & Play Integration',
      icon: 'receipt_long'
    },
    booking: {
      id: 'booking',
      label: 'Smart Pickup Lockers',
      category: 'top',
      description: 'Automated IoT temperature-controlled pickup locker unlocking via BLE or QR scan.',
      metric: 'IoT Hardware API',
      icon: 'lock_open'
    },
    sdk: {
      id: 'sdk',
      label: 'Grabbit SDK',
      category: 'mid-left',
      description: 'Embed pre-ordering & zero-queue checkout directly into custom iOS & Android brand apps.',
      metric: 'iOS / Android Native',
      icon: 'code'
    },
    events: {
      id: 'events',
      label: 'Event Destinations',
      category: 'mid-right',
      description: 'Real-time Webhooks, WhatsApp Order Status alerts, and automated SMS notifications.',
      metric: 'Sub-second Webhooks',
      icon: 'notifications_active'
    },
    marketplace: {
      id: 'marketplace',
      label: 'Brand Marketplace ↗',
      category: 'left-grid',
      description: 'Multi-location coffee brand network supporting Blue Tokai, Third Wave, Starbucks & artisan roasters.',
      metric: '120+ Partner Outlets',
      badges: ['Blue Tokai', 'Third Wave', 'Subko', 'Roastery']
    },
    pipeline: {
      id: 'pipeline',
      label: 'Real-Time Data Pipeline',
      category: 'right-card',
      description: 'Live order analytics, peak hour heatmaps, customer lifetime value, and item velocity reports.',
      metric: 'Stream Processing',
      icon: 'insights'
    },
    orchestration: {
      id: 'orchestration',
      label: 'Barista Kitchen Orchestration',
      category: 'bottom',
      description: 'Smart ticket queueing prioritizing hot beverage extraction timers with customer ETA.',
      metric: 'Dynamic Queue Balancing',
      icon: 'coffee_maker'
    },
    psp1: {
      id: 'psp1',
      label: 'UPI / Direct Payments',
      category: 'sub-bottom',
      description: 'Instant 1-click UPI, Apple Pay & credit card settlement directly to café bank accounts.',
      metric: 'T+0 Settlement',
      icon: 'account_balance_wallet'
    },
    psp2: {
      id: 'psp2',
      label: 'Kitchen KDS',
      category: 'sub-bottom',
      description: 'Barista kitchen display screen with tactile audio alerts & order prep count-downs.',
      metric: 'Tactile Touch Screen',
      icon: 'desktop_windows'
    }
  };

  const currentDisplay = nodes[hoveredNode || activeNode] || nodes.core;

  return (
    <section className="relative w-full bg-[#080B1A] text-white py-20 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden border-t border-white/10">
      
      {/* Background Dot Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Atmospheric Radial Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#6366F1]/20 via-[#4F46E5]/15 to-[#F09819]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-full px-3.5 py-1 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-[#F09819] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#A5B4FC]">
              Ecosystem Architecture
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4"
          >
            Infrastructure Built to Power <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A5B4FC] via-white to-[#F09819]">
              Modern Food-Tech Operations
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#94A3B8] leading-relaxed"
          >
            Grabbit seamlessly connects your POS, loyalty programs, kitchen display systems, and payment rails into one unified real-time engine.
          </motion.p>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE ARCHITECTURE NODE DIAGRAM CONTAINER */}
        {/* ========================================================= */}
        <div className="relative w-full max-w-5xl mx-auto bg-[#0F142E]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* SVG CONNECTOR LINES SYSTEM */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block opacity-60">
            {/* Top row connectors */}
            <line x1="200" y1="90" x2="512" y2="230" stroke={hoveredNode === 'pos' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" className="transition-colors duration-300" />
            <line x1="390" y1="90" x2="512" y2="230" stroke={hoveredNode === 'preorder' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" className="transition-colors duration-300" />
            <line x1="630" y1="90" x2="512" y2="230" stroke={hoveredNode === 'legacy' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" className="transition-colors duration-300" />
            <line x1="820" y1="90" x2="512" y2="230" stroke={hoveredNode === 'booking' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" className="transition-colors duration-300" />

            {/* Mid Left & Right */}
            <line x1="390" y1="180" x2="512" y2="230" stroke={hoveredNode === 'sdk' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" className="transition-colors duration-300" />
            <line x1="670" y1="180" x2="512" y2="230" stroke={hoveredNode === 'events' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" className="transition-colors duration-300" />

            {/* Marketplace & Pipeline */}
            <line x1="270" y1="260" x2="512" y2="260" stroke={hoveredNode === 'marketplace' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" className="transition-colors duration-300" />
            <line x1="750" y1="260" x2="512" y2="260" stroke={hoveredNode === 'pipeline' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" className="transition-colors duration-300" />

            {/* Bottom Orchestration */}
            <line x1="512" y1="290" x2="512" y2="350" stroke={hoveredNode === 'orchestration' ? '#F09819' : '#6366F1'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="512" y1="390" x2="440" y2="440" stroke={hoveredNode === 'psp1' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="512" y1="390" x2="584" y2="440" stroke={hoveredNode === 'psp2' ? '#F09819' : '#6366F1'} strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>

          <div className="relative z-10 flex flex-col items-center gap-8">
            
            {/* ROW 1: TOP INTEGRATIONS */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { id: 'pos', label: 'POS Sync', sub: 'Petpooja / Square' },
                { id: 'preorder', label: 'Pre-Orders', sub: 'Zero-Wait Prep' },
                { id: 'legacy', label: 'Legacy Billing', sub: 'ERP Connect' },
                { id: 'booking', label: 'Smart Lockers', sub: 'IoT BLE Release' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNode(item.id)}
                  onMouseEnter={() => setHoveredNode(item.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                    hoveredNode === item.id || activeNode === item.id
                      ? 'bg-[#4F46E5] border-[#F09819] text-white shadow-lg shadow-[#4F46E5]/40 scale-105'
                      : 'bg-[#181E3D]/80 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  <div className="text-xs font-bold tracking-wide">{item.label}</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>

            {/* ROW 2: MID ACCELERATORS */}
            <div className="w-full flex justify-between items-center px-4 sm:px-12">
              <button
                onClick={() => setActiveNode('sdk')}
                onMouseEnter={() => setHoveredNode('sdk')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`px-5 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                  hoveredNode === 'sdk' || activeNode === 'sdk'
                    ? 'bg-[#6366F1] border-[#F09819] text-white shadow-md'
                    : 'bg-[#1E2548] border-white/10 text-gray-300 hover:border-white/30'
                }`}
              >
                Grabbit SDK
              </button>

              <button
                onClick={() => setActiveNode('events')}
                onMouseEnter={() => setHoveredNode('events')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`px-5 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                  hoveredNode === 'events' || activeNode === 'events'
                    ? 'bg-[#6366F1] border-[#F09819] text-white shadow-md'
                    : 'bg-[#1E2548] border-white/10 text-gray-300 hover:border-white/30'
                }`}
              >
                Event Destinations
              </button>
            </div>

            {/* ROW 3: CENTERPIECE CORE + SIDEBAR PANELS */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* Left Brand Marketplace Card */}
              <button
                onClick={() => setActiveNode('marketplace')}
                onMouseEnter={() => setHoveredNode('marketplace')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`w-full lg:w-64 p-4 rounded-2xl border text-left transition-all ${
                  hoveredNode === 'marketplace' || activeNode === 'marketplace'
                    ? 'bg-[#1E2548] border-[#F09819] shadow-lg scale-102'
                    : 'bg-[#131936]/90 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">App Marketplace ↗</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {['Blue Tokai', 'Third Wave', 'Subko', 'Roastery'].map((brand, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-gray-300 text-center truncate">
                      {brand}
                    </div>
                  ))}
                </div>
              </button>

              {/* CENTRAL CORE PLATFORM HUB */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveNode('core')}
                onMouseEnter={() => setHoveredNode('core')}
                onMouseLeave={() => setHoveredNode(null)}
                className="w-full lg:w-72 bg-gradient-to-b from-[#4F46E5] to-[#312E81] border-2 border-[#F09819] rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(79,70,229,0.5)] cursor-pointer relative group"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F09819] text-[#1A1311] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Core Engine
                </div>
                <div className="my-2 flex justify-center">
                  <img src="/transparent-image.svg" alt="Grabbit" className="h-9 w-auto brightness-200 contrast-125 drop-shadow-md" />
                </div>
                <div className="text-[11px] font-mono text-indigo-200 mt-1">Real-time Order Gateway</div>
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-center gap-2 text-[10px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync Active
                </div>
              </motion.div>

              {/* Right Data Pipeline Card */}
              <button
                onClick={() => setActiveNode('pipeline')}
                onMouseEnter={() => setHoveredNode('pipeline')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`w-full lg:w-64 p-4 rounded-2xl border text-left transition-all ${
                  hoveredNode === 'pipeline' || activeNode === 'pipeline'
                    ? 'bg-[#1E2548] border-[#F09819] shadow-lg scale-102'
                    : 'bg-[#131936]/90 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Data Pipeline</span>
                  <MS name="insights" size={16} className="text-[#F09819]" />
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  Real-time analytics, peak hour throughput & automated restocking triggers.
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#A5B4FC]">Streamed via Kafka</div>
              </button>

            </div>

            {/* ROW 4: BOTTOM KITCHEN ORCHESTRATION & PSPS */}
            <div className="w-full flex flex-col items-center gap-3">
              <button
                onClick={() => setActiveNode('orchestration')}
                onMouseEnter={() => setHoveredNode('orchestration')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`px-8 py-3 rounded-xl border font-bold text-xs transition-all ${
                  hoveredNode === 'orchestration' || activeNode === 'orchestration'
                    ? 'bg-[#4F46E5] border-[#F09819] text-white shadow-lg scale-105'
                    : 'bg-[#181E3D] border-white/10 text-gray-300 hover:border-white/30'
                }`}
              >
                Kitchen Barista Orchestration
              </button>

              <div className="flex gap-4">
                <button
                  onClick={() => setActiveNode('psp1')}
                  onMouseEnter={() => setHoveredNode('psp1')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`px-4 py-2 rounded-lg border text-[11px] font-mono transition-all ${
                    hoveredNode === 'psp1' || activeNode === 'psp1'
                      ? 'bg-[#312E81] border-[#F09819] text-white'
                      : 'bg-[#131936] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  UPI Direct Pay
                </button>
                <button
                  onClick={() => setActiveNode('psp2')}
                  onMouseEnter={() => setHoveredNode('psp2')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`px-4 py-2 rounded-lg border text-[11px] font-mono transition-all ${
                    hoveredNode === 'psp2' || activeNode === 'psp2'
                      ? 'bg-[#312E81] border-[#F09819] text-white'
                      : 'bg-[#131936] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  Barista KDS Display
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* INTERACTIVE INSPECTOR POPOVER CARD */}
          {/* ========================================================= */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F09819]/20 border border-[#F09819]/40 flex items-center justify-center text-[#F09819]">
                <MS name={currentDisplay.icon || 'hub'} size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {currentDisplay.label}
                  <span className="text-[10px] font-mono text-[#F09819] bg-[#F09819]/10 px-2 py-0.5 rounded border border-[#F09819]/20">
                    {currentDisplay.metric}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5 max-w-xl">
                  {currentDisplay.description}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[11px] font-mono text-gray-400">Status</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Fully Operational
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
