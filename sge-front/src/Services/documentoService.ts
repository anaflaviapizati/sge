import api from '../api/axios';
import { Documento } from '../types';
import { AxiosResponse } from 'axios';

// Upload de documento
export const uploadDocumento = async (contratoId: string | number, arquivo: File): Promise<Documento> => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const response = await api.post<Documento>(`/documentos/upload/${contratoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// Listar documentos de um contrato
export const listarDocumentos = async (contratoId: string | number): Promise<Documento[]> => {
    try {
        console.log('=== Frontend: Buscando documentos para contrato ID:', contratoId);
        const response = await api.get<Documento[]>(`/documentos/contrato/${contratoId}`);
        console.log('=== Frontend: Resposta recebida:', response.data);
        console.log('=== Frontend: Tipo da resposta:', Array.isArray(response.data) ? 'Array' : typeof response.data);
        console.log('=== Frontend: Número de documentos:', Array.isArray(response.data) ? response.data.length : 'N/A');
        
        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn('Resposta não é um array:', response.data);
            return [];
        }
    } catch (error: any) {
        console.error('Erro ao listar documentos:', error);
        console.error('Resposta de erro:', error.response?.data);
        throw error;
    }
};

// Download de documento
export const downloadDocumento = async (documentoId: number): Promise<void> => {
    const response: AxiosResponse<Blob> = await api.get(`/documentos/download/${documentoId}`, {
        responseType: 'blob',
    });
    
    // Extrair nome do arquivo do header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'documento';
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
            filename = filenameMatch[1];
        }
    }
    
    // Criar link temporário para download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// Excluir documento
export const excluirDocumento = async (documentoId: number): Promise<void> => {
    await api.delete(`/documentos/${documentoId}`);
};

