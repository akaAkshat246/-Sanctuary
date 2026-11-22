import React, { useState } from 'react';
import {
  HeartOutlineIcon,
  ShieldIcon,
  MindfulStarWithPlusIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  UserIcon,
  CalendarIcon,
  CalendarMiniIcon,
} from './icons';
import type { UserProfile, GenderType } from '../types';
import { Storage } from '../lib/storage';
import { hapticLight, hapticMedium, hapticSuccess } from '../lib/haptics';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 70 }, (_, i) => 2026 - i);

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Profile Form State
  const [name, setName] = useState('');
  const [gender] = useState<GenderType>('Male');
  const [birthdayDay, setBirthdayDay] = useState('18');
  const [birthdayMonth, setBirthdayMonth] = useState('09'); // Sep
  const [birthdayYear, setBirthdayYear] = useState('2006');
  const [hasSetBirthday, setHasSetBirthday] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(true);

  const slides = [
    {
      icon: <HeartOutlineIcon className="w-10 h-10 text-white stroke-[1.6]" />,
      title: 'Welcome to Sanctuary',
      description: 'A quiet space for your thoughts, memories, and mindful moments.',
    },
    {
      icon: <ShieldIcon className="w-10 h-10 text-white stroke-[1.6]" />,
      title: 'Your Data, Your Control',
      description: 'Everything is stored locally on your device. No cloud, no tracking, just peace of mind.',
    },
    {
      icon: <MindfulStarWithPlusIcon className="w-10 h-10 text-white stroke-[2.2]" />,
      title: 'Stay Mindful',
      description: 'Set gentle reminders and keep a digital vault of your most precious memories.',
    },
  ];

  const handleNext = () => {
    hapticLight();
    setCurrentSlide((prev) => prev + 1);
  };

  const handleBack = () => {
    hapticLight();
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      hapticLight();
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinishProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentConfirmed) return;

    hapticMedium();
    const finalBirthday = hasSetBirthday
      ? `${birthdayYear}-${birthdayMonth}-${birthdayDay}`
      : '2006-09-18';

    const finalProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Akshat',
      gender,
      birthday: finalBirthday,
      avatar,
      theme: 'light',
      fontSize: 'default',
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
    };
    Storage.setProfile(finalProfile);
    hapticSuccess();
    onComplete(finalProfile);
  };

  const displayDateStr = hasSetBirthday
    ? `${birthdayDay}-${birthdayMonth}-${birthdayYear}`
    : 'dd-mm-yyyy';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome and Onboarding"
    >
      {currentSlide < 3 ? (
        /* Dark Forest Green Background matching Images 1, 2, 3 */
        <div className="relative w-full h-full min-h-screen bg-[#071914] text-[#f0f7f4] flex flex-col items-center justify-center p-6 pt-[max(env(safe-area-inset-top,0px),2rem)] pb-[max(env(safe-area-inset-bottom,0px),2rem)]">
          <div className="flex flex-col items-center text-center max-w-sm w-full mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Subtle Frosted Circular Badge matching screenshot */}
            <div className="w-20 h-20 rounded-full bg-[#132c25] flex items-center justify-center shadow-xs">
              {slides[currentSlide].icon}
            </div>

            {/* Slide Title & Subtitle */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-heading font-normal tracking-wide text-white">
                {slides[currentSlide].title}
              </h2>
              <p className="text-sm font-normal text-[#91a79f] leading-relaxed font-body max-w-xs mx-auto">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Dots Indicator: Pill capsule + circles matching screenshots */}
            <div className="flex items-center gap-1.5 pt-2" aria-hidden="true">
              {[0, 1, 2].map((idx) => {
                const isActive = currentSlide === idx;
                return (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-7 bg-white' : 'w-1.5 bg-[#2c473f]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Action Buttons matching screenshots */}
            <div className="w-full pt-4">
              {currentSlide === 0 ? (
                /* Slide 0: Single full-width Continue button */
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-[#f7faf9] text-[#071914] font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Continue</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              ) : (
                /* Slides 1 & 2: Back button + Continue / Get Started button */
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-[36%] py-3.5 px-4 rounded-2xl bg-[#71827c] hover:bg-[#60716b] text-white font-medium text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-white hover:bg-[#f7faf9] text-[#071914] font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>{currentSlide === 2 ? 'Get Started' : 'Continue'}</span>
                    {currentSlide === 2 ? (
                      <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Pale Mint Canvas with Centered Profile Card matching Image 4 */
        <div className="relative w-full h-full min-h-screen bg-[#ebf4f0] flex items-center justify-center p-4 pt-[max(env(safe-area-inset-top,0px),2rem)] pb-[max(env(safe-area-inset-bottom,0px),2rem)]">
          <div className="w-full max-w-sm bg-[#fbfdfc] border border-[#dce9e3] rounded-[32px] p-7 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Top Heart Badge matching Image 4 */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 flex items-center justify-center text-[#12332a]">
                <HeartOutlineIcon className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-3xl font-heading font-normal tracking-tight text-[#12332a]">
                Create Your Profile
              </h3>
              <p className="text-xs text-[#5b7970] font-body">
                Let's make Sanctuary feel like home.
              </p>
            </div>

            <form onSubmit={handleFinishProfile} className="space-y-4">
              {/* Avatar Selector matching Image 4 */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <label className="relative cursor-pointer" aria-label="Upload profile picture">
                  <div className="w-20 h-20 rounded-full bg-white border border-[#e2ece7] flex items-center justify-center text-[#12332a] overflow-hidden shadow-xs hover:border-[#12332a]/40 transition">
                    {avatar ? (
                      <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 stroke-[1.6]" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] font-bold tracking-widest text-[#557369] uppercase">
                  UPLOAD PHOTO
                </span>
              </div>

              {/* Name Input matching Image 4 */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-name-input"
                  className="text-[10px] font-bold tracking-widest text-[#718d84] uppercase block"
                >
                  YOUR NAME
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#a3b8b0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="user-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="How should we call you?"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#dce9e3] text-xs text-[#12332a] placeholder-[#a3b8b0] focus:outline-none focus:border-[#0d2e26] focus-visible:ring-2 focus-visible:ring-[#0d2e26] transition"
                  />
                </div>
              </div>

              {/* Birthday Input with Popover matching Image 4 */}
              <div className="space-y-1.5 relative">
                <label
                  id="birthday-label"
                  className="text-[10px] font-bold tracking-widest text-[#718d84] uppercase block"
                >
                  YOUR BIRTHDAY
                </label>
                <button
                  type="button"
                  aria-labelledby="birthday-label"
                  aria-expanded={showDatePicker}
                  onClick={() => setShowDatePicker((prev) => !prev)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-[#dce9e3] text-[#12332a] text-xs flex items-center justify-between hover:border-[#0d2e26]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26] transition relative"
                >
                  <CalendarIcon className="w-4 h-4 text-[#a3b8b0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <span className={`font-mono ${hasSetBirthday ? 'text-[#12332a]' : 'text-[#a3b8b0]'}`}>
                    {displayDateStr}
                  </span>
                  <CalendarMiniIcon className="w-4 h-4 text-[#a3b8b0]" />
                </button>
                <p className="text-[11px] text-[#718d84]">
                  We'll celebrate with you when the day comes.
                </p>

                {/* Calendar Popover */}
                {showDatePicker && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 p-4 rounded-2xl bg-[#fbfdfc] border border-[#dce9e3] shadow-md space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#e2ede8] pb-2">
                      <span className="text-xs font-semibold text-[#12332a]">
                        {MONTHS[parseInt(birthdayMonth, 10) - 1]}, {birthdayYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setHasSetBirthday(true);
                          setShowDatePicker(false);
                        }}
                        className="text-xs text-[#0d2e26] font-semibold hover:underline"
                      >
                        Done
                      </button>
                    </div>

                    {/* Months Grid */}
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {MONTHS.map((m, idx) => {
                        const mStr = String(idx + 1).padStart(2, '0');
                        const isSelected = birthdayMonth === mStr;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setBirthdayMonth(mStr);
                              setHasSetBirthday(true);
                            }}
                            className={`py-1 rounded-lg text-xs font-medium transition ${
                              isSelected
                                ? 'bg-[#0d2e26] text-white'
                                : 'text-[#5b7970] hover:bg-[#ebf4f0]'
                            }`}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>

                    {/* Day & Year Scrollers */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1">
                        <label
                          htmlFor="select-day"
                          className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0]"
                        >
                          Day
                        </label>
                        <select
                          id="select-day"
                          value={birthdayDay}
                          onChange={(e) => {
                            setBirthdayDay(e.target.value);
                            setHasSetBirthday(true);
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#dce9e3] text-xs bg-white text-[#12332a]"
                        >
                          {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="select-year"
                          className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0]"
                        >
                          Year
                        </label>
                        <select
                          id="select-year"
                          value={birthdayYear}
                          onChange={(e) => {
                            setBirthdayYear(e.target.value);
                            setHasSetBirthday(true);
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-[#dce9e3] text-xs bg-white text-[#12332a]"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={String(y)}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Age and Consent Notice (Mandatory Requirement 2.A) */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-[11px] text-[#5b7970] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-[#dce9e3] text-[#0d2e26] focus:ring-[#0d2e26]"
                  />
                  <span>
                    I confirm that I am at least 13 years old and consent to local storage under Sanctuary's Privacy Policy.
                  </span>
                </label>
              </div>

              {/* Begin Journey Button matching Image 4 */}
              <button
                type="submit"
                disabled={!consentConfirmed}
                className="w-full py-4 px-4 rounded-2xl bg-[#082a20] hover:bg-[#0c382b] disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#082a20] mt-6"
              >
                <span>Begin Your Journey</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
