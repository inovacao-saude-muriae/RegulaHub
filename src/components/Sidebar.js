"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./Sidebar.module.css";

const menuSections = [
  {
    title: "Geral",
    items: [
      {
        name: "Início / Módulos",
        path: "/",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Regulação de Exames",
    items: [
      {
        name: "Regulação de Exames",
        path: "/regulacao",
        isDropdown: true,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        ),
        subItems: [
          { name: "Dashboard", tab: "DASHBOARD" },
          { name: "Novo Pedido", tab: "NOVO_PEDIDO" },
          { name: "Lista de Espera", tab: "LISTA_ESPERA" },
          { name: "Liberados", tab: "LIBERADOS" },
          { name: "Financeiro", tab: "FINANCEIRO" },
          {
            name: "Cadastros",
            tab: "CADASTROS",
            isNestedDropdown: true,
            nestedItems: [
              { name: "Pacientes", subTab: "PESSOAS" },
              { name: "Médicos Solicitantes", subTab: "MEDICOS" },
              { name: "Unidades / UBS", subTab: "UBS" },
              { name: "Procedimentos", subTab: "PROCEDIMENTOS" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Câmara Técnica",
    items: [
      {
        name: "Farmácia Judicial",
        path: "/camara-tecnica/farmacia-judicial",
        isDropdown: true,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        ),
        subItems: [
          { name: "Dashboard", tab: "DASHBOARD" },
          { name: "Pacientes", tab: "PACIENTES" },
          { name: "Dispensação", tab: "DISPENSACAO" },
          {
            name: "Estoque e Lotes",
            tab: "ESTOQUE",
            isNestedDropdown: true,
            nestedItems: [
              { name: "Saldo do Estoque", subTab: "SALDO" },
              { name: "Registrar Entrada", subTab: "ENTRADA" },
              { name: "Cadastrar Medicamento", subTab: "CADASTRAR" },
            ],
          },
          { name: "Relatórios", tab: "RELATORIOS" },
        ],
      },
      {
        name: "Processos",
        path: "/camara-tecnica/processos",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Junta Reguladora",
    items: [
      {
        name: "Junta Reguladora",
        path: "/junta-reguladora",
        isDropdown: true,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        subItems: [
          { name: "Cadastro de Paciente", tab: "CADASTRO" },
          { name: "Prontuário e Relatório", tab: "RELATORIO" },
          {
            name: "Serviços de Atendimento",
            tab: "SERVICOS",
            isNestedDropdown: true,
            nestedItems: [
              { name: "CAEE", subTab: "CAEE" },
              { name: "APAE", subTab: "APAE" },
              { name: "Ambulatório", subTab: "AMBULATORIO" },
              { name: "Educação", subTab: "EDUCACAO" },
              { name: "Social", subTab: "SOCIAL" },
              { name: "Centro de Especialidades", subTab: "ESPECIALIDADES" },
              { name: "Centro de Reabilitação", subTab: "REABILITACAO" },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Vigilância & Zoonoses",
    items: [
      {
        name: "CCZ - Zoonoses",
        path: "/ccz",
        isDropdown: true,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ),
        subItems: [
          { name: "Dashboard", tab: "DASHBOARD" },
          { name: "Cadastros", tab: "CADASTROS" },
          { name: "Usuários", tab: "USUARIOS" },
          { name: "Animais", tab: "ANIMAIS" },
          {
            name: "Zoonoses",
            tab: "ZOONOSES",
            isNestedDropdown: true,
            nestedItems: [
              { name: "Cadastrar Zoonose", subTab: "CADASTRO" },
              { name: "Exibir Zoonoses", subTab: "EXIBIR_ZOONOSES" },
            ],
          },
          {
            name: "Esporotricose",
            tab: "ESPOROTRICOSE",
            isNestedDropdown: true,
            nestedItems: [
              { name: "Cadastrar Esporotricose", subTab: "CADASTRO" },
              { name: "Exibir Esporotricose", subTab: "EXIBIR_ESPOROTRICOSE" },
            ],
          },
          { name: "Procedimentos", tab: "PROCEDIMENTOS" },
          { name: "Denúncias", tab: "DENUNCIAS" },
        ],
      },
    ],
  },
  {
    title: "Administração",
    items: [
      {
        name: "Gerenciar Usuários",
        path: "/admin/usuarios",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6" />
            <path d="M22 11h-6" />
          </svg>
        ),
      },
    ],
  },
];

function MenuContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "DASHBOARD";
  const currentSubTab = searchParams.get("subTab") || "";

  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState({});
  const [openNested, setOpenNested] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGroup = (path) => {
    setOpenGroup((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const toggleNested = (tabKey) => {
    setOpenNested((prev) => ({ ...prev, [tabKey]: !prev[tabKey] }));
  };

  const handleCloseMenu = () => {
    setIsOpen(false);
  };

  return (
    <div ref={menuRef}>
      {isOpen && (
        <div className={styles.startMenu}>
          <div className={styles.menuContentList}>
            {menuSections.map((section, sIdx) => {
              const filteredItems = section.items.filter((item) => {
                if (!searchTerm) return true;
                const matchMain = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchSub = item.subItems?.some(
                  (sub) =>
                    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.nestedItems?.some((nested) =>
                      nested.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                );
                return matchMain || matchSub;
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={sIdx} className={styles.sectionGroup}>
                  <span className={styles.sectionTitle}>{section.title}</span>
                  {filteredItems.map((item) => {
                    const isDropdownOpen = Boolean(openGroup[item.path]) || Boolean(searchTerm);

                    if (item.isDropdown) {
                      return (
                        <div key={item.path}>
                          <button
                            type="button"
                            className={styles.menuItemBtn}
                            onClick={() => toggleGroup(item.path)}
                          >
                            <span className={styles.itemIcon}>{item.icon}</span>
                            <span>{item.name}</span>
                            <svg
                              className={`${styles.arrowIcon} ${
                                isDropdownOpen ? styles.arrowOpen : ""
                              }`}
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>

                          {isDropdownOpen && (
                            <ul className={styles.subMenuList}>
                              {item.subItems.map((sub) => {
                                if (sub.isNestedDropdown) {
                                  const isNestedOpen =
                                    Boolean(openNested[sub.tab]) || Boolean(searchTerm);

                                  return (
                                    <li key={sub.tab}>
                                      <button
                                        type="button"
                                        className={styles.nestedBtn}
                                        onClick={() => toggleNested(sub.tab)}
                                      >
                                        <span>{sub.name}</span>
                                        <svg
                                          className={`${styles.arrowIcon} ${
                                            isNestedOpen ? styles.arrowOpen : ""
                                          }`}
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                      </button>

                                      {isNestedOpen && (
                                        <ul className={styles.nestedMenuList}>
                                          {sub.nestedItems.map((nested) => {
                                            const isNestedActive =
                                              pathname === item.path &&
                                              currentTab === sub.tab &&
                                              currentSubTab === nested.subTab;

                                            return (
                                              <li key={nested.subTab}>
                                                <Link
                                                  href={`${item.path}?tab=${sub.tab}&subTab=${nested.subTab}`}
                                                  onClick={handleCloseMenu}
                                                  className={`${styles.subMenuItemLink} ${
                                                    isNestedActive ? styles.activeSubLink : ""
                                                  }`}
                                                >
                                                  {nested.name}
                                                </Link>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      )}
                                    </li>
                                  );
                                }

                                const isSubActive =
                                  pathname === item.path && currentTab === sub.tab;

                                return (
                                  <li key={sub.tab}>
                                    <Link
                                      href={`${item.path}?tab=${sub.tab}`}
                                      onClick={handleCloseMenu}
                                      className={`${styles.subMenuItemLink} ${
                                        isSubActive ? styles.activeSubSubLink : ""
                                      }`}
                                    >
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    }

                    const isActive = pathname === item.path;

                    return (
                      <div key={item.path}>
                        <Link
                          href={item.path}
                          onClick={handleCloseMenu}
                          className={`${styles.menuItemBtn} ${isActive ? styles.activeSubLink : ""}`}
                        >
                          <span className={styles.itemIcon}>{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar no sistema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      )}

      {/* BARRA INFERIOR (TASKBAR) COM ÍCONE DE LOGO ATUALIZADO */}
      <div className={styles.taskbar}>
        <button
          type="button"
          className={`${styles.startButton} ${isOpen ? styles.startButtonActive : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={styles.logoIcon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span>Iniciar</span>
        </button>

        <div className={styles.activeAppBadge}>
          <span className={styles.dot}></span>
          RegulaHub System
        </div>
      </div>
    </div>
  );
}

export default function TaskbarMenu() {
  return (
    <Suspense fallback={null}>
      <MenuContent />
    </Suspense>
  );
}