import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-vh-100 d-flex flex-column">
            <Header />
            <main className="flex-grow-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}

