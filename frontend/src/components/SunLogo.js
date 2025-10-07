import React, { useEffect, useRef } from 'react';
import './SunLogo.css';

function SunLogo() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const flaresRef = useRef([]);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 60; // Logo size
    canvas.width = size;
    canvas.height = size;
    const centerX = size / 2;
    const centerY = size / 2;

    // Particle class for orbiting particles
    class Particle {
      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.distance = 20 + Math.random() * 10;
        this.speed = 0.01 + Math.random() * 0.02;
        this.size = 1 + Math.random() * 2;
        this.opacity = 0.5 + Math.random() * 0.5;
        this.ellipseRatio = 0.6 + Math.random() * 0.4; // For elliptical orbit
      }

      update() {
        this.angle += this.speed;
      }

      draw(ctx, centerX, centerY) {
        const x = centerX + Math.cos(this.angle) * this.distance;
        const y = centerY + Math.sin(this.angle) * this.distance * this.ellipseRatio;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Particle glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size * 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // Solar flare class
    class SolarFlare {
      constructor(time) {
        this.angle = Math.random() * Math.PI * 2;
        this.length = 8 + Math.random() * 12;
        this.width = 1 + Math.random() * 2;
        this.opacity = 0.8;
        this.fadeSpeed = 0.02 + Math.random() * 0.03;
        this.startRadius = 15;
        this.active = true;
      }

      update() {
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0) {
          this.active = false;
        }
      }

      draw(ctx, centerX, centerY) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';

        const startX = centerX + Math.cos(this.angle) * this.startRadius;
        const startY = centerY + Math.sin(this.angle) * this.startRadius;
        const endX = centerX + Math.cos(this.angle) * (this.startRadius + this.length);
        const endY = centerY + Math.sin(this.angle) * (this.startRadius + this.length);

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff6600';

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.restore();
      }
    }

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push(new Particle());
      }
    };

    // Draw the sun
    const drawSun = (time) => {
      const pulse = Math.sin(time * 0.002) * 0.1 + 0.9; // Pulsating effect
      const radius = 15 * pulse;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * 2
      );
      outerGlow.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
      outerGlow.addColorStop(0.5, 'rgba(255, 150, 0, 0.4)');
      outerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main sun body
      const sunGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      sunGradient.addColorStop(0, '#fff9e6');
      sunGradient.addColorStop(0.3, '#ffeb3b');
      sunGradient.addColorStop(0.7, '#ffa726');
      sunGradient.addColorStop(1, '#ff6f00');

      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      const coreGradient = ctx.createRadialGradient(
        centerX - 3, centerY - 3, 0,
        centerX, centerY, radius * 0.5
      );
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX - 3, centerY - 3, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };

    // Animation loop
    const animate = () => {
      timeRef.current += 1;
      const time = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Draw sun
      drawSun(time);

      // Update and draw solar flares
      flaresRef.current = flaresRef.current.filter(flare => flare.active);
      flaresRef.current.forEach(flare => {
        flare.update();
        flare.draw(ctx, centerX, centerY);
      });

      // Add new flares randomly
      if (Math.random() < 0.03) {
        flaresRef.current.push(new SolarFlare(time));
      }

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx, centerX, centerY);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      initParticles();
      animate();
    } else {
      // Static sun
      drawSun(0);
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="sun-logo-container">
      <canvas ref={canvasRef} className="sun-logo-canvas"></canvas>
      <div className="helios-text">
        <span className="helios-main">HELIOS</span>
        <span className="helios-sub">Social</span>
      </div>
    </div>
  );
}

export default SunLogo;
