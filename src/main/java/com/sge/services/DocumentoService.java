package com.sge.services;

import com.sge.models.Contrato;
import com.sge.models.Documento;
import com.sge.models.Usuario;
import com.sge.repositories.ContratoRepository;
import com.sge.repositories.DocumentoRepository;
import com.sge.repositories.UsuarioRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final ContratoRepository contratoRepository;
    private final UsuarioRepository usuarioRepository;

    private final Path uploadDir = Paths.get("uploads/documentos");

    public DocumentoService(DocumentoRepository documentoRepository, ContratoRepository contratoRepository, UsuarioRepository usuarioRepository) throws IOException {
        this.documentoRepository = documentoRepository;
        this.contratoRepository = contratoRepository;
        this.usuarioRepository = usuarioRepository;
        Files.createDirectories(uploadDir); // Cria pasta se não existir
    }

    public Documento salvarDocumento(Long contratoId, MultipartFile arquivo, String emailUsuario) throws IOException {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo não pode ser nulo ou vazio");
        }

        Contrato contrato = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new RuntimeException("Contrato não encontrado com ID: " + contratoId));

        Usuario criadoPor = usuarioRepository.findByEmail(emailUsuario)
                .orElse(null);

        String nomeOriginal = arquivo.getOriginalFilename();
        if (nomeOriginal == null || nomeOriginal.trim().isEmpty()) {
            nomeOriginal = "documento_" + System.currentTimeMillis();
        }

        String nomeArquivo = System.currentTimeMillis() + "_" + nomeOriginal.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path caminho = uploadDir.resolve(nomeArquivo);
        
        // Garantir que o diretório existe
        Files.createDirectories(uploadDir);
        
        Files.copy(arquivo.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);

        Documento doc = new Documento(contrato, nomeOriginal, caminho.toString());
        doc.setCriadoPor(criadoPor);
        Documento docSalvo = documentoRepository.save(doc);
        
        System.out.println("Documento salvo com sucesso: ID=" + docSalvo.getId() + ", Nome=" + nomeOriginal + ", Contrato=" + contratoId);
        
        return docSalvo;
    }

    public List<Documento> listarPorContrato(Long contratoId) {
        try {
            System.out.println("=== DocumentoService.listarPorContrato chamado com contratoId: " + contratoId + " ===");
            
            // Primeiro, verificar se o contrato existe
            boolean contratoExiste = contratoRepository.findById(contratoId).isPresent();
            System.out.println("Contrato existe: " + contratoExiste);
            
            // Tentar buscar usando a query JPQL
            List<Documento> documentos = documentoRepository.findByContratoId(contratoId);
            System.out.println("Documentos encontrados usando findByContratoId (JPQL): " + documentos.size());
            
            // Se não encontrou, tentar a query SQL nativa
            if (documentos.isEmpty()) {
                System.out.println("Tentando query SQL nativa...");
                documentos = documentoRepository.findByContratoIdNative(contratoId);
                System.out.println("Documentos encontrados usando findByContratoIdNative (SQL): " + documentos.size());
            }
            
            // Se ainda não encontrou, tentar o método alternativo
            if (documentos.isEmpty()) {
                System.out.println("Tentando método alternativo findByContrato_Id...");
                documentos = documentoRepository.findByContrato_Id(contratoId);
                System.out.println("Documentos encontrados usando findByContrato_Id: " + documentos.size());
            }
            
            // Debug: verificar todos os documentos no banco
            List<Documento> todosDocumentos = documentoRepository.findAll();
            System.out.println("Total de documentos no banco: " + todosDocumentos.size());
            todosDocumentos.forEach(doc -> {
                if (doc.getContrato() != null && doc.getContrato().getId() != null) {
                    System.out.println("  Documento ID: " + doc.getId() + " pertence ao contrato ID: " + doc.getContrato().getId());
                }
            });
            
            System.out.println("Retornando " + documentos.size() + " documentos");
            return documentos;
        } catch (Exception e) {
            System.err.println("ERRO ao buscar documentos do contrato " + contratoId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao listar documentos: " + e.getMessage(), e);
        }
    }

    public Optional<Documento> findById(Long id) {
        return documentoRepository.findById(id);
    }

    public Resource obterArquivo(Long documentoId) throws IOException {
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new RuntimeException("Documento não encontrado"));

        Path caminhoArquivo = Paths.get(documento.getCaminhoArquivo());
        
        if (!Files.exists(caminhoArquivo)) {
            throw new IOException("Arquivo não encontrado no sistema de arquivos");
        }

        return new FileSystemResource(caminhoArquivo.toFile());
    }

    public void excluirDocumento(Long documentoId) throws IOException {
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new RuntimeException("Documento não encontrado"));

        Path caminhoArquivo = Paths.get(documento.getCaminhoArquivo());
        
        // Remove o arquivo do sistema de arquivos
        if (Files.exists(caminhoArquivo)) {
            Files.delete(caminhoArquivo);
        }

        // Remove o registro do banco de dados
        documentoRepository.delete(documento);
    }
}
