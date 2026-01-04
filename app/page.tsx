/**
 * Remainders - Main Page Component
 * Minimalist Redesign
 */

'use client';

import { useState, useEffect } from 'react';
import { UserProfile, DeviceModel } from '@/lib/types';
import DeviceSelector from '@/components/DeviceSelector';
import BirthDateInput from '@/components/BirthDateInput';
import ViewModeToggle from '@/components/ViewModeToggle';
import SetupInstructions from '@/components/SetupInstructions';

const STORAGE_KEY = 'remainders-user-profile';
const THEME_COLOR = 'FFFFFF'; // White for minimalist dark theme

export default function Home() {
  const [birthDate, setBirthDate] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<DeviceModel | null>(null);
  const [viewMode, setViewMode] = useState<'year' | 'life'>('life');
  const [wallpaperUrl, setWallpaperUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);
      if (savedProfile) {
        const profile: UserProfile = JSON.parse(savedProfile);
        setBirthDate(profile.birthDate);
        if (profile.viewMode) setViewMode(profile.viewMode);

        if (profile.device) {
          setSelectedDevice({
            brand: profile.device.brand || '',
            model: profile.device.modelName,
            width: profile.device.width,
            height: profile.device.height,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (birthDate && selectedDevice) {
      const profile: UserProfile = {
        birthDate,
        themeColor: THEME_COLOR,
        device: {
          brand: selectedDevice.brand,
          modelName: selectedDevice.model,
          width: selectedDevice.width,
          height: selectedDevice.height,
        },
        viewMode,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        console.log('Profile saved:', profile);
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
  }, [birthDate, selectedDevice, viewMode]);

  const generateWallpaperUrl = () => {
    if (!selectedDevice) return;
    if (viewMode === 'life' && !birthDate) return;

    const params = new URLSearchParams({
      themeColor: THEME_COLOR,
      width: selectedDevice.width.toString(),
      height: selectedDevice.height.toString(),
      viewMode,
    });

    if (viewMode === 'life' && birthDate) {
      params.append('birthDate', birthDate);
    }

    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : '';

    const url = `${baseUrl}/api/wallpaper?${params.toString()}`;
    setWallpaperUrl(url);
  };

  // Auto-generate wallpaper URL when data is loaded from localStorage
  useEffect(() => {
    if (isFormComplete && !wallpaperUrl) {
      generateWallpaperUrl();
    }
  }, [selectedDevice, birthDate, viewMode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(wallpaperUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy keys:', error);
    }
  };

  const isFormComplete = viewMode === 'year' ? selectedDevice !== null : (birthDate && selectedDevice);

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 selection:bg-white selection:text-black">
      <div className="w-full flex-1 flex flex-col items-center justify-center max-w-md space-y-12">
        {/* Header */}
        <header className="text-center space-y-2 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-light tracking-widest text-white uppercase">Remainders</h1>
            <a
              href="https://github.com/Ti-03/Chronos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-80 hover:opacity-100 transition-opacity">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-neutral-500 font-mono tracking-wide">MEMENTO MORI</p>
        </header>

        {/* Configuration */}
        <div className="space-y-8 w-full">
          <ViewModeToggle selectedMode={viewMode} onChange={setViewMode} />

          <div className="space-y-6">
            {viewMode === 'life' && (
              <BirthDateInput value={birthDate} onChange={setBirthDate} />
            )}

            <DeviceSelector
              selectedModel={selectedDevice?.model || ''}
              onSelect={setSelectedDevice}
            />
          </div>

          <button
            onClick={generateWallpaperUrl}
            disabled={!isFormComplete}
            className={`
              w-full py-4 text-sm uppercase tracking-widest font-medium transition-all duration-300
              ${isFormComplete
                ? 'bg-white text-black hover:bg-neutral-200'
                : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
              }
            `}
          >
            Generate
          </button>
        </div>

        {/* Result Area */}
        {wallpaperUrl && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 p-4 border border-white/10 bg-white/5 rounded backdrop-blur-sm">
              <code className="text-xs text-neutral-400 truncate flex-1 font-mono">
                {wallpaperUrl}
              </code>
              <button
                onClick={copyToClipboard}
                className="text-xs text-white hover:text-neutral-300 uppercase tracking-wider"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="text-center">
              <a
                href={wallpaperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
              >
                Preview Wallpaper
              </a>
            </div>

            <SetupInstructions wallpaperUrl={wallpaperUrl} selectedBrand={selectedDevice?.brand || ''} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <a
          href="https://github.com/Ti-03"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-neutral-600 hover:text-neutral-400 uppercase tracking-widest transition-colors"
        >
          Created by Qutibah Ananzeh
        </a>
      </footer>
    </main>
  );
}
