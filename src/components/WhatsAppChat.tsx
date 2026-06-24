/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Send, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WhatsAppChatProps {
  compact?: boolean;
}

const WhatsAppIcon = ({ className = "h-4.5 w-4.5" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.714 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function WhatsAppChat({ compact = false }: WhatsAppChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [msgInput, setMsgInput] = useState('');

  const BUSINESS_PHONE = '263776559364'; // Official support WhatsApp link number

  const handleSendWhatsAppMessage = (textOverride?: string) => {
    const finalMsg = textOverride || msgInput;
    if (!finalMsg.trim()) return;

    const encodedText = encodeURIComponent(finalMsg);
    const whatsappUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodedText}`;
    
    // Open in a new window/tab safely
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setMsgInput('');
  };

  const templates = [
    { label: '🏃 Same-Day Delivery Ask', text: 'Hello VIP Zimbabwe, I would like to verify same-day runner delivery availability in Chinhoyi.' },
    { label: '💰 EcoCash Payment Reference', text: 'Hello! I have just completed my USSD payment. Here is my transaction reference: ' },
    { label: '👔 Fashion Size Consultation', text: 'Hello, I need help selecting the correct size for the Bespoke Suede Bomber Jacket.' },
  ];

  return (
    <div 
      id={compact ? 'whatsapp-widget-compact' : 'whatsapp-widget-container'} 
      className={compact ? 'relative inline-block font-sans' : 'fixed bottom-6 left-6 z-40 font-sans'}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="whatsapp-chat-panel"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            // If compact, render fixed in the center or bottom left of screen so it's not cropped by the sidebar's overflow-hidden properties
            className={`w-80 bg-white border border-zinc-250 rounded-sm shadow-2xl overflow-hidden mb-4 ${
              compact ? 'fixed bottom-16 right-6 z-50' : 'relative'
            }`}
          >
            {/* WhatsApp Support Header */}
            <div className="bg-emerald-700 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Phone className="h-4 w-4 text-emerald-100 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[10.5px] uppercase tracking-widest text-emerald-50">VIP SUPPORT CHAT</h4>
                  <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online (Chinhoyi Depot)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-black/10 rounded-sm text-emerald-100 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inner Chat Space */}
            <div className="p-4 space-y-3.5 bg-zinc-50 max-h-56 overflow-y-auto scrollbar-none text-xs leading-relaxed">
              <p className="p-3 bg-white border border-zinc-200 text-zinc-700 rounded-sm">
                <strong>Salutations customer!</strong> 👋 Save your mobile data. You can place orders, ask sizing queries, or submit payment screenshots directly on WhatsApp.
              </p>

              {/* Ready Quick Buttons */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Quick Data-Saver Templates</span>
                <div className="flex flex-col gap-1.5">
                  {templates.map((tpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendWhatsAppMessage(tpl.text)}
                      className="text-left py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10.5px] rounded-sm text-emerald-800 font-bold transition-all max-line-clamp-1 truncate cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Support Message Box */}
            <div className="p-2.5 bg-white border-t border-zinc-150 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Write your custom support query..."
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendWhatsAppMessage();
                }}
                className="flex-1 px-3 py-1.5 bg-zinc-50 text-black rounded-sm text-[11px] placeholder-zinc-400 border border-zinc-200 focus:outline-none focus:border-emerald-600"
              />
              <button
                onClick={() => handleSendWhatsAppMessage()}
                className="p-3 sm:p-2 bg-emerald-700 text-white font-bold rounded-sm hover:bg-emerald-800 transition-colors shrink-0 cursor-pointer"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      {compact ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 sm:p-2 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors cursor-pointer border border-emerald-650 shadow-xs"
          title="WhatsApp Support"
        >
          <WhatsAppIcon className="h-4 w-4" />
        </button>
      ) : (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 shadow-sm bg-emerald-700 hover:bg-emerald-800 py-3.5 border border-emerald-650 rounded-sm text-white font-extrabold text-xs tracking-widest uppercase cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <WhatsAppIcon className="h-4 w-4" />
          <span>WhatsApp Support</span>
        </motion.button>
      )}

    </div>
  );
}
