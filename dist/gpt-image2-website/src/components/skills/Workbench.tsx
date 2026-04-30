import { useState, useMemo, useEffect } from 'react';
import type { Route, PromptCase } from '../../types';
import { cases, ORDERED_CATEGORIES } from '../../lib/data';
import { renderPrompt, extractPlaceholders } from '../../lib/prompt-engine';
import './Workbench.css';

interface Props {
  navigate: (r: Route) => void;
  initialTemplateId?: string;
}

export function Workbench({ navigate, initialTemplateId }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId || '');
  const [args, setArgs] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [archiveStatus, setArchiveStatus] = useState<string | null>(null);

  // Get current template data
  const template = useMemo(() => {
    if (!selectedTemplateId) return null;
    return cases.templates[selectedTemplateId];
  }, [selectedTemplateId]);

  // Extract placeholders when template changes
  const placeholders = useMemo(() => {
    if (!template?.content) return [];
    return extractPlaceholders(template.content);
  }, [template]);

  // Initialize args with defaults from template content if possible
  useEffect(() => {
    if (!template?.content) return;
    
    const newArgs: Record<string, string> = {};
    const placeholderRegex = /\{([^}]+)\}/g;
    let match;
    while ((match = placeholderRegex.exec(template.content)) !== null) {
      const fullMatch = match[1];
      const parts = fullMatch.split(':');
      const key = parts[0].split('|')[0].trim();
      const defaultValue = parts[1] || '';
      
      if (key && !newArgs[key]) {
        newArgs[key] = defaultValue;
      }
    }
    setArgs(newArgs);
    setArchiveStatus(null);
    setCopyStatus(null);
  }, [template]);

  // Render the final prompt
  const renderResult = useMemo(() => {
    if (!template?.content) return null;
    try {
      return renderPrompt(template.content, args);
    } catch (err: any) {
      return { error: err.message };
    }
  }, [template, args]);

  const handleCopy = () => {
    if (renderResult && typeof renderResult === 'string') {
      navigator.clipboard.writeText(renderResult);
      setCopyStatus('已複製！');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleArchive = async () => {
    if (!template || !renderResult || typeof renderResult !== 'string') return;

    setArchiveStatus('正在封裝...');
    try {
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: template.category,
          template: template.name,
          filename: args['title'] || args['name'] || 'workbench_export',
          content: renderResult,
          args: args
        }),
      });

      const data = await response.json();
      if (data.success) {
        setArchiveStatus('✅ 已自動歸檔至資料路徑');
        setTimeout(() => setArchiveStatus(null), 3000);
      } else {
        setArchiveStatus(`❌ 錯誤: ${data.error}`);
      }
    } catch (err) {
      setArchiveStatus('❌ 無法連線至伺服器');
    }
  };

  const uiTemplates = useMemo(() => {
    return Object.values(cases.templates).filter(t => t.category === 'ui-mockups');
  }, []);

  const otherTemplates = useMemo(() => {
    return Object.values(cases.templates).filter(t => t.category !== 'ui-mockups');
  }, []);

  return (
    <div className="wb">
      <div className="wb-sidebar">
        <div className="wb-sidebar-header">
          <button className="sp-back" onClick={() => navigate({ name: 'home' })}>
            ← 返回主頁
          </button>
          <h2 className="serif">提示詞工作台</h2>
          <p className="wb-sidebar-sub">定製化您的完美提示詞</p>
        </div>

        <div className="wb-nav">
          <div className="wb-nav-section">
            <h4 className="mono">UI/UX 介面設計</h4>
            {uiTemplates.map(t => (
              <button 
                key={t.key} 
                className={`wb-nav-item ${selectedTemplateId === t.key ? 'active' : ''}`}
                onClick={() => setSelectedTemplateId(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="wb-nav-section">
            <h4 className="mono">其他知識模板</h4>
            <select 
              className="wb-select"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              <option value="">選擇模板...</option>
              {otherTemplates.map(t => (
                <option key={t.key} value={t.key}>{t.label} ({t.category})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <main className="wb-main">
        {template ? (
          <div className="wb-content">
            <div className="wb-header">
              <div className="wb-header-main">
                <span className="wb-category-tag" style={{ '--acc': '#1F6FB2' } as any}>
                  {template.category}
                </span>
                <h1 className="serif">{template.label}</h1>
                {template.description && <p className="wb-desc">{template.description}</p>}
              </div>
              <div className="wb-actions">
                <button className="wb-btn wb-btn-copy" onClick={handleCopy}>
                  {copyStatus || '複製提示詞'}
                </button>
                <button className="wb-btn wb-btn-primary" onClick={handleArchive}>
                  {archiveStatus || '自動歸檔'}
                </button>
              </div>
            </div>

            <div className="wb-grid">
              <section className="wb-params">
                <h3 className="mono">參數設定 PARAMS</h3>
                <div className="wb-form">
                  {placeholders.map(p => (
                    <div key={p} className="wb-field">
                      <label className="mono">{p.toUpperCase()}</label>
                      {p.includes('message') || p.includes('msg') || p.includes('description') || p.includes('content') ? (
                        <textarea 
                          value={args[p] || ''}
                          onChange={(e) => setArgs({ ...args, [p]: e.target.value })}
                          placeholder={`輸入 ${p}...`}
                        />
                      ) : (
                        <input 
                          type="text"
                          value={args[p] || ''}
                          onChange={(e) => setArgs({ ...args, [p]: e.target.value })}
                          placeholder={`輸入 ${p}...`}
                        />
                      )}
                    </div>
                  ))}
                  {placeholders.length === 0 && <p className="wb-empty">此模板無自定義參數</p>}
                </div>
              </section>

              <section className="wb-preview">
                <h3 className="mono">渲染預覽 PREVIEW</h3>
                <div className="wb-preview-box">
                  {renderResult && typeof renderResult === 'string' ? (
                    <pre className="wb-code">{renderResult}</pre>
                  ) : (
                    <div className="wb-error">
                      {typeof renderResult === 'object' && renderResult !== null ? (renderResult as any).error : '等待輸入...'}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="wb-empty-state">
            <div className="wb-empty-icon">🛠️</div>
            <h2 className="serif">選擇一個模板開始定製</h2>
            <p>從左側側邊欄選擇 UI/UX 或其他分類的專業提示詞模板。</p>
          </div>
        )}
      </main>
    </div>
  );
}
