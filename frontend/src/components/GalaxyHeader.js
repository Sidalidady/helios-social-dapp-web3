import React, { useEffect, useRef } from 'react';
import './GalaxyHeader.css';

function GalaxyHeader() {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    const height = 150; // Fixed header height

    // Set canvas size
    const setCanvasSize = () => {
      width = window.innerWidth;
      canvas.width = width;
      canvas.height = height;
    };

    setCanvasSize();

    // Galaxy configuration
    const config = {
      starCount: Math.floor(width / 10), // Density based on width
      centerX: width / 2,
      centerY: height / 2,
      spiralArms: 3,
      spiralTightness: 0.3,
      rotationSpeed: 0.0005,
      minSize: 1,
      maxSize: 3,
      twinkleSpeed: 0.01,
    };

    // Star class for galaxy spiral
    class GalaxyStar {
      constructor() {
        this.reset();
      }

      reset() {
        // Spiral galaxy positioning
        this.angle = Math.random() * Math.PI * 2;
        this.distance = Math.random() * Math.max(width, height) * 0.6;
        this.armOffset = Math.floor(Math.random() * config.spiralArms);
        this.size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.orbitSpeed = 0.0001 + Math.random() * 0.0003;
      }

      update(time) {
        // Spiral rotation
        this.angle += this.orbitSpeed;

        // Twinkling effect
        this.opacity = 0.3 + Math.abs(Math.sin(time * config.twinkleSpeed + this.twinklePhase)) * 0.7;
      }

      getPosition(time) {
        // Calculate spiral arm position
        const armAngle = (Math.PI * 2 / config.spiralArms) * this.armOffset;
        const spiralAngle = this.angle + armAngle + (this.distance * config.spiralTightness);
        
        // Add rotation over time
        const rotatedAngle = spiralAngle + (time * config.rotationSpeed);

        const x = config.centerX + Math.cos(rotatedAngle) * this.distance;
        const y = config.centerY + Math.sin(rotatedAngle) * this.distance * 0.5; // Flatten for header

        return { x, y };
      }

      draw(ctx, time) {
        const pos = this.getPosition(time);

        // Only draw if within canvas bounds
        if (pos.x < -10 || pos.x > width + 10 || pos.y < -10 || pos.y > height + 10) {
          return;
        }

        ctx.save();

        // Glow effect
        const gradient = ctx.createRadialGradient(
          pos.x, pos.y, 0,
          pos.x, pos.y, this.size * 3
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(0.4, `rgba(200, 220, 255, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core star
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < config.starCount; i++) {
        starsRef.current.push(new GalaxyStar());
      }
    };

    // Draw nebula glow
    const drawNebula = (ctx, time) => {
      // Purple nebula glow
      const nebulaGradient = ctx.createRadialGradient(
        config.centerX, config.centerY, 0,
        config.centerX, config.centerY, Math.max(width, height) * 0.6
      );
      
      const pulse = Math.sin(time * 0.001) * 0.1 + 0.9;
      
      nebulaGradient.addColorStop(0, `rgba(138, 43, 226, ${0.15 * pulse})`);
      nebulaGradient.addColorStop(0.3, `rgba(75, 0, 130, ${0.1 * pulse})`);
      nebulaGradient.addColorStop(0.6, `rgba(25, 25, 112, ${0.05 * pulse})`);
      nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, width, height);
    };

    // Animation loop
    const animate = () => {
      timeRef.current += 1;
      const time = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw nebula
      drawNebula(ctx, time);

      // Update and draw stars
      starsRef.current.forEach(star => {
        star.update(time);
        star.draw(ctx, time);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      initStars();
      animate();
    } else {
      // Static galaxy for reduced motion
      initStars();
      drawNebula(ctx, 0);
      starsRef.current.forEach(star => {
        star.draw(ctx, 0);
      });
    }

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
      config.centerX = width / 2;
      config.starCount = Math.floor(width / 10);
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="galaxy-header-animation">
      <canvas ref={canvasRef} className="galaxy-canvas"></canvas>
    </div>
  );
}

export default GalaxyHeader;
