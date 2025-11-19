import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">La Perrada de William</h3>
            <p className="text-sm text-slate-400 mb-4">
              Los mejores perros calientes y hamburguesas de la ciudad.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Menú
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Checkout
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📍 Dirección de ejemplo</li>
              <li>📞 +57 123 456 7890</li>
              <li>✉️ info@laperrada.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} La Perrada de William. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
