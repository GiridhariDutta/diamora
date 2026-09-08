import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, ShieldCheck, Award } from 'lucide-react';
import api from '../api/axios';

export default function AboutPage({ pageKey = 'about_us' }) {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine actual page key based on URL if not passed explicitly
  const targetKey = pageKey || (
    location.pathname.includes('privacy') ? 'privacy_policy' :
    location.pathname.includes('terms') ? 'terms_conditions' : 'about_us'
  );

  useEffect(() => {
    fetchPageData();
  }, [targetKey]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/settings/${targetKey}`);
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error('Failed to fetch page data:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackTitle = () => {
    if (targetKey === 'privacy_policy') return 'PRIVACY POLICY';
    if (targetKey === 'terms_conditions') return 'TERMS & CONDITIONS';
    return 'ABOUT DIAMORA';
  };

  const cleanHtmlContent = (rawHtml) => {
    if (!rawHtml) return '';
    let cleaned = rawHtml.replace(/<font[^>]*>/gi, '').replace(/<\/font>/gi, '');
    cleaned = cleaned.replace(/style="[^"]*"/gi, (match) => {
      let style = match.replace(/color\s*:\s*[^;"]+;?/gi, '');
      style = style.replace(/background-color\s*:\s*[^;"]+;?/gi, '');
      if (style === 'style=""' || style === 'style=" "' || style === 'style=";"') return '';
      return style;
    });
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F0] pt-28 pb-24 font-poppins">
      
      {/* HERO HEADER (PAGE TOP) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center pb-8">
        <h1 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.16em] uppercase drop-shadow-[0_2px_15px_rgba(247,224,154,0.35)]">
          <span className="bg-gradient-to-r from-white via-[#F7E09A] to-[#E0B094] bg-clip-text text-transparent">
            {loading ? (getFallbackTitle()) : (data?.title ? data.title.toUpperCase() : getFallbackTitle())}
          </span>
        </h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#E0B094]/60" />
          <Sparkles className="w-3.5 h-3.5 text-[#E0B094]" />
          <span className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#E0B094]/60" />
        </div>
      </div>

      {/* DYNAMIC CONTENT CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="animate-pulse bg-[#16181F]/70 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl">
            <div className="h-6 bg-white/10 rounded w-1/3" />
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
              <div className="h-4 bg-white/10 rounded w-4/6" />
            </div>
            <div className="h-5 bg-white/10 rounded w-1/4 pt-4" />
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          </div>
        ) : data && data.content ? (
          <div className="bg-[#16181F]/80 backdrop-blur-3xl border border-white/15 rounded-2xl p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-[#F5F5F0]">
            <div
              className="prose prose-invert max-w-none 
                [&_h1]:font-cinzel [&_h1]:text-base sm:[&_h1]:text-lg [&_h1]:!text-[#D4AF37] [&_h1_*]:!text-[#D4AF37] [&_h1]:tracking-[0.16em] [&_h1]:uppercase [&_h1]:font-medium [&_h1]:mb-3 [&_h1]:mt-6 [&_h1:first-child]:mt-0
                [&_h2]:font-cinzel [&_h2]:text-base sm:[&_h2]:text-lg [&_h2]:!text-[#D4AF37] [&_h2_*]:!text-[#D4AF37] [&_h2]:tracking-[0.16em] [&_h2]:uppercase [&_h2]:font-medium [&_h2]:mb-3 [&_h2]:mt-6 [&_h2:first-child]:mt-0
                [&_h3]:font-cinzel [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:!text-[#E0B094] [&_h3_*]:!text-[#E0B094] [&_h3]:tracking-[0.14em] [&_h3]:uppercase [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-5 [&_h3:first-child]:mt-0
                [&_p]:!text-[#C5C8D0] [&_p_*]:!text-[#C5C8D0] [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-5 [&_p]:font-light [&_p]:text-justify
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:!text-[#C5C8D0] [&_ul_*]:!text-[#C5C8D0] [&_ul]:text-sm [&_ul]:space-y-1.5 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:!text-[#C5C8D0] [&_ol_*]:!text-[#C5C8D0] [&_ol]:text-sm [&_ol]:space-y-1.5 [&_ol]:mb-4
                [&_strong]:!text-[#F5F5F0] [&_strong]:font-semibold
                [&_a]:!text-[#E0B094] [&_a]:underline hover:[&_a]:!text-white transition-colors"
              dangerouslySetInnerHTML={{ __html: cleanHtmlContent(data.content) }}
            />
          </div>
        ) : (
          <div className="text-center py-16 bg-[#16181F]/75 backdrop-blur-3xl rounded-2xl border border-white/15">
            <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-semibold text-[#F5F5F0] tracking-wider uppercase">
              Content Initializing
            </h3>
            <p className="text-xs text-[#C5C8D0] mt-1 font-light max-w-sm mx-auto">
              This page content is currently being updated in the admin vault. Please check back shortly.
            </p>
          </div>
        )}
      </main>

    </div>
  );
}
