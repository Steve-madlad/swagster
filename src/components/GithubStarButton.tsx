import confetti from 'canvas-confetti';
import { Github } from 'lucide-react';
import { useRef } from 'react';

export default function GithubStarButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const star = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 150,
      spread: 300,
      origin: { x, y },
    });

    setTimeout(() => {
      window.open('https://github.com/Steve-madlad/swagster.git', '_blank');
    }, 300);
  };

  return (
    <button
      ref={buttonRef}
      onClick={star}
      className="align-center from-primary mt-10 gap-2 rounded-full! bg-linear-to-r to-violet-400 px-7 py-4 text-white transition-all! duration-100! hover:scale-105 hover:shadow-[0_2px_1px_#7e22fe17,0_4px_2px_#7e22fe17,0_8px_4px_#7e22fe17,0_16px_8px_#7e22fe17,0_32px_16px_#7e22fe17] focus-visible:scale-105 focus-visible:shadow-[0_2px_1px_#7e22fe17,0_4px_2px_#7e22fe17,0_8px_4px_#7e22fe17,0_16px_8px_#7e22fe17,0_32px_16px_#7e22fe17] focus-visible:outline-0"
    >
      ⭐ On Github <Github size={20} className="mb-0.75" />
    </button>
  );
}
