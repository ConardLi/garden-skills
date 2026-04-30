import { useState } from 'react';
import './AutomationPanel.css';

export function AutomationPanel() {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('product-visuals');
  const [template] = useState('product-hero');
  const [idx, setIdx] = useState('105');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('🚀 傳送自動化請求至終端...');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category, template, idx, adapter: 'playwright' }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setStatus('✅ 生成成功！圖片已儲存並註冊。正在重新整理資料...');
        // 觸發重新整理（可選）
      } else {
        setStatus(`❌ 失敗: ${data.error}`);
      }
    } catch (err) {
      setStatus(`❌ 無法連線至自動化伺服器 (Port 3001)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="automation-panel">
      <div className="automation-header">
        <h3 className="serif">ChatGPT 網頁端自動化生成</h3>
        <span className="mono status-badge">LIVE CDP @ 9000</span>
      </div>
      
      <div className="automation-fields">
        <div className="field">
          <label className="mono">提示詞 PROMPT</label>
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="輸入圖片描述..."
          />
        </div>
        
        <div className="field-group">
          <div className="field">
            <label className="mono">分類 CATEGORY</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="field">
            <label className="mono">索引 INDEX</label>
            <input value={idx} onChange={(e) => setIdx(e.target.value)} />
          </div>
        </div>
      </div>

      <button 
        className={`btn btn-primary ${loading ? 'loading' : ''}`}
        onClick={handleGenerate}
        disabled={loading}
      >
        <span>{loading ? '自動化執行中...' : '啟動網頁端生成'}</span>
      </button>

      {status && <div className="automation-status mono">{status}</div>}
    </div>
  );
}
