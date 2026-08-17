"use client";

import { useState, useMemo } from "react";
import st from "./TabAnimaisCards.module.css";

function formatDate(d) {
  if (!d) return null;
  const str = d instanceof Date ? d.toISOString() : String(d);
  const parts = str.split("T")[0].split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : str;
}

// Emoji placeholder por espécie
function especieEmoji(especie) {
  const map = { "Cão": "🐕", "Gato": "🐈", "Bovino": "🐄", "Equino": "🐴", "Suíno": "🐷" };
  return map[especie] || "🐾";
}

// Classe do badge por espécie
function especieBadgeClass(especie) {
  const map = { "Cão": st.badgeCao, "Gato": st.badgeGato, "Bovino": st.badgeBovino, "Equino": st.badgeEquino };
  return map[especie] || st.badgeOutro;
}

// Iniciais do tutor para o avatar
function initials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function maskTel(v) {
  if (!v) return null;
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export default function TabAnimaisCards({ animais = [], tutores = [] }) {
  const [search, setSearch]   = useState("");
  const [espFilter, setEspFilter] = useState("");

  const especies = useMemo(() => {
    const set = new Set(animais.map((a) => a.especie).filter(Boolean));
    return [...set].sort();
  }, [animais]);

  const filtered = useMemo(() => {
    const low = search.toLowerCase().trim();
    return animais.filter((a) => {
      const tutor  = tutores.find((t) => t.id === a.tutorId);
      const byText = !low
        || (a.nome || "").toLowerCase().includes(low)
        || (a.especie || "").toLowerCase().includes(low)
        || (a.raca || "").toLowerCase().includes(low)
        || (tutor?.nomeCompleto || "").toLowerCase().includes(low)
        || (tutor?.bairro || "").toLowerCase().includes(low);
      const byEsp = !espFilter || a.especie === espFilter;
      return byText && byEsp;
    });
  }, [animais, tutores, search, espFilter]);

  return (
    <div className={st.container}>
      {/* ── Filtros ─────────────────────────────────────────────── */}
      <div className={st.filterBar}>
        <span className={st.filterLabel}>Buscar:</span>
        <input
          type="text"
          className={st.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome, espécie, raça ou tutor..."
        />

        <span className={st.filterLabel}>Espécie:</span>
        <select value={espFilter} onChange={(e) => setEspFilter(e.target.value)}>
          <option value="">Todas</option>
          {especies.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        {(search || espFilter) && (
          <button className={st.clearBtn} onClick={() => { setSearch(""); setEspFilter(""); }}>
            ✕ Limpar
          </button>
        )}

        <span className={st.count}>{filtered.length} {filtered.length === 1 ? "animal" : "animais"}</span>
      </div>

      {/* ── Grid de cards ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={st.empty}>
          <p>🐾</p>
          <p>{animais.length === 0 ? "Nenhum animal cadastrado ainda." : "Nenhum animal encontrado com os filtros aplicados."}</p>
        </div>
      ) : (
        <div className={st.grid}>
          {filtered.map((animal) => {
            const tutor = tutores.find((t) => t.id === animal.tutorId);

            return (
              <div key={animal.id} className={st.card}>
                {/* Foto ou placeholder */}
                <div className={st.photoWrap}>
                  {animal.fotoUrl ? (
                    <img src={animal.fotoUrl} alt={animal.nome || animal.especie} className={st.photo} />
                  ) : (
                    <span className={st.photoPlaceholder}>{especieEmoji(animal.especie)}</span>
                  )}
                </div>

                {/* Corpo */}
                <div className={st.body}>
                  <div className={st.cardHeader}>
                    <h3 className={st.animalName}>
                      {animal.nome || <span style={{ color: "#94a3b8", fontWeight: 500 }}>Sem nome</span>}
                    </h3>
                    <span className={`${st.especieBadge} ${especieBadgeClass(animal.especie)}`}>
                      {animal.especie}
                    </span>
                  </div>

                  <div className={st.infoList}>
                    {animal.raca && (
                      <div className={st.infoRow}>
                        <span className={st.infoLabel}>Raça</span>
                        <span>{animal.raca}</span>
                      </div>
                    )}
                    {animal.sexo && (
                      <div className={st.infoRow}>
                        <span className={st.infoLabel}>Sexo</span>
                        <span>{animal.sexo}</span>
                      </div>
                    )}
                    {animal.cor && (
                      <div className={st.infoRow}>
                        <span className={st.infoLabel}>Cor</span>
                        <span>{animal.cor}</span>
                      </div>
                    )}
                    {animal.dataNascimento && (
                      <div className={st.infoRow}>
                        <span className={st.infoLabel}>Nasc.</span>
                        <span>{formatDate(animal.dataNascimento)}</span>
                      </div>
                    )}
                    {animal.observacao && (
                      <div className={st.infoRow} style={{ alignItems: "flex-start" }}>
                        <span className={st.infoLabel}>Obs.</span>
                        <span style={{ color: "#64748b", fontSize: "0.8rem", lineHeight: 1.4 }}>
                          {animal.observacao.length > 60
                            ? animal.observacao.slice(0, 60) + "…"
                            : animal.observacao}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer com tutor */}
                <div className={st.cardFooter}>
                  <div className={st.tutorAvatar}>{initials(tutor?.nomeCompleto)}</div>
                  <div className={st.tutorInfo}>
                    <div className={st.tutorName}>{tutor?.nomeCompleto || "Tutor não vinculado"}</div>
                    <div className={st.tutorMeta}>
                      {tutor?.telefone ? maskTel(tutor.telefone) : tutor?.bairro || "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
