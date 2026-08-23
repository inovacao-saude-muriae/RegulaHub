"use client";

import { useState, useMemo } from "react";

// Subir um nível para encontrar o shared.module.css na raiz do CCZ
import s from "../shared.module.css";
// Mudar de ./ para importar o CSS local da View Usuarios
import ts from "./Usuarios.module.css";

function maskCpf(v) {
  if (!v) return "";
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskTel(v) {
  if (!v) return "";
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  return d
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function onlyDigits(v) {
  return v ? v.replace(/\D/g, "") : "";
}

export default function Usuarios({
  tutores = [],
  animais = [],
  reloadData,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // Filtra a lista de tutores pelo campo de busca
  const filtered = useMemo(() => {
    const low = search.toLowerCase().trim();
    const digits = onlyDigits(search);
    if (!low) return tutores;
    return tutores.filter((t) => {
      const nomeLow = (t.nomeCompleto || "").toLowerCase();
      const cpfDig = onlyDigits(t.cpf || "");
      return nomeLow.includes(low) || (digits && cpfDig.includes(digits));
    });
  }, [tutores, search]);

  const animaisDeTutor = (cpf) => animais.filter((a) => a.tutorCpf === cpf);

  return (
    <div className={s.card}>
      {/* ── Busca ───────────────────────────────────────────────── */}
      <div className={ts.searchSection}>
        <div className={ts.searchRow}>
          <div className={ts.searchInputWrap}>
            <svg
              className={ts.searchIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={ts.searchInput}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected(null);
              }}
              placeholder="Buscar por nome ou CPF..."
            />
            {search && (
              <button
                className={ts.clearBtn}
                onClick={() => {
                  setSearch("");
                  setSelected(null);
                }}
              >
                ✕
              </button>
            )}
          </div>
          <span className={ts.countBadge}>
            {filtered.length}{" "}
            {filtered.length === 1 ? "responsável" : "responsáveis"}
          </span>
        </div>
      </div>

      {/* ── Painel dividido: lista + detalhe ────────────────────── */}
      <div className={ts.splitLayout}>
        {/* Lista */}
        <div className={ts.listPane}>
          {filtered.length === 0 ? (
            <div className={ts.emptyList}>
              {tutores.length === 0
                ? "Nenhum responsável vinculado ao CCZ."
                : "Nenhum resultado para esta busca."}
            </div>
          ) : (
            filtered.map((t) => {
              const qtd = animaisDeTutor(t.cpf).length;
              return (
                <button
                  key={t.cpf}
                  type="button"
                  className={`${ts.listItem} ${selected?.cpf === t.cpf ? ts.listItemActive : ""}`}
                  onClick={() => setSelected(t)}
                >
                  <div className={ts.listAvatar}>
                    {t.nomeCompleto.charAt(0).toUpperCase()}
                  </div>
                  <div className={ts.listMeta}>
                    <span className={ts.listName}>{t.nomeCompleto}</span>
                    <span className={ts.listSub}>
                      {maskCpf(t.cpf)}
                      {t.bairro ? ` • ${t.bairro}` : ""}
                    </span>
                  </div>
                  <span className={ts.animalCount}>{qtd} 🐾</span>
                </button>
              );
            })
          )}
        </div>

        {/* Detalhe */}
        <div className={ts.detailPane}>
          {!selected ? (
            <div className={ts.detailEmpty}>
              <span>👤</span>
              <p>Selecione um responsável para ver os detalhes</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho do detalhe */}
              <div className={ts.detailHeader}>
                <div className={ts.detailAvatar}>
                  {selected.nomeCompleto.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={ts.detailName}>{selected.nomeCompleto}</h3>
                  <span className={ts.detailCpf}>
                    CPF: {maskCpf(selected.cpf)}
                  </span>
                </div>
              </div>

              {/* Dados do responsável */}
              <div className={ts.detailSection}>
                <p className={ts.detailSectionTitle}>Contato</p>
                <div className={ts.detailGrid}>
                  <div className={ts.detailField}>
                    <span className={ts.detailLabel}>Telefone</span>
                    <span className={ts.detailValue}>
                      {selected.telefone ? maskTel(selected.telefone) : "—"}
                    </span>
                  </div>
                  {selected.telefoneSecundario && (
                    <div className={ts.detailField}>
                      <span className={ts.detailLabel}>Tel. Secundário</span>
                      <span className={ts.detailValue}>
                        {maskTel(selected.telefoneSecundario)}
                      </span>
                    </div>
                  )}
                  {selected.email && (
                    <div className={ts.detailField}>
                      <span className={ts.detailLabel}>E-mail</span>
                      <span className={ts.detailValue}>
                        {selected.email || "—"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={ts.detailSection}>
                <p className={ts.detailSectionTitle}>Endereço</p>
                <div className={ts.detailGrid}>
                  <div className={ts.detailField}>
                    <span className={ts.detailLabel}>Logradouro</span>
                    <span className={ts.detailValue}>
                      {[selected.logradouro, selected.numero]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </span>
                  </div>
                  <div className={ts.detailField}>
                    <span className={ts.detailLabel}>Bairro</span>
                    <span className={ts.detailValue}>
                      {selected.bairro || "—"}
                    </span>
                  </div>
                  <div className={ts.detailField}>
                    <span className={ts.detailLabel}>Cidade / UF</span>
                    <span className={ts.detailValue}>
                      {[selected.cidade, selected.uf]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </span>
                  </div>
                  {selected.pontoReferencia && (
                    <div className={`${ts.detailField} ${ts.detailFieldFull}`}>
                      <span className={ts.detailLabel}>
                        Ponto de Referência
                      </span>
                      <span className={ts.detailValue}>
                        {selected.pontoReferencia}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {(selected.rg || selected.sexo || selected.profissao) && (
                <div className={ts.detailSection}>
                  <p className={ts.detailSectionTitle}>Dados Complementares</p>
                  <div className={ts.detailGrid}>
                    {selected.rg && (
                      <div className={ts.detailField}>
                        <span className={ts.detailLabel}>RG</span>
                        <span className={ts.detailValue}>{selected.rg}</span>
                      </div>
                    )}
                    {selected.sexo && (
                      <div className={ts.detailField}>
                        <span className={ts.detailLabel}>Sexo</span>
                        <span className={ts.detailValue}>{selected.sexo}</span>
                      </div>
                    )}
                    {selected.profissao && (
                      <div className={ts.detailField}>
                        <span className={ts.detailLabel}>Profissão</span>
                        <span className={ts.detailValue}>
                          {selected.profissao}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selected.observacoes && (
                <div className={ts.detailSection}>
                  <p className={ts.detailSectionTitle}>Observações CCZ</p>
                  <p className={ts.detailObs}>{selected.observacoes}</p>
                </div>
              )}

              {/* Animais do responsável */}
              <div className={ts.detailSection}>
                <p className={ts.detailSectionTitle}>
                  Animais Cadastrados ({animaisDeTutor(selected.cpf).length})
                </p>
                {animaisDeTutor(selected.cpf).length === 0 ? (
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    Nenhum animal vinculado.
                  </p>
                ) : (
                  <div className={ts.animalList}>
                    {animaisDeTutor(selected.cpf).map((a) => (
                      <div key={a.id} className={ts.animalChip}>
                        <span className={ts.animalEmoji}>
                          {{ Cão: "🐕", Gato: "🐈" }[a.especie] || "🐾"}
                        </span>
                        <div>
                          <span className={ts.animalChipName}>
                            {a.nome || "Sem nome"}
                          </span>
                          <span className={ts.animalChipMeta}>
                            {a.especie}
                            {a.raca ? ` / ${a.raca}` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}