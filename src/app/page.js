import styles from './page.module.css';

    const modules = [
        {
            title: 'Regulação de Exames',
            description: 'Gestão e autorização de pedidos de Tomografia, Ressonância e Cintilografia.',
            path: '/regulacao/tomografia',
            tag: 'Alta Complexidade',
            icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            )
        },
        {
            title: 'Câmara Técnica',
            description: 'Análise de Farmácia Judicial, pareceres e acompanhamento de processos.',
            path: '/camara-tecnica/farmacia-judicial',
            tag: 'Jurídico',
            icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18M3 9l9-6 9 6M3 9l3 7h12l3-7M6 16h12"/>
            </svg>
            )
        },
        {
            title: 'Junta Reguladora',
            description: 'Avaliação médica conjunta e emissão de laudos de segunda opinião.',
            path: '/junta-reguladora',
            tag: 'Auditoria',
            icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            )
        },
        {
            title: 'Centro de Controle de Zoonoses',
            description: 'Controle de agravos, vetores, vacinação e vigilância em saúde ambiental.',
            path: '/ccz',
            tag: 'Vigilância',
            icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            )
        }
    ];

    export default function Home() {
        return (
            <div className={styles.container}>
                <header className={styles.welcomeHeader}>
                    <span className={styles.systemBadge}>RegulaHub • Sistema Integrado</span>
                    <h1>Selecione o Módulo de Trabalho</h1>
                </header>

                <div className={styles.grid}>
                    {modules.map((mod, idx) => (
                    <a key={idx} href={mod.path} className={styles.card}>
                        <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>{mod.icon}</div>
                        <span className={styles.tag}>{mod.tag}</span>
                        </div>
                        <div className={styles.cardBody}>
                        <h2>{mod.title}</h2>
                        <p>{mod.description}</p>
                        </div>
                        <div className={styles.cardFooter}>
                        <span>Acessar módulo</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                        </div>
                    </a>
                    ))}
                </div>
            </div>
        );
    }