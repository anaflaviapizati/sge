import api from '../api/axios';
import { Mensagem } from '../types';

export const listarMensagens = async (contratoId: string | number): Promise<Mensagem[]> => {
  const res = await api.get<Mensagem[]>(`/contratos/${contratoId}/mensagens`);
  return res.data;
};

export const enviarMensagem = async (
  contratoId: string | number, 
  conteudo: string, 
  tipoEnvio?: string
): Promise<Mensagem> => {
  // O backend exige tipoEnvio obrigatório, então sempre enviamos (padrão: NORMAL)
  const body = { conteudo, tipoEnvio: tipoEnvio || 'NORMAL' };
  const res = await api.post<Mensagem>(`/contratos/${contratoId}/mensagens`, body);
  return res.data;
};

