import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
