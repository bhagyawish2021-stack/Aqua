import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { chat } from '../services/aiService';
import { getPonds } from '../services/pondService';
import { getErrorMsg } from '../helpers/errorMsg';

const PROMPTS = [
  'What should I do if ammonia is high?',
  'How can I improve shrimp growth?',
  'Why is dissolved oxygen low at night?',
  'How can I prevent shrimp diseases?',
  'What are the signs of a healthy pond?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Hello! I am your AquaMitra aquaculture advisor. Ask me anything about shrimp farming, water quality, feed management, disease prevention, or pond health.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ponds, setPonds] = useState([]);
  const [selectedPond, setSelectedPond] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { getPonds().then(r => setPonds(r.data.data || [])).catch(() => {}); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  async function sendMessage(text) {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput(''); setError('');
    setMessages(m => [...m, { role:'user', content:q }]);
    setLoading(true);
    try {
      const payload = { question: q };
      if (selectedPond) payload.pond_id = selectedPond;
      const res = await chat(payload);
      const answer = res.data.data?.answer || 'No response received.';
      setMessages(m => [...m, { role:'assistant', content:answer }]);
    } catch (err) {
      setError(getErrorMsg(err));
      setMessages(m => m.slice(0,-1));
    } finally { setLoading(false); inputRef.current?.focus(); }
  }

  function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

  return (
    <Layout title="AI Assistant">
      <div className="page-header">
        <div><h2>AquaMitra Assistant</h2><p>Expert aquaculture advice powered by AquaMitra knowledge base</p></div>
        {ponds.length > 0 && (
          <select value={selectedPond} onChange={e => setSelectedPond(e.target.value)} style={{ padding:'8px 12px', borderRadius:8, border:'1px solid var(--border)', fontSize:13 }}>
            <option value="">No pond context</option>
            {ponds.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      <div className="card" style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 200px)' }}>
        <div className="chat-messages">
          {messages.map((m,i) => (
            <div key={i} className={'chat-message ' + m.role}>
              <div className="chat-avatar" style={{ background: m.role==='assistant'?'var(--primary)':'#e2e8f0', color: m.role==='assistant'?'#fff':'var(--text)' }}>
                {m.role==='assistant' ? '🦐' : '👤'}
              </div>
              <div className="chat-bubble">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="chat-avatar" style={{ background:'var(--primary)', color:'#fff' }}>🦐</div>
              <div className="chat-bubble" style={{ color:'var(--text-secondary)' }}>Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ErrorMessage message={error} />

        <div className="prompt-chips">
          {PROMPTS.map((p,i) => <button key={i} className="prompt-chip" onClick={() => sendMessage(p)}>{p}</button>)}
        </div>

        <div className="chat-input-row">
          <textarea ref={inputRef} className="chat-input" rows={2} placeholder="Ask about water quality, feeding, disease, growth..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} disabled={loading} />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ alignSelf:'flex-end' }}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
