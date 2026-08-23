"use client";

import { useState, useMemo } from "react";
import st from "./AnimaisCards.module.css";

function especieEmoji(especie) {
  const map = {
    Cão: "🐕",
    Gato: "🐈",
  };
  return map[especie] || "🐾";
}

// Classe do badge por espécie
function especieBadgeClass(especie) {
  const map = {
    Cão: st.badgeCao,
    Gato: st.badgeGato,
    Bovino: st.badgeBovino,
    Equino: st.badgeEquino,
  };
  return map[especie] || st.badgeOutro;
}

export default function TabAnimaisCards({ animais = [] }) {
  const [search, setSearch] = useState("");
  const [espFilter, setEspFilter] = useState("");

  const especies = useMemo(() => {
    const set = new Set(animais.map((a) => a.especie).filter(Boolean));
    return [...set].sort();
  }, [animais]);

  const filtered = useMemo(() => {
    const low = search.toLowerCase().trim();
    return animais.filter((a) => {
      const byText =
        !low ||
        (a.nome || "").toLowerCase().includes(low) ||
        (a.especie || "").toLowerCase().includes(low);
      const byEsp = !espFilter || a.especie === espFilter;
      return byText && byEsp;
    });
  }, [animais, search, espFilter]);

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
          placeholder="Nome ou espécie..."
        />

        <span className={st.filterLabel}>Espécie:</span>
        <select
          value={espFilter}
          onChange={(e) => setEspFilter(e.target.value)}
        >
          <option value="">Todas</option>
          {especies.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        {(search || espFilter) && (
          <button
            className={st.clearBtn}
            onClick={() => {
              setSearch("");
              setEspFilter("");
            }}
          >
            ✕ Limpar
          </button>
        )}

        <span className={st.count}>
          {filtered.length} {filtered.length === 1 ? "animal" : "animais"}
        </span>
      </div>

      {/* ── Grid de cards ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={st.empty}>
          <p>🐾</p>
          <p>
            {animais.length === 0
              ? "Nenhum animal cadastrado ainda."
              : "Nenhum animal encontrado com os filtros aplicados."}
          </p>
        </div>
      ) : (
        <div className={st.grid}>
          {filtered.map((animal) => {
            return (
              <div key={animal.id} className={st.card}>
                {/* Foto ou placeholder */}
                <div className={st.photoWrap}>
                  {animal.fotoUrl ? (
                    <img
                      src={animal.fotoUrl}
                      alt={animal.nome || animal.especie}
                      className={st.photo}
                    />
                  ) : (
                    <span className={st.photoPlaceholder}>
                      {especieEmoji(animal.especie)}
                    </span>
                  )}
                </div>

                {/* Corpo */}
                <div className={st.body}>
                  <div className={st.cardHeader}>
                    <h3 className={st.animalName}>
                      {animal.nome || (
                        <span style={{ color: "#94a3b8", fontWeight: 500 }}>
                          Sem nome
                        </span>
                      )}
                    </h3>
                    <span
                      className={`${st.especieBadge} ${especieBadgeClass(animal.especie)}`}
                    >
                      {animal.especie}
                    </span>
                  </div>

                  <div className={st.infoList}>
                    {animal.sexo && (
                      <div className={st.infoRow}>
                        <span className={st.infoLabel}>Sexo</span>
                        <span>
                          {{ M: "Macho", F: "Fêmea", I: "Não identificado" }[
                            animal.sexo
                          ] || animal.sexo}
                        </span>
                      </div>
                    )}
                    {animal.porte && (
                      <div className={st.infoRow}>
                        <span className={st.infoLabel}>Porte</span>
                        <span>{animal.porte}</span>
                      </div>
                    )}
                    {animal.idade && (
                      <div className={st.infoRow}>
                        <span className={st.infoLabel}>Idade</span>
                        <span>{animal.idade}</span>
                      </div>
                    )}
                    <div className={st.healthRow}>
                      <span
                        className={
                          animal.castrado === "Sim"
                            ? st.healthGood
                            : st.healthNeutral
                        }
                      >
                        {animal.castrado === "Sim"
                          ? "Castrado"
                          : "Não castrado"}
                      </span>
                      {animal.em_tratamento === "Sim" && (
                        <span className={st.healthWarning}>Em tratamento</span>
                      )}
                      {animal.doenca_cronica === "Sim" && (
                        <span className={st.healthWarning}>Doença crônica</span>
                      )}
                    </div>
                    {animal.endereco_recolhimento && (
                      <div className={st.locationRow}>
                        Local: {animal.endereco_recolhimento}
                      </div>
                    )}
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
