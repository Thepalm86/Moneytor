'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Sparkles, Trophy, Target, PlusCircle } from 'lucide-react';

export interface SuccessToastProps {
  title: string;
  description?: string;
  icon?: 'check' | 'sparkles' | 'trophy' | 'target' | 'plus';
  color?: 'green' | 'blue' | 'purple' | 'amber';
  duration?: number;
  onClose?: () => void;
  actionText?: string;
  onAction?: () => void;
}

const ICON_MAP = {
  check: CheckCircle,
  sparkles: Sparkles,
  trophy: Trophy,
  target: Target,
  plus: PlusCircle
};

const COLOR_CLASSES = {
  green: {
    bg: 'from-emerald-500/10 to-green-500/10',
    border: 'border-emerald-200/50',
    icon: 'text-emerald-600',
    text: 'text-emerald-800'
  },
  blue: {
    bg: 'from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-200/50',
    icon: 'text-blue-600',
    text: 'text-blue-800'
  },
  purple: {
    bg: 'from-purple-500/10 to-indigo-500/10',
    border: 'border-purple-200/50',
    icon: 'text-purple-600',
    text: 'text-purple-800'
  },
  amber: {
    bg: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-200/50',
    icon: 'text-amber-600',
    text: 'text-amber-800'
  }
};

export function SuccessToast({ 
  title, 
  description, 
  icon = 'check', 
  color = 'green',
  duration = 4000,
  onClose,
  actionText,
  onAction
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const IconComponent = ICON_MAP[icon];
  const colorClasses = COLOR_CLASSES[color];

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto-close after duration
    if (duration > 0) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const handleAction = () => {
    onAction?.();
    handleClose();
  };

  return (
    <Card 
      className={`
        fixed bottom-6 right-6 w-96 max-w-[90vw] z-50
        bg-gradient-to-br ${colorClasses.bg} backdrop-blur-sm
        border-2 ${colorClasses.border}
        shadow-2xl shadow-black/10
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon with animation */}
          <div className={`
            flex-shrink-0 p-2 rounded-full 
            bg-white/80 backdrop-blur-sm
            animate-bounce
            ${isVisible ? 'animate-bounce' : ''}
          `}>
            <IconComponent className={`w-5 h-5 ${colorClasses.icon}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`font-semibold text-sm ${colorClasses.text}`}>
                {title}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {description && (
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {description}
              </p>
            )}

            {actionText && onAction && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAction}
                  className={`
                    text-xs h-7 px-3
                    bg-white/80 hover:bg-white/90
                    ${colorClasses.border}
                    ${colorClasses.text}
                    transition-all duration-200
                  `}
                >
                  {actionText}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colorClasses.bg} opacity-60 animate-shrink-width`}
              style={{ 
                animation: `shrink-width ${duration}ms linear forwards`,
                transformOrigin: 'left'
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Success toast hook for easy usage
export function useSuccessToast() {
  const [toasts, setToasts] = useState<Array<SuccessToastProps & { id: string }>>([]);

  const showSuccess = (props: Omit<SuccessToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = {
      ...props,
      id,
      onClose: () => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration + animation time
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, (props.duration || 4000) + 500);
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <SuccessToast key={toast.id} {...toast} />
      ))}
    </>
  );

  return { showSuccess, ToastContainer };
}