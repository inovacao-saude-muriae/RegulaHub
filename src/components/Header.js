import styles from './Header.module.css';

    export default function Header() {
        return (
            <header className={styles.header}>
            <div className={styles.searchBox}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input 
                type="search" 
                placeholder="Buscar paciente, CPF ou processo..." 
                className={styles.searchInput} 
                />
            </div>

            <div className={styles.actions}>
                <button className={styles.iconBtn} title="Notificações">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                <span className={styles.notificationDot}></span>
                </button>
                
                <div className={styles.divider}></div>

                <div className={styles.profile}>
                    <div className={styles.avatar}>DR</div>
                    <div className={styles.profileInfo}>
                        <span className={styles.userName}>Admin</span>
                        <span className={styles.userRole}>Administrador</span>
                    </div>
                </div>
            </div>
            </header>
        );
}