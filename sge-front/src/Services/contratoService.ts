import api from '../api/axios';
import { Contrato, ContratoDetalhe } from '../types';

export const listarContratos = async (): Promise<Contrato[]> => {
  const res = await api.get<Contrato[]>('/contratos');
  return res.data;
};

export const obterContrato = async (id: string | number): Promise<ContratoDetalhe> => {
  const res = await api.get<ContratoDetalhe>(`/contratos/${id}`);
  return res.data;
};

export const criarContrato = async (formData: FormData): Promise<ContratoDetalhe> => {
  // Não definir Content-Type explicitamente - o axios interceptor já faz isso corretamente para FormData
  // O navegador precisa definir o boundary automaticamente
  console.log('Enviando contrato...');
  
  // Log do conteúdo do FormData para debug
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`FormData[${key}] = File: ${value.name}, size: ${value.size}`);
    } else {
      console.log(`FormData[${key}] = ${value}`);
    }
  }
  
  try {
    const res = await api.post<ContratoDetalhe>('/contratos', formData);
    console.log('Contrato criado com sucesso:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Erro ao criar contrato:', error);
    console.error('Resposta do erro:', error?.response?.data);
    console.error('Status do erro:', error?.response?.status);
    throw error;
  }
};

export const listarContratosOrientador = async (): Promise<Contrato[]> => {
  const res = await api.get<Contrato[]>('/contratos/orientador');
  return res.data;
};

