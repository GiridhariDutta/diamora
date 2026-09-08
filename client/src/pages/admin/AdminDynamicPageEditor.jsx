import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  RefreshCw, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Quote, 
  Link as LinkIcon, 
  Code, 
  Eye, 
  RotateCcw, 
  RotateCw,
  FileText,
  Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';

// Executive Light styled SweetAlert2 configuration with ~4-5px border radius
const lightSwal = Swal.mixin({
  background: '#FFFFFF',
  color: '#0F172A',
  confirmButtonColor: '#D4AF37',
  cancelButtonColor: '#94A3B8',
  customClass: {
    popup: 'border border-slate-200 rounded-[4px] font-open-sans shadow-xl',
    confirmButton: 'text-slate-900 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]',
    cancelButton: 'text-slate-700 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]'
  }
});

// Timezone format IST
const formatTimestampToIST = (dateString) => {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (err) {
    return dateString;
  }
};

export default function AdminDynamicPageEditor({ pageKey, defaultTitle }) {
  const [title, setTitle] = useState(defaultTitle || '');
  const [contentHtml, setContentHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'html' | 'preview'
  const [lastUpdated, setLastUpdated] = useState('');

  const editorRef = useRef(null);

  // Fetch page content from Backend API
  const fetchPageContent = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/settings/${pageKey}`);
      if (res.data?.success && res.data?.data) {
        const item = res.data.data;
        setTitle(item.title || defaultTitle);
        setContentHtml(item.content || '');
        setLastUpdated(item.updatedAt || '');
        
        if (editorRef.current) {
          editorRef.current.innerHTML = item.content || '';
        }
      }
    } catch (err) {
      console.warn('Settings API fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContent();
  }, [pageKey]);

  // Keep editorRef innerHTML in sync when tab changes back to 'editor'
  useEffect(() => {
    if (activeTab === 'editor' && editorRef.current) {
      editorRef.current.innerHTML = contentHtml;
    }
  }, [activeTab]);

  // Exec Command Handler for Rich Text Formatting
  const handleExecCommand = (command, value = null) => {
    if (activeTab !== 'editor') setActiveTab('editor');
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        setContentHtml(editorRef.current.innerHTML);
      }
    }, 10);
  };

  // Sync contentHtml on editor input
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
  };

  // Save Content to Backend API
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/api/settings/${pageKey}`, {
        title,
        content: contentHtml
      });

      if (res.data?.success) {
        setLastUpdated(res.data.data.updatedAt || new Date().toISOString());
        lightSwal.fire({
          icon: 'success',
          title: 'Page Saved Successfully!',
          text: `"${title}" has been updated live in Firestore.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (err) {
      lightSwal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message || 'Could not save page content.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 font-open-sans">
      
      {/* TOP TITLE & SAVE ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-slate-200">
          <div>
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              {title || defaultTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-700" />
              <span>Last updated: {formatTimestampToIST(lastUpdated)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPageContent}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Reload Content"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-1 px-4 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Page'}</span>
            </button>
          </div>
        </div>

        {/* TOOLBAR & VIEW MODE TABS */}
        <div className="border border-slate-300 rounded-[4px] bg-white overflow-hidden shadow-2xs">
          
          {/* Header Controls: Formatting Buttons & View Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-slate-100/90 border-b border-slate-300">
            
            {/* Rich Text Toolbar Action Icons */}
            <div className="flex flex-wrap items-center gap-1">
              
              <button
                type="button"
                onClick={() => handleExecCommand('bold')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('italic')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('underline')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('strikeThrough')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-5 bg-slate-300 mx-0.5" />

              <button
                type="button"
                onClick={() => handleExecCommand('formatBlock', '<h1>')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs font-semibold text-[11px]"
                title="Heading 1"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('formatBlock', '<h2>')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs font-semibold text-[11px]"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('formatBlock', '<h3>')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs font-semibold text-[11px]"
                title="Heading 3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-5 bg-slate-300 mx-0.5" />

              <button
                type="button"
                onClick={() => handleExecCommand('insertUnorderedList')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('insertOrderedList')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('formatBlock', '<blockquote>')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-5 bg-slate-300 mx-0.5" />

              <button
                type="button"
                onClick={() => handleExecCommand('justifyLeft')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('justifyCenter')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('justifyRight')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-5 bg-slate-300 mx-0.5" />

              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter URL link:');
                  if (url) handleExecCommand('createLink', url);
                }}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Insert Link"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('undo')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Undo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleExecCommand('redo')}
                className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-[3px] text-slate-700 hover:text-slate-950 transition-colors shadow-2xs"
                title="Redo"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

            </div>

            {/* Editor Mode Tabs (Visual Editor, HTML Source, Live Preview) */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-[4px]">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-2.5 py-1 rounded-[3px] text-[10.5px] font-semibold tracking-wide uppercase transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visual Editor
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-[10.5px] font-semibold tracking-wide uppercase transition-all ${
                  activeTab === 'html'
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code className="w-3 h-3 text-amber-700" />
                <span>HTML Code</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-[10.5px] font-semibold tracking-wide uppercase transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3 h-3 text-emerald-700" />
                <span>Live Preview</span>
              </button>
            </div>

          </div>

          {/* TAB 1: VISUAL WYSIWYG EDITOR CANVAS */}
          {activeTab === 'editor' && (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              className="min-h-[420px] p-5 sm:p-6 bg-white text-slate-950 focus:outline-none text-xs leading-relaxed font-open-sans space-y-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-2.5 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 text-slate-800"
              style={{ minHeight: '420px' }}
            />
          )}

          {/* TAB 2: HTML SOURCE CODE EDITOR */}
          {activeTab === 'html' && (
            <textarea
              value={contentHtml}
              onChange={(e) => {
                setContentHtml(e.target.value);
                if (editorRef.current) {
                  editorRef.current.innerHTML = e.target.value;
                }
              }}
              rows={18}
              className="w-full p-4 bg-slate-950 text-amber-400 font-mono text-xs focus:outline-none resize-y leading-relaxed"
              placeholder="Paste HTML source code here..."
            />
          )}

          {/* TAB 3: LIVE PREVIEW RENDER */}
          {activeTab === 'preview' && (
            <div className="min-h-[420px] p-5 sm:p-6 bg-white text-slate-900 text-xs leading-relaxed font-open-sans">
              <div 
                className="space-y-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-2.5 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 text-slate-800"
                dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-slate-400 italic">No content available to preview.</p>' }}
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
