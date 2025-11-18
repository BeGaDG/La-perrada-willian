export function Footer() {
    return (
      <footer className="border-t bg-card">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} La Perrada de William. Todos los derechos reservados.</p>
        </div>
      </footer>
    );
  }
