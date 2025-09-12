'use client';

import React, { useEffect, useState } from 'react';
import { useCelebration, CelebrationConfig } from './celebration-provider';
import { Sparkles, Star, Award, Trophy, Heart, Zap, CheckCircle } from 'lucide-react';

interface AnimatedParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  type: 'circle' | 'star' | 'heart' | 'sparkle';
}

const CELEBRATION_COLORS = {
  success: ['#10b981', '#059669', '#047857', '#065f46'],
  achievement: ['#f59e0b', '#f97316', '#dc2626', '#b91c1c'],
  milestone: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
  confetti: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'],
  sparkles: ['#fbbf24', '#f59e0b', '#d97706', '#b45309'],
  fireworks: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
  'gentle-pop': ['#6366f1', '#8b5cf6', '#a855f7']
};

interface CelebrationAnimationProps {
  celebration: CelebrationConfig & { id: string };
}

function CelebrationAnimation({ celebration }: CelebrationAnimationProps) {
  const [particles, setParticles] = useState<AnimatedParticle[]>([]);
  const [showIcon, setShowIcon] = useState(celebration.type === 'achievement' || celebration.type === 'success');
  
  useEffect(() => {
    createParticles();
    
    // Hide icon after animation
    if (showIcon) {
      const timer = setTimeout(() => setShowIcon(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [celebration, showIcon]);

  useEffect(() => {
    if (particles.length === 0) return;

    const animationFrame = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrame);
  });

  const createParticles = () => {
    const colors = CELEBRATION_COLORS[celebration.type] || CELEBRATION_COLORS.success;
    const intensity = celebration.intensity || 'medium';
    const particleCount = {
      low: 15,
      medium: 25,
      high: 40
    }[intensity];

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const newParticles: AnimatedParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      const size = 4 + Math.random() * 8;
      const life = 60 + Math.random() * 60; // frames

      newParticles.push({
        id: `particle-${i}`,
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life,
        maxLife: life,
        type: getParticleType(celebration.type)
      });
    }

    setParticles(newParticles);
  };

  const getParticleType = (type: string): AnimatedParticle['type'] => {
    switch (type) {
      case 'sparkles':
        return 'sparkle';
      case 'achievement':
      case 'milestone':
        return 'star';
      case 'success':
        return 'circle';
      default:
        return Math.random() > 0.5 ? 'circle' : 'star';
    }
  };

  const updateParticles = () => {
    setParticles(prevParticles => {
      return prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          rotation: particle.rotation + particle.rotationSpeed,
          life: particle.life - 1,
          opacity: particle.life / particle.maxLife
        }))
        .filter(particle => particle.life > 0);
    });
  };

  const renderParticle = (particle: AnimatedParticle) => {
    const style = {
      position: 'absolute' as const,
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.type === 'circle' ? particle.color : 'transparent',
      borderRadius: particle.type === 'circle' ? '50%' : '0',
      opacity: particle.opacity,
      transform: `rotate(${particle.rotation}deg)`,
      pointerEvents: 'none' as const,
      zIndex: 9999
    };

    if (particle.type === 'star') {
      return (
        <div key={particle.id} style={style}>
          <Star 
            size={particle.size} 
            fill={particle.color} 
            color={particle.color} 
            className="animate-pulse"
          />
        </div>
      );
    }

    if (particle.type === 'sparkle') {
      return (
        <div key={particle.id} style={style}>
          <Sparkles 
            size={particle.size} 
            fill={particle.color} 
            color={particle.color} 
          />
        </div>
      );
    }

    if (particle.type === 'heart') {
      return (
        <div key={particle.id} style={style}>
          <Heart 
            size={particle.size} 
            fill={particle.color} 
            color={particle.color} 
          />
        </div>
      );
    }

    return <div key={particle.id} style={style} />;
  };

  const getCelebrationIcon = () => {
    switch (celebration.type) {
      case 'achievement':
        return <Trophy className="w-12 h-12 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'milestone':
        return <Award className="w-12 h-12 text-purple-500" />;
      default:
        return <Sparkles className="w-12 h-12 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Central Icon Animation */}
      {showIcon && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-bounce">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl border-2 border-white/20 animate-pulse">
              {getCelebrationIcon()}
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {celebration.message && showIcon && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 mt-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-6 py-3 shadow-xl border border-white/20 animate-fade-in-up">
            <p className="text-center font-semibold text-gray-800">
              {celebration.message}
            </p>
          </div>
        </div>
      )}

      {/* Particles */}
      {particles.map(renderParticle)}

      {/* Pulse Wave Effect for Gentle Pop */}
      {celebration.type === 'gentle-pop' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 rounded-full border-4 border-indigo-400/30 animate-ping" />
          <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-indigo-500/50 animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-indigo-600/70 animate-ping" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </div>
  );
}

export function CelebrationAnimations() {
  const { activeCelebrations } = useCelebration();

  return (
    <>
      {activeCelebrations.map(celebration => (
        <CelebrationAnimation key={celebration.id} celebration={celebration} />
      ))}
    </>
  );
}