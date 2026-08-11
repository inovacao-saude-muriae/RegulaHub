import Link from 'next/link';
import styles from './Sidebar.module.css';

const menuSections = [
    {
        title: 'Geral',
        items: [
            {
                name: 'Início / Módulos',
                path: '/',
                icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                )
            }
        ]
    },
    {
        title: 'Regulação de Exames',
        items: [
            {
                name: 'Tomografia',
                path: '/regulacao/tomografia',
                icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a7 7 0 1 0 10 7"/>
                </svg>
                )
            },
            {
                name: 'Cintilografia',
                path: '/regulacao/cintilografia',
                icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
                </svg>
                )
            },
            {
                name: 'Ressonância',
                path: '/regulacao/ressonancia',
                icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                )
            }
        ]
    },
    {
        title: 'Câmara Técnica',
        items: [
        {
            name: 'Farmácia Judicial',
            path: '/camara-tecnica/farmacia-judicial',
            icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                <path d="m8.5 8.5 7 7"/>
            </svg>
            )
        },
        {
            name: 'Processos',
            path: '/camara-tecnica/processos',
            icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            )
        }
        ]
    },
    {
        title: 'Junta Reguladora',
        items: [
        {
            name: 'Junta Reguladora',
            path: '/junta-reguladora',
            icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            )
        }
        ]
    },
    {
        title: 'Vigilância & Zoonoses',
        items: [
        {
            name: 'CCZ - Zoonoses',
            path: '/ccz',
            icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            )
        }
        ]
    }
];

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 6v12M6 12h12"/>
                    </svg>
                </div>
                <span className={styles.logoText}>HealthERP</span>
            </div>

            <nav className={styles.nav}>
                {menuSections.map((section, idx) => (
                <div key={idx} className={styles.sectionGroup}>
                    <span className={styles.sectionTitle}>{section.title}</span>
                    <ul className={styles.navList}>
                        {section.items.map((item) => (
                            <li key={item.path}>
                            <Link href={item.path} className={styles.navLink}>
                                <span className={styles.icon}>{item.icon}</span>
                                <span className={styles.label}>{item.name}</span>
                            </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                ))}
            </nav>
        </aside>
    );
}