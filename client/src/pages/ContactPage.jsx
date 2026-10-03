import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import api from '../api/axios';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    subject: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setError('Name and Phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/orders', {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim(),
        productTitle: formData.subject.trim() || 'Contact Page Inquiry',
        notes: formData.notes.trim(),
        orderType: 'inquiry',
        status: 'new'
      });
      setSubmitted(true);
      setFormData({ customerName: '', customerPhone: '', customerEmail: '', subject: '', notes: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-white font-open-sans select-none">
      
      {/* HERO HEADER */}
      <section className="relative py-16 sm:py-20 px-4 text-center overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0D12] via-[#08090C] to-[#08090C]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(224,176,148,0.15) 0%, transparent 60%)'
        }} />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E0B094]/30 bg-[#E0B094]/5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#E0B094]" />
            <span className="text-[10px] tracking-[0.25em] font-semibold text-[#E0B094] uppercase">Get In Touch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wider text-white uppercase leading-tight">
            Contact <span className="text-[#E0B094]">Us</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9094A0] max-w-lg mx-auto leading-relaxed">
            We'd love to hear from you. Reach out for any inquiries about our exquisite diamond jewellery, custom orders, or consultations.
          </p>
        </div>
      </section>

      {/* CONTACT INFO CARDS + FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* CONTACT INFO CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          
          {/* PHONE */}
          <div className="bg-[#0F1015] border border-white/10 rounded-xl p-5 text-center hover:border-[#E0B094]/40 transition-all group">
            <div className="w-12 h-12 rounded-full bg-[#E0B094]/10 border border-[#E0B094]/30 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#E0B094]/20 transition-colors">
              <Phone className="w-5 h-5 text-[#E0B094]" />
            </div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase mb-2">Phone</h3>
            <a href="tel:+919759005599" className="text-sm text-[#C5C8D4] hover:text-[#E0B094] transition-colors font-mono block">
              +91 9759005599
            </a>
            <a href="tel:+919458205599" className="text-sm text-[#9094A0] hover:text-[#E0B094] transition-colors font-mono block mt-1">
              +91 9458205599
            </a>
          </div>

          {/* EMAIL */}
          <div className="bg-[#0F1015] border border-white/10 rounded-xl p-5 text-center hover:border-[#E0B094]/40 transition-all group">
            <div className="w-12 h-12 rounded-full bg-[#E0B094]/10 border border-[#E0B094]/30 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#E0B094]/20 transition-colors">
              <Mail className="w-5 h-5 text-[#E0B094]" />
            </div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase mb-2">Email</h3>
            <a href="mailto:Diamorajewelofficial@gmail.com" className="text-sm text-[#C5C8D4] hover:text-[#E0B094] transition-colors block">
              Diamorajewelofficial@gmail.com
            </a>
          </div>

          {/* WHATSAPP */}
          <div className="bg-[#0F1015] border border-white/10 rounded-xl p-5 text-center hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase mb-2">WhatsApp</h3>
            <a 
              href="https://wa.me/919759005599?text=Hello%20Diamoras,%20I%20have%20an%20inquiry" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-mono block"
            >
              +91 9759005599
            </a>
            <span className="text-[10px] text-[#9094A0] mt-1 block">Chat with us instantly</span>
          </div>

          {/* VISIT */}
          <div className="bg-[#0F1015] border border-white/10 rounded-xl p-5 text-center hover:border-[#E0B094]/40 transition-all group">
            <div className="w-12 h-12 rounded-full bg-[#E0B094]/10 border border-[#E0B094]/30 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#E0B094]/20 transition-colors">
              <MapPin className="w-5 h-5 text-[#E0B094]" />
            </div>
            <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase mb-2">Visit Us</h3>
            <p className="text-sm text-[#C5C8D4] leading-relaxed">
              Dhampur, Bijnor<br />Uttar Pradesh, India
            </p>
          </div>
        </div>

        {/* FORM + MAP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* CONTACT INQUIRY FORM */}
          <div className="bg-[#0F1015] border border-white/10 rounded-xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <Send className="w-4 h-4 text-[#E0B094]" />
                Send Us A Message
              </h2>
              <p className="text-xs text-[#9094A0] mt-1">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">Inquiry Submitted!</h3>
                <p className="text-sm text-[#9094A0] max-w-xs mx-auto">
                  Thank you for reaching out. Our team will review your message and respond shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg border border-[#E0B094]/40 text-[#E0B094] hover:bg-[#E0B094]/10 transition-colors"
                >
                  Send Another Message <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                  <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                    {error}
                  </div>
                )}

                {/* Name & Phone Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold tracking-widest text-[#9094A0] uppercase block mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#12131A] text-white text-xs placeholder:text-[#505464] focus:outline-none focus:border-[#E0B094] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold tracking-widest text-[#9094A0] uppercase block mb-1.5">
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#12131A] text-white text-xs placeholder:text-[#505464] focus:outline-none focus:border-[#E0B094] transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-[#9094A0] uppercase block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#12131A] text-white text-xs placeholder:text-[#505464] focus:outline-none focus:border-[#E0B094] transition-colors"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-[#9094A0] uppercase block mb-1.5">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#12131A] text-white text-xs focus:outline-none focus:border-[#E0B094] transition-colors cursor-pointer appearance-none"
                  >
                    <option value="">Select a topic</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Custom Order Request">Custom Order Request</option>
                    <option value="Product Information">Product Information</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Return & Exchange">Return & Exchange</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="text-[10px] font-semibold tracking-widest text-[#9094A0] uppercase block mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#12131A] text-white text-xs placeholder:text-[#505464] focus:outline-none focus:border-[#E0B094] transition-colors resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-[#0C0D10] font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/10"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0C0D10]/30 border-t-[#0C0D10] rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* MAP + BUSINESS HOURS */}
          <div className="space-y-6">
            {/* Google Maps Embed */}
            <div className="bg-[#0F1015] border border-white/10 rounded-xl overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3479.1985907861313!2d78.50478267552575!3d29.305849775303866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjnCsDE4JzIxLjEiTiA3OMKwMzAnMjYuNSJF!5e0!3m2!1sen!2sin!4v1791031516775!5m2!1sen!2sin" 
                width="100%" 
                height="320" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="strict-origin-when-cross-origin"
                title="Diamoras Location"
                className="w-full"
              />
            </div>

            {/* BUSINESS HOURS */}
            <div className="bg-[#0F1015] border border-white/10 rounded-xl p-5">
              <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E0B094]" />
                Business Hours
              </h3>
              <div className="space-y-2.5">
                {[
                  { day: 'Monday – Friday', time: '10:00 AM – 8:00 PM' },
                  { day: 'Saturday', time: '10:00 AM – 6:00 PM' },
                  { day: 'Sunday', time: 'By Appointment Only' },
                ].map((item) => (
                  <div key={item.day} className="flex items-center justify-between text-xs">
                    <span className="text-[#C5C8D4] font-medium">{item.day}</span>
                    <span className="text-[#E0B094] font-mono font-semibold">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SOCIAL MEDIA */}
            <div className="bg-[#0F1015] border border-white/10 rounded-xl p-5">
              <h3 className="text-xs font-semibold tracking-[0.18em] text-white uppercase mb-4">
                Follow Us
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Instagram */}
                <a 
                  href="https://instagram.com/diamora" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-[#12131A] hover:border-pink-500/40 hover:bg-pink-500/5 transition-all group"
                >
                  <svg className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <div>
                    <span className="text-xs font-semibold text-white block">Instagram</span>
                    <span className="text-[10px] text-[#9094A0]">@diamoras</span>
                  </div>
                </a>

                {/* Facebook */}
                <a 
                  href="https://facebook.com/diamora" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-[#12131A] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                >
                  <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                  </svg>
                  <div>
                    <span className="text-xs font-semibold text-white block">Facebook</span>
                    <span className="text-[10px] text-[#9094A0]">Diamoras Jewellery</span>
                  </div>
                </a>

                {/* YouTube */}
                <a 
                  href="https://youtube.com/@diamora" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-[#12131A] hover:border-red-500/40 hover:bg-red-500/5 transition-all group"
                >
                  <svg className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <div>
                    <span className="text-xs font-semibold text-white block">YouTube</span>
                    <span className="text-[10px] text-[#9094A0]">@diamoras</span>
                  </div>
                </a>

                {/* Pinterest */}
                <a 
                  href="https://pinterest.com/diamora" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 bg-[#12131A] hover:border-red-400/40 hover:bg-red-400/5 transition-all group"
                >
                  <svg className="w-5 h-5 text-red-300 group-hover:text-red-200 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                  <div>
                    <span className="text-xs font-semibold text-white block">Pinterest</span>
                    <span className="text-[10px] text-[#9094A0]">@diamoras</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
