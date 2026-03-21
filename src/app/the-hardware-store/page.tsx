"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const AccordionSpring = () => (
  <div className="absolute top-[38px] left-1/2 -translate-x-1/2 w-16 h-[500px] flex flex-col pt-1 pointer-events-none z-0">
    <div className="absolute inset-0 w-8 mx-auto bg-gradient-to-b from-gray-700 to-black z-0 border-x-4 border-gray-600 shadow-inner" />
    <div className="relative z-10 w-full h-full flex flex-col items-center">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="w-16 h-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded-sm mb-3 shadow-[0_4px_6px_rgba(0,0,0,0.8)] border border-gray-500"
        />
      ))}
    </div>
  </div>
);

export default function HardwareStoreChaosPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLDivElement>(null);

  const piston1Ref = useRef<HTMLDivElement>(null);
  const piston2Ref = useRef<HTMLDivElement>(null);
  const piston3Ref = useRef<HTMLDivElement>(null);

  const entitiesRef = useRef<{ body: Matter.Body; elem: HTMLElement | null }[]>(
    [],
  );

  // Generate 30 highly realistic emoji instances mapping the exact Hardware set
  const emojis = ["🔨", "🔧", "⚙️", "🔩", "🪛"];
  const [items] = useState(() =>
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      char: emojis[Math.floor(Math.random() * emojis.length)],
      size: 40 + Math.random() * 45, // Varies from 40px to 85px size natively
    })),
  );

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    // Core Matter logic
    const { Engine, Runner, Bodies, Composite, Events, Body } = Matter;
    const engine = Engine.create();

    // Dynamic boundary mapping constrained perfectly to the container width/height
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    // Extremely thick bounding walls positioned directly relative to container to prevent clipping
    const wallOpts = {
      isStatic: true,
      render: { visible: false },
      friction: 0.1,
    };
    const ground = Bodies.rectangle(w / 2, h + 500, w * 3, 1000, wallOpts);
    const leftWall = Bodies.rectangle(-500, h / 2, 1000, h * 3, wallOpts);
    const rightWall = Bodies.rectangle(w + 500, h / 2, 1000, h * 3, wallOpts);
    const ceiling = Bodies.rectangle(w / 2, -1000, w * 3, 1000, wallOpts);

    const videoBody = Bodies.rectangle(w / 2, 150, 480, 360, {
      restitution: 0.4, // Reduced from 0.6 to minimize high-speed kinetic bouncing
      density: 0.08, // Increased mass significantly to feel physically grounded
      frictionAir: 0.02,
      friction: 0.5,
    });

    entitiesRef.current.push({ body: videoBody, elem: videoRef.current });

    // Physics engine mapper mapping each random item dynamically
    const tools = items.map((item, i) => {
      // Randomly scatter items across the initial box volume
      const initialX = w * 0.1 + Math.random() * (w * 0.8);
      const body = Bodies.rectangle(
        initialX,
        50 + Math.random() * 200,
        item.size * 0.8,
        item.size * 0.8,
        {
          restitution: 0.5, // Less extreme bouncing when components collide
          density: 0.02, // Heavier parts fall faster correctly matching realistic vectors
          frictionAir: 0.015,
          friction: 0.2,
        },
      );
      entitiesRef.current.push({ body, elem: itemRefs.current[i] });
      return body;
    });

    // Proportional pistons spanning the entire width (33.333% each perfectly natively tiling)
    const pWidth = w / 3;
    const pHeight = 1000; // Massively extend pistons physically downwards infinitely preventing underground tunneling
    const pBaseY = h + pHeight / 2 - 20; // Top bounding edge functionally locks at h - 20

    const p1 = Bodies.rectangle(w * (1 / 6), pBaseY, pWidth, pHeight, {
      isStatic: true,
    });
    const p2 = Bodies.rectangle(w * (3 / 6), pBaseY, pWidth, pHeight, {
      isStatic: true,
    });
    const p3 = Bodies.rectangle(w * (5 / 6), pBaseY, pWidth, pHeight, {
      isStatic: true,
    });
    const pistons = [p1, p2, p3];

    // Manage dynamic kinematic targets to ease positions smoothly over physics ticks
    const pistonTargets = [pBaseY, pBaseY, pBaseY];

    entitiesRef.current.push({ body: p1, elem: piston1Ref.current });
    entitiesRef.current.push({ body: p2, elem: piston2Ref.current });
    entitiesRef.current.push({ body: p3, elem: piston3Ref.current });

    Composite.add(engine.world, [
      ground,
      leftWall,
      rightWall,
      ceiling,
      videoBody,
      ...tools,
      ...pistons,
    ]);

    const runner = Runner.create();
    Runner.run(runner, engine);

    // Inject Kinematic Simulation Easing
    Events.on(engine, "beforeUpdate", () => {
      pistons.forEach((p, idx) => {
        const targetY = pistonTargets[idx];
        const dy = targetY - p.position.y;

        // If delta is huge, mathematically slide the kinematic array towards target instead of teleporting
        if (Math.abs(dy) > 0.5) {
          const moveY = dy * 0.35; // The damping scaler: 0.35 = very fast, but visually fluid slide over ~6 frames
          Body.setVelocity(p, { x: 0, y: moveY });
          Body.setPosition(p, { x: p.position.x, y: p.position.y + moveY });
        } else {
          Body.setVelocity(p, { x: 0, y: 0 });
          Body.setPosition(p, { x: p.position.x, y: targetY });
        }
      });
    });

    Events.on(engine, "afterUpdate", () => {
      entitiesRef.current.forEach(({ body, elem }) => {
        if (elem) {
          const { x, y } = body.position;
          elem.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
        }
      });
    });

    const pistonInterval = setInterval(() => {
      if (!containerRef.current) return;
      const targetIdx = Math.floor(Math.random() * pistons.length);

      // Trigger upward slide via target modification (Launch 160px upwards violently)
      pistonTargets[targetIdx] = pBaseY - 160;

      setTimeout(() => {
        // Initiate downward retract sequence
        pistonTargets[targetIdx] = pBaseY;
      }, 300);
    }, 1500);

    return () => {
      clearInterval(pistonInterval);
      Runner.stop(runner);
      Engine.clear(engine);
      entitiesRef.current = [];
    };
  }, [items]);

  return (
    <div
      ref={containerRef}
      className="w-[100vw] h-[calc(100vh-80px)] relative left-1/2 -translate-x-1/2 -my-8 bg-dark-bg/80 border-y border-dark-border shadow-inner flex-shrink-0"
    >
      {/* YouTube Video Node strictly trimmed to a 4:3 Aspect Ratio isolating structural black bars */}
      <div
        ref={videoRef}
        className="absolute top-0 left-0 w-[480px] h-[360px] origin-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-brand-500 bg-black flex-shrink-0 z-20"
        style={{ willChange: "transform" }}
      >
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/Chc9DwDkWn0?autoplay=1&mute=0&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0"
          title="Hardware Store Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          className="w-full h-full pointer-events-none"
        />
      </div>

      {/* Render 30 Native Apple/Windows full-color emoji constructs mapping the exact Hardware set with huge depth tracking */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          className="absolute top-0 left-0 origin-center leading-none z-20"
          style={{
            fontSize: `${item.size}px`,
            willChange: "transform",
            filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.5))",
          }}
        >
          {item.char}
        </div>
      ))}

      {/* Kinematic Pistons: Rendered inside a strict overflow layout boundary to explicitly severe their infinite 1000px scaling from expanding the global browser scroll height natively */}
      <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none">
        <div
          ref={piston1Ref}
          className="absolute top-0 left-0 z-10 h-[1000px]"
          style={{ width: "33.5%", willChange: "transform" }}
        >
          <div className="absolute top-0 w-full h-[40px] bg-brand-500 border-2 border-brand-400 shadow-[0_-5px_30px_rgba(249,94,38,0.5)] z-20 flex justify-center items-center">
            <div className="w-[80%] h-1 bg-white/20 absolute top-1" />
          </div>
          <AccordionSpring />
        </div>
        <div
          ref={piston2Ref}
          className="absolute top-0 left-0 z-10 h-[1000px]"
          style={{ width: "33.5%", willChange: "transform" }}
        >
          <div className="absolute top-0 w-full h-[40px] bg-brand-500 border-2 border-brand-400 shadow-[0_-5px_30px_rgba(249,94,38,0.5)] z-20 flex justify-center items-center">
            <div className="w-[80%] h-1 bg-white/20 absolute top-1" />
          </div>
          <AccordionSpring />
        </div>
        <div
          ref={piston3Ref}
          className="absolute top-0 left-0 z-10 h-[1000px]"
          style={{ width: "33.5%", willChange: "transform" }}
        >
          <div className="absolute top-0 w-full h-[40px] bg-brand-500 border-2 border-brand-400 shadow-[0_-5px_30px_rgba(249,94,38,0.5)] z-20 flex justify-center items-center">
            <div className="w-[80%] h-1 bg-white/20 absolute top-1" />
          </div>
          <AccordionSpring />
        </div>
      </div>
    </div>
  );
}
