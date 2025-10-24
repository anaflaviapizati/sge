import api from '../api/axios';

// Upload de documento
export const uploadDocumento = async (contratoId, arquivo) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const response = await api.post(`/documentos/upload/${contratoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// Listar documentos de um contrato
export const listarDocumentos = async (contratoId) => {
    const response = await api.get(`/documentos/${contratoId}`);
    return response.data;
};
