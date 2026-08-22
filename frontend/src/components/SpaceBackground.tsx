import React, { useEffect, useRef } from 'react';

/**
 * Calm Cognitive Wellness Background
 * Elegant, soothing ambient canvas with subtle neural node connections,
 * gentle organic ambient gradients, and soft constellation pulses.
 */
export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    interface NeuralNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulseVal: number;
      pulseSpeed: number;
    }

    let nodes: NeuralNode[] = [];
    const numNodes = Math.min(45, Math.floor((width * height) / 28000));

    function initNodes() {
      nodes = [];
      for (let i = 0; i < numNodes; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          radius: Math.random() * 1.5 + 1.0,
          alpha: Math.random() * 0.4 + 0.2,
          pulseVal: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.015 + 0.005,
        });
      }
    }

    initNodes();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Deep calm navy/charcoal wellness base gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#060a17');
      bgGrad.addColorStop(0.5, '#0a1024');
      bgGrad.addColorStop(1, '#070b1a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft, warm ambient light fields
      const ambient1 = ctx.createRadialGradient(width * 0.7, height * 0.25, 40, width * 0.7, height * 0.25, 550);
      ambient1.addColorStop(0, 'rgba(79, 70, 229, 0.08)');
      ambient1.addColorStop(0.5, 'rgba(59, 130, 246, 0.03)');
      ambient1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambient1;
      ctx.fillRect(0, 0, width, height);

      const ambient2 = ctx.createRadialGradient(width * 0.25, height * 0.75, 40, width * 0.25, height * 0.75, 600);
      ambient2.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
      ambient2.addColorStop(0.6, 'rgba(14, 165, 233, 0.02)');
      ambient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambient2;
      ctx.fillRect(0, 0, width, height);

      // 3. Subtle neural connections between nearby nodes
      const maxConnectDist = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 4. Draw neural nodes with gentle breathing pulse
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;
          node.pulseVal += node.pulseSpeed;

          // Wrap edges smoothly
          if (node.x < 0) node.x = width;
          if (node.x > width) node.x = 0;
          if (node.y < 0) node.y = height;
          if (node.y > height) node.y = 0;
        }

        const currentAlpha = node.alpha + Math.sin(node.pulseVal) * 0.15;
        const boundedAlpha = Math.max(0.1, Math.min(0.6, currentAlpha));

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${boundedAlpha})`;
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
