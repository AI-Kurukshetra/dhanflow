'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiquidButton } from '@/components/ui/LiquidButton';

const responses = [
  'Consider shifting 2% from cash to large-cap ETF baskets in tranches over 2 weeks.',
  'Risk overlay indicates duration risk is rising; rebalance 3% into short-duration debt.',
  'Increase international diversification by adding a global quality ETF allocation.',
];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState([{ role: 'ai', text: 'I can suggest rebalancing ideas for your top portfolios.' }]);
  const [input, setInput] = useState('');

  function sendMessage() {
    if (!input.trim()) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: input },
      { role: 'ai', text: responses[Math.floor(Math.random() * responses.length)] },
    ]);
    setInput('');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">AI Advisor Chat</h2>
        <div className="scrollbar-thin h-[360px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          {messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                item.role === 'user' ? 'ml-auto bg-cyan-500/30 text-slate-50' : 'bg-white/10 text-slate-200'
              }`}
            >
              {item.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask for portfolio suggestion"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-slate-400"
          />
          <LiquidButton onClick={sendMessage}>Send</LiquidButton>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard>
          <h3 className="mb-2 text-lg font-semibold">Portfolio Suggestions</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Raise debt quality mix for conservative clients.</li>
            <li>Rotate 1.5% into banking leaders on dip opportunities.</li>
            <li>Set stop-loss alert bands on high-beta holdings.</li>
          </ul>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-2 text-lg font-semibold">Market Risk Insights</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Volatility index is elevated relative to 3M average.</li>
            <li>Rates sensitivity increasing in long-duration debt funds.</li>
            <li>Commodity-linked equities show positive trend continuation.</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
