/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clipboard, Shield, Sparkles, ChevronRight, Lock, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "你的剪贴板历史，自动保存",
      description: "在任意 App 中复制文本、链接或代码，PastePal 将在本地安全记录，让你的碎片信息永不丢失。",
      icon: <Clipboard className="w-16 h-16 text-[#007AFF]" />,
      color: "from-[#007AFF]/20 to-[#007AFF]/5"
    },
    {
      title: "隐私优先，数据只属于你",
      description: "无服务器架构。所有数据均保存在本地和你的 iCloud 中，支持 App 忽略列表与敏感内容智能模糊，极度安全。",
      icon: <Shield className="w-16 h-16 text-[#BF5AF2]" />,
      color: "from-[#BF5AF2]/20 to-[#BF5AF2]/5"
    },
    {
      title: "点击即可回拷",
      description: "点击历史记录中的任何内容即可极速回拷，配合清脆的震动反馈和气泡提示。一秒找回你的生产力。",
      icon: <Sparkles className="w-16 h-16 text-[#FF9500]" />,
      color: "from-[#FF9500]/20 to-[#FF9500]/5"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between px-6 py-12 text-white font-sans">
      {/* Skip button */}
      <div className="flex justify-end">
        <button 
          onClick={onComplete}
          className="text-sm font-semibold text-white/40 hover:text-white transition-colors py-2 px-3 cursor-pointer"
        >
          跳过 Skip
        </button>
      </div>

      {/* Main Slideshow */}
      <div className="flex-grow flex flex-col justify-center items-center max-w-sm mx-auto text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="flex flex-col items-center"
          >
            {/* Visual Icon Box */}
            <div className={`w-32 h-32 rounded-[32px] bg-gradient-to-b ${steps[currentStep].color} flex items-center justify-center shadow-inner border border-white/5 mb-8 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
              {steps[currentStep].icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white tracking-tight mb-4 font-display">
              {steps[currentStep].title}
            </h2>

            {/* Description */}
            <p className="text-sm text-white/60 leading-relaxed px-4">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-6">
        {/* Step dots */}
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleBack(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentStep === idx 
                  ? 'w-6 bg-[#007AFF]' 
                  : 'w-2 bg-white/10'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Big Action Button */}
        <button
          onClick={handleNext}
          className="w-full max-w-xs py-3.5 bg-white hover:bg-white/90 text-black font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          {currentStep === steps.length - 1 ? (
            <>
              开始使用
              <Check className="w-5 h-5" />
            </>
          ) : (
            <>
              下一步
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Subtext */}
        <p className="text-[10px] text-white/30 text-center flex items-center gap-1 font-mono">
          <Lock className="w-3 h-3" />
          端到端加密，数据完全保存在本地设备与个人 iCloud
        </p>
      </div>
    </div>
  );
}
