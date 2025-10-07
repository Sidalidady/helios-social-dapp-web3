import React, { useEffect, useRef, useState } from 'react';
import './StarryBackground.css';

function StarryBackground() {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas size
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setCanvasSize();

    // Star configuration
    const config = {
      starCount: Math.floor((width * height) / 8000), // Density based on screen size
      minSize: 1,
      maxSize: 3,
      minSpeed: 0.05,
      maxSpeed: 0.3,
      twinkleSpeed: 0.005,
    };

    // Star class
    class Star {
      constructor() {
        this.reset();
        this.y = Math.random() * height; // Initial random position
        this.opacity = Math.random();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -10;
        this.size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        this.speed = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
        this.opacity = Math.random();
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
        this.horizontalSpeed = (Math.random() - 0.5) * 0.1; // Slight horizontal drift
      }

      update() {
        // Move star down and slightly horizontally
        this.y += this.speed;
        this.x += this.horizontalSpeed;

        // Twinkling effect
        this.opacity += config.twinkleSpeed * this.twinkleDirection;
        if (this.opacity >= 1 || this.opacity <= 0.3) {
          this.twinkleDirection *= -1;
        }

        // Reset star if it goes off screen
        if (this.y > height + 10 || this.x < -10 || this.x > width + 10) {
          this.reset();
        }
      }

      draw(ctx, isDarkMode) {
        ctx.save();
        
        // Color based on theme
        const starColor = isDarkMode 
          ? { r: 255, g: 255, b: 255 } // White for dark mode
          : { r: 59, g: 130, b: 246 };  // Blue for light mode
        
        // Glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core star
        ctx.fillStyle = `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < config.starCount; i++) {
        starsRef.current.push(new Star());
      }
    };

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw stars
      starsRef.current.forEach(star => {
        star.update();
        star.draw(ctx, isDarkMode);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      initStars();
      animate();
    } else {
      // Static stars for reduced motion
      initStars();
      starsRef.current.forEach(star => {
        star.opacity = 0.8;
        star.draw(ctx, isDarkMode);
      });
    }

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
      config.starCount = Math.floor((width * height) / 8000);
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Listen for theme changes
    const checkTheme = () => {
      const hasLightTheme = document.body.classList.contains('light-theme');
      setIsDarkMode(!hasLightTheme);
    };

    // Check theme initially
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDarkMode]);

  return (
    <div className="starry-background">
      <div className="gradient-overlay"></div>
      <canvas ref={canvasRef} className="stars-canvas"></canvas>
    </div>
  );
}

export default StarryBackground;
