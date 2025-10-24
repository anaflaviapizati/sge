package com.sge.services;

import com.sge.models.Contrato;
import com.sge.models.Documento;
import com.sge.repositories.ContratoRepository;
import com.sge.repositories.DocumentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final ContratoRepository contratoRepository;

    private final Path uploadDir = Paths.get("uploads/documentos");

    public DocumentoService(DocumentoRepository documentoRepository, ContratoRepository contratoRepository) throws IOException {
        this.documentoRepository = documentoRepository;
        this.contratoRepository = contratoRepository;
        Files.createDirectories(uploadDir); // Cria pasta se não existir
    }

    public Documento salvarDocumento(Long contratoId, MultipartFile arquivo) throws IOException {
        Contrato contrato = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new RuntimeException("Contrato não encontrado"));

        String nomeArquivo = System.currentTimeMillis() + "_" + arquivo.getOriginalFilename();
        Path caminho = uploadDir.resolve(nomeArquivo);
        Files.copy(arquivo.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);

        Documento doc = new Documento(contrato, arquivo.getOriginalFilename(), caminho.toString());
        return documentoRepository.save(doc);
    }

    public List<Documento> listarPorContrato(Long contratoId) {
        return documentoRepository.findByContratoId(contratoId);
    }
}
