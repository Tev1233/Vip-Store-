/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface VIPLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function VIPLogo({ className = '', size = 'md' }: VIPLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-16',
    md: 'h-12 w-28',
    lg: 'h-16 w-38',
    xl: 'h-24 w-56',
  };

  return (
    <motion.div
      id="vip-logo-container"
      className={`relative inline-flex items-center justify-center cursor-pointer ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <svg
        id="vip-logo-svg"
        viewBox="0 0 160 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
      >
        {/* Glowing Background Glow Line */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBA51" />
            <stop offset="50%" stopColor="#F3E5AB" />
            <stop offset="100%" stopColor="#C5A039" />
          </linearGradient>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Framing border - premium fashion tag style */}
        <rect
          x="2"
          y="2"
          width="156"
          height="56"
          rx="6"
          stroke="url(#goldGradient)"
          strokeWidth="1.5"
          className="opacity-90"
        />

        {/* Text V */}
        <motion.path
          d="M20 12 L35 48 L50 12"
          stroke="url(#goldGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Text I */}
        <motion.path
          d="M72 12 L72 48"
          stroke="url(#goldGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        />
        <circle cx="72" cy="12" r="2.5" fill="#F3E5AB" className="animate-pulse" />

        {/* Text P */}
        <motion.path
          d="M98 48 L98 12 H118 C130 12 130 28 118 28 H98"
          stroke="url(#goldGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
        />

        {/* Small Zimbabwe Luxury Tagline */}
        <text
          x="128"
          y="50"
          fill="#DFBA51"
          fontSize="6"
          fontWeight="bold"
          fontFamily="system-ui"
          letterSpacing="0.8"
          className="select-none tracking-wider text-[5px]"
        >
          ZIM
        </text>
      </svg>
    </motion.div>
  );
}
