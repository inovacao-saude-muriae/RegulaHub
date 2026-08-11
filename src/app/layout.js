import Sidebar from '@/components/Sidebar.js';
import Header from '@/components/Header.js';
import './globals.css';

export const metadata = {
    title: 'HealthERP - Gestão e Regulação de Saúde',
    description: 'ERP para Saúde Pública, Regulação de Exames e Zoonoses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
        <body>
                <div style={{ display: 'flex' }}>
                    <Sidebar />
                        <div style={{ 
                            marginLeft: 'var(--sidebar-width-collapsed)', 
                            width: 'calc(100% - var(--sidebar-width-collapsed))',
                                transition: 'margin-left 0.3s ease, width 0.3s ease'
                            }}>
                            <Header />
                            <main>{children}</main>
                        </div>
                </div>
        </body>
    </html>
  );
}