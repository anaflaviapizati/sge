// Tipos baseados nos modelos Java

export enum Perfil {
  ALUNO = 'ALUNO',
  ORIENTADOR = 'ORIENTADOR'
}

export enum StatusContrato {
  PENDENTE = 'PENDENTE',
  EM_ANALISE = 'EM_ANALISE',
  CORRECAO_SOLICITADA = 'CORRECAO_SOLICITADA',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  FINALIZADO = 'FINALIZADO'
}

export interface Usuario {
  id?: number;
  email: string;
  nome: string;
  perfil: Perfil;
}

export interface DadosAluno {
  id?: number;
  usuario?: Usuario;
  curso?: Curso;
  nome: string;
  cpf?: string;
  rg?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  matricula?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface DadosOrientador {
  id?: number;
  usuario?: Usuario;
  nome: string;
  cpf?: string;
  rg?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  departamento?: string;
  especialidade?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Curso {
  id?: number;
  nome: string;
  codigo?: string;
  descricao?: string;
}

export interface Contrato {
  id?: number;
  empresa: string;
  setor?: string;
  cargo?: string;
  descricao?: string;
  dataInicio: string;
  dataFim?: string;
  status: StatusContrato | string;
  orientador?: string;
  orientadorNome?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ContratoDetalhe extends Contrato {
  aluno?: DadosAluno;
}

export interface Documento {
  id?: number;
  nome: string;
  caminhoArquivo?: string;
  criadoEm?: string;
  criadoPorId?: number;
}

export interface Mensagem {
  id?: number;
  conteudo?: string;
  texto?: string;
  tipo?: string;
  criadoEm?: string;
  autor?: string;
  autorEmail?: string;
  autorId?: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

