import { useEffect, useRef } from "react";

export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Mobile Check
    const isMobile = window.innerWidth < 768;

    let stars = [];
    let planets = [];
    let shootingStars = [];
    let particles = [];
    let mouse = { x: 0, y: 0, realX: -1000, realY: -1000 };
    let isClicking = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class ShootingStar {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = (Math.random() * canvas.height) / 2;
        this.length = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 6;
        this.size = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
      }
      update() {
        this.x += this.speed; this.y += this.speed; this.opacity -= 0.01;
        if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
          if (Math.random() < 0.03) this.reset();
        }
      }
      draw() {
        if (this.opacity > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.lineWidth = this.size;
          ctx.beginPath(); ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.length, this.y - this.length);
          ctx.stroke(); ctx.restore();
        }
      }
    }

    class Particle {
      constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.size = Math.random() * 3 + 1;
        this.life = 1;
      }
      update() { this.x += this.vx; this.y += this.vy; this.life -= 0.02; }
      draw() {
        ctx.fillStyle = `rgba(245, 158, 11, ${this.life})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    class Planet {
      constructor(size, color, speed, depth) {
        this.size = size; this.color = color; this.speed = speed; this.depth = depth;
        this.reset(true);
      }
      reset(firstTime) {
        this.x = Math.random() * canvas.width;
        this.y = firstTime ? Math.random() * canvas.height : -200;
      }
      update() {
        this.y += this.speed;
        if (this.y > canvas.height + 200) this.reset();
        this.renderX = this.x + (mouse.x * this.depth);
        this.renderY = this.y + (mouse.y * this.depth);
      }
      draw() {
        ctx.save(); ctx.translate(this.renderX, this.renderY);
        let grad = ctx.createRadialGradient(-this.size/3, -this.size/3, this.size/10, 0, 0, this.size);
        grad.addColorStop(0, this.color); grad.addColorStop(1, "black");
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    class Star {
      constructor() { 
        this.init(); 
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * (isMobile ? 1.2 : 2); // Smaller stars on mobile
        this.vy = Math.random() * 0.3 + 0.1;
      }
      update() {
        this.twinkle += this.twinkleSpeed;
        if (isClicking) {
          const dx = mouse.realX - this.x; const dy = mouse.realY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          this.x += dx / (dist * 0.1); this.y += dy / (dist * 0.1);
          if (dist < 5) this.init();
        } else {
          this.y += this.vy; if (this.y > canvas.height) this.y = 0;
        }
      }
      draw() { 
        const opacity = 0.8 + Math.sin(this.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`; 
        ctx.fillRect(this.x, this.y, this.size, this.size); 
      }
    }

    // INITIALIZATION BASED ON DEVICE
    if (!isMobile) {
      planets = [new Planet(60, "#f59e0b", 0.1, 5), new Planet(110, "#78350f", 0.05, 3)];
      for (let i = 0; i < 5; i++) shootingStars.push(new ShootingStar());
    } else {
      // Minimal shooting stars for mobile
      shootingStars.push(new ShootingStar());
    }

    const starCount = isMobile ? 60 : 200;
    for (let i = 0; i < starCount; i++) stars.push(new Star());

    const animate = () => {
      ctx.fillStyle = "#020202"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { s.update(); s.draw(); });
      planets.forEach(p => { p.update(); p.draw(); });
      shootingStars.forEach(s => { s.update(); s.draw(); });
      particles = particles.filter(p => { p.update(); p.draw(); return p.life > 0; });
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      mouse.realX = e.clientX; mouse.realY = e.clientY;
      mouse.x = (e.clientX - canvas.width/2) / 80;
      mouse.y = (e.clientY - canvas.height/2) / 80;
    };
    const handleClick = (e) => {
      // Fewer particles on mobile click
      const pCount = isMobile ? 8 : 20;
      for (let i = 0; i < pCount; i++) particles.push(new Particle(e.clientX, e.clientY));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", () => isClicking = true);
    window.addEventListener("mouseup", () => isClicking = false);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}