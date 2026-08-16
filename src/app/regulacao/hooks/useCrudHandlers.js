import {
  createPessoa,
  updatePessoa,
  deletePessoa,
  createMedico,
  updateMedico,
  deleteMedico,
  createUbs,
  updateUbs,
  deleteUbs,
  createProcedimento,
  updateProcedimento,
} from "../actions";

export function useCrudHandlers(reloadData) {
  const handleSavePessoa = async (e, formPessoa, resetForm) => {
    e.preventDefault();
    if (!formPessoa.cpf || !formPessoa.nomeCompleto || !formPessoa.dataNascimento || !formPessoa.nomeMae) {
      return alert("Preencha os campos obrigatórios.");
    }
    const res = await createPessoa(formPessoa);
    if (res.success) {
      alert("Paciente cadastrado com sucesso!");
      resetForm();
      reloadData();
    } else alert("Erro ao salvar paciente: " + res.error);
  };

  const handleSaveMedico = async (e, formMedico, resetForm) => {
    e.preventDefault();
    if (!formMedico.nome || !formMedico.crm) return alert("Preencha o Nome e o CRM.");
    const res = await createMedico(formMedico);
    if (res.success) {
      alert("Médico cadastrado com sucesso!");
      resetForm();
      reloadData();
    } else alert("Erro ao salvar médico: " + res.error);
  };

  const handleSaveUbs = async (e, formUbs, resetForm) => {
    e.preventDefault();
    if (!formUbs.nome || !formUbs.cnes) return alert("Preencha o Nome e o CNES.");
    const res = await createUbs(formUbs);
    if (res.success) {
      alert("UBS cadastrada com sucesso!");
      resetForm();
      reloadData();
    } else alert("Erro ao salvar UBS: " + res.error);
  };

  const handleSaveProcedimento = async (e, formProcedimento, resetForm) => {
    e.preventDefault();
    if (!formProcedimento.nome || !formProcedimento.valor || !formProcedimento.tipoExameId) {
      return alert("Preencha todos os campos do procedimento.");
    }
    const res = await createProcedimento(formProcedimento);
    if (res.success) {
      alert("Procedimento cadastrado com sucesso!");
      resetForm();
      reloadData();
    } else alert("Erro ao cadastrar procedimento: " + res.error);
  };

  return {
    handleSavePessoa,
    handleSaveMedico,
    handleSaveUbs,
    handleSaveProcedimento,
  };
}