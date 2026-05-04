import confetti from "canvas-confetti";

export function fireExamPassConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#2dd4bf", "#3b82f6", "#f59e0b", "#a855f7"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#2dd4bf", "#3b82f6", "#f59e0b", "#a855f7"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export function fireBadgeConfetti() {
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#a855f7", "#2dd4bf", "#f59e0b"],
  });
}
