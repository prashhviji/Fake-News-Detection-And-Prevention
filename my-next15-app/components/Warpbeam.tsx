"use client";
import React, { useRef, useEffect } from "react";

const GRID_SIZE = 80;
const MOUSE_INFLUENCE_DISTANCE = 120;
const POINT_REPEL_FORCE = 18;
const RESTORE_SPEED = 0.12;
const DAMPING = 0.85;

interface GridPoint {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const WarpBeams: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    // Create grid points
    let cols = Math.ceil(width / GRID_SIZE) + 2;
    let rows = Math.ceil(height / GRID_SIZE) + 2;
    let grid: GridPoint[][] = [];
    for (let i = 0; i < cols; i++) {
      grid[i] = [];
      for (let j = 0; j < rows; j++) {
        const x = i * GRID_SIZE - GRID_SIZE;
        const y = j * GRID_SIZE - GRID_SIZE;
        grid[i][j] = {
          baseX: x,
          baseY: y,
          x,
          y,
          vx: 0,
          vy: 0,
        };
      }
    }

    function animate() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      // Update points
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const point = grid[i][j];
          // Mouse interaction
          const dx = mouseRef.current.x - point.x;
          const dy = mouseRef.current.y - point.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_INFLUENCE_DISTANCE) {
            // Repel
            const angle = Math.atan2(dy, dx);
            const force = (MOUSE_INFLUENCE_DISTANCE - dist) / MOUSE_INFLUENCE_DISTANCE;
            point.vx -= Math.cos(angle) * force * POINT_REPEL_FORCE;
            point.vy -= Math.sin(angle) * force * POINT_REPEL_FORCE;
          }
          // Restore to base
          point.vx += (point.baseX - point.x) * RESTORE_SPEED;
          point.vy += (point.baseY - point.y) * RESTORE_SPEED;
          // Damping
          point.vx *= DAMPING;
          point.vy *= DAMPING;
          // Update position
          point.x += point.vx;
          point.y += point.vy;
        }
      }

      // Draw grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      // Vertical lines
      for (let i = 0; i < cols; i++) {
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          if (j === 0) ctx.moveTo(grid[i][j].x, grid[i][j].y);
          else ctx.lineTo(grid[i][j].x, grid[i][j].y);
        }
        ctx.stroke();
      }
      // Horizontal lines
      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
          if (i === 0) ctx.moveTo(grid[i][j].x, grid[i][j].y);
          else ctx.lineTo(grid[i][j].x, grid[i][j].y);
        }
        ctx.stroke();
      }

      // Draw glowing dots at intersections
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(grid[i][j].x, grid[i][j].y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "#fff";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }
      }

      requestAnimationFrame(animate);
    }
    animate();

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      // Recreate grid
      cols = Math.ceil(width / GRID_SIZE) + 2;
      rows = Math.ceil(height / GRID_SIZE) + 2;
      grid.length = 0;
      for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
          const x = i * GRID_SIZE - GRID_SIZE;
          const y = j * GRID_SIZE - GRID_SIZE;
          grid[i][j] = {
            baseX: x,
            baseY: y,
            x,
            y,
            vx: 0,
            vy: 0,
          };
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ background: "#000" }}
    />
  );
};

export default WarpBeams;