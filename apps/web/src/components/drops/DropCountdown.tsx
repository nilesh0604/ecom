/**
 * DropCountdown Component
 * Countdown timer for upcoming product drops
 * DTC Feature: Drops & Limited Editions (6.4)
 */

import React, { useEffect, useState } from 'react';

export interface DropCountdownProps {
  dropDate: Date | string;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  theme?: 'light' | 'dark';
  onDropStart?: () => void;
  onNotifyClick?: () => void;
  notifyEnabled?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const DropCountdown: React.FC<DropCountdownProps> = ({
  dropDate,
  title = 'Coming Soon',
  subtitle,
  backgroundImage,
  theme = 'dark',
  onDropStart,
  onNotifyClick,
  notifyEnabled = true,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isDropped, setIsDropped] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(dropDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsDropped(true);
        onDropStart?.();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dropDate, onDropStart]);

  const isDark = theme === 'dark';

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div
        className={`text-4xl md:text-6xl font-bold tabular-nums ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {String(value).padStart(2, '0')}
      </div>
      <div
        className={`text-xs md:text-sm font-medium uppercase tracking-wider mt-1 ${
          isDark ? 'text-white/60' : 'text-gray-500'
        }`}
      >
        {label}
      </div>
    </div>
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-br from-black/80 to-black/60'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-16 text-center">
        {/* Title */}
        <h2
          className={`text-3xl md:text-5xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`text-lg md:text-xl mb-8 ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}
          >
            {subtitle}
          </p>
        )}

        {/* Countdown or Live */}
        {isDropped ? (
          <div className="space-y-4">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isDark ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
              }`}
            >
              <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
              <span className="font-bold">LIVE NOW</span>
            </div>
            <p
              className={`text-lg ${
                isDark ? 'text-white/80' : 'text-gray-600'
              }`}
            >
              The drop has started! Shop now before it's gone.
            </p>
          </div>
        ) : timeLeft ? (
          <>
            {/* Timer */}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
              <TimeBlock value={timeLeft.days} label="Days" />
              <span
                className={`text-4xl md:text-6xl font-light ${
                  isDark ? 'text-white/30' : 'text-gray-300'
                }`}
              >
                :
              </span>
              <TimeBlock value={timeLeft.hours} label="Hours" />
              <span
                className={`text-4xl md:text-6xl font-light ${
                  isDark ? 'text-white/30' : 'text-gray-300'
                }`}
              >
                :
              </span>
              <TimeBlock value={timeLeft.minutes} label="Mins" />
              <span
                className={`text-4xl md:text-6xl font-light ${
                  isDark ? 'text-white/30' : 'text-gray-300'
                }`}
              >
                :
              </span>
              <TimeBlock value={timeLeft.seconds} label="Secs" />
            </div>

            {/* Notify Button */}
            {notifyEnabled && onNotifyClick && (
              <button
                onClick={onNotifyClick}
                className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors ${
                  isDark
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                Notify Me
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DropCountdown;
