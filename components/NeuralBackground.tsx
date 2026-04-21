"use client";

import React, { useRef, useEffect } from "react";

interface Dot {
  x: number;
  y: number;
  baseOpacity: number;
  currentOpacity: number;
  opacitySpeed: number;
  baseRadius: number;
  currentRadius: number;
}

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
  speed: number;
}

export const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeDots();
      initializeConnections();
    };

    const initializeDots = () => {
      const dots: Dot[] = [];
      const numDots = 80;

      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          baseOpacity: Math.random() * 0.3 + 0.1,
          currentOpacity: Math.random() * 0.3 + 0.1,
          opacitySpeed: Math.random() * 0.002 + 0.001,
          baseRadius: Math.random() * 1.5 + 0.5,
          currentRadius: Math.random() * 1.5 + 0.5,
        });
      }
      dotsRef.current = dots;
    };

    const initializeConnections = () => {
      const connections: Connection[] = [];
      const numConnections = 12;

      for (let i = 0; i < numConnections; i++) {
        connections.push({
          from: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          },
          to: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          },
          progress: Math.random(),
          speed: Math.random() * 0.003 + 0.001,
        });
      }
      connectionsRef.current = connections;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dotsRef.current.forEach((dot) => {
        dot.currentOpacity += dot.opacitySpeed;
        if (dot.currentOpacity >= 0.4 || dot.currentOpacity <= 0.1) {
          dot.opacitySpeed = -dot.opacitySpeed;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        ctx.fillStyle = `rgba(255, 255, 255, ${dot.currentOpacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      connectionsRef.current.forEach((conn) => {
        conn.progress += conn.speed;
        if (conn.progress >= 1) {
          conn.progress = 0;
          conn.from = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          };
          conn.to = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          };
        }

        const currentX =
          conn.from.x + (conn.to.x - conn.from.x) * conn.progress;
        const currentY =
          conn.from.y + (conn.to.y - conn.from.y) * conn.progress;

        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(currentX, currentY);
        ctx.shadowBlur = 5;
        ctx.shadowColor = "white";
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - conn.progress)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
