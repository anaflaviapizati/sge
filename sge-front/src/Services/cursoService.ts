import api from '../api/axios';
import { Curso } from '../types';

export interface CursoComOrientador {
  id: number;
  nome: string;
  orientador: { id: number; nome: string; email: string } | null;
}

export const listarCursos = async (): Promise<Curso[]> => {
  const res = await api.get<Curso[]>('/cursos');
  return res.data;
};

export const listarCursosComOrientadores = async (): Promise<CursoComOrientador[]> => {
  const res = await api.get<CursoComOrientador[]>('/cursos/com-orientadores');
  return res.data;
};

