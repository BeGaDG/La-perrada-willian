import { Flame } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="La Perrada de William - Página de inicio">
      <Flame className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
        La Perrada de William
      </span>
    </Link>
  );
}
