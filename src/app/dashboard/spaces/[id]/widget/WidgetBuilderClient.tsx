'use client';

import { useState, useEffect } from 'react';

type WidgetConfig = {
  id: string;
  spaceId: string;
  layout: string;
  themeMode: string;
  backgroundColor: string | null;
  animation: string;
};

export default function WidgetBuilderClient({ spaceId, initialConfig }: { spaceId: string, initialConfig: WidgetConfig }) {
  const [config, setConfig] = useState<WidgetConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedCode = `<script type="text/javascript" src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"></script>\n<div id="trustflow-widget" data-space="${spaceId}"></div>`;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/widget`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Editor Panel */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6 flex flex-col h-fit">
        <h2 className="text-lg font-bold">Widget Settings</h2>

        <div>
          <label className="block text-sm font-bold mb-2">Layout</label>
          <select 
            value={config.layout} 
            onChange={(e) => setConfig({ ...config, layout: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border shadow-sm dark:bg-black dark:border-gray-700"
          >
            <option value="masonry">Masonry</option>
            <option value="carousel">Carousel (Slider)</option>
            <option value="grid">Grid (Fixed rows)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Theme Mode</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setConfig({ ...config, themeMode: 'light' })}
              className={`flex-1 py-2 border rounded-xl font-medium ${config.themeMode === 'light' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
            >
              Light
            </button>
            <button 
              onClick={() => setConfig({ ...config, themeMode: 'dark' })}
              className={`flex-1 py-2 border rounded-xl font-medium ${config.themeMode === 'dark' ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
            >
              Dark
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Background Color (Optional)</label>
          <div className="flex gap-2 items-center">
            <input 
              type="color"
              value={config.backgroundColor || '#ffffff'}
              onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0"
            />
            <button 
              onClick={() => setConfig({ ...config, backgroundColor: null })}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
        {saveSuccess && <p className="text-green-600 text-sm text-center">Settings saved!</p>}

        <hr className="border-gray-100 dark:border-gray-800" />

        <div>
          <h2 className="text-lg font-bold mb-2">Embed Code</h2>
          <p className="text-xs text-gray-500 mb-3">Copy and paste this code into your website's HTML where you want the Wall of Love to appear.</p>
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto">
              {embedCode}
            </pre>
            <button 
              onClick={copyEmbedCode}
              className="absolute top-2 right-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-medium backdrop-blur-sm transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h2 className="text-lg font-bold">Live Preview</h2>
        <div className="flex-1 bg-gray-100 dark:bg-gray-950 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden relative min-h-[600px]">
          {/* We append a timestamp to the iframe src to force reload it when config changes (but we only want to reload after save, so maybe just use the config id or let the user click refresh) */}
          <iframe 
            src={`/w/${spaceId}`}
            className="absolute inset-0 w-full h-full border-none"
            title="Widget Preview"
          />
        </div>
        <p className="text-sm text-gray-500 text-center">
          Note: You must click "Save Configuration" to update the live preview.
        </p>
      </div>
    </div>
  );
}
