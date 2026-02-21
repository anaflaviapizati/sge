package com.sge.controllers;

import com.sge.models.Documento;
import com.sge.services.DocumentoService;
import java.security.Principal;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    // Upload de documento
    @PostMapping("/upload/{contratoId}")
    public ResponseEntity<?> uploadDocumento(
            @PathVariable Long contratoId,
            @RequestParam("arquivo") MultipartFile arquivo,
            Principal principal
    ) {
        try {
            Documento doc = documentoService.salvarDocumento(contratoId, arquivo, principal.getName());
            return ResponseEntity.ok(doc);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erro ao salvar arquivo: " + e.getMessage());
        }
    }

    // Listar documentos por contrato
    @GetMapping("/contrato/{contratoId}")
    public ResponseEntity<?> listarDocumentos(@PathVariable Long contratoId) {
        try {
            System.out.println("=== Buscando documentos para contrato ID: " + contratoId + " ===");
            List<Documento> docs = documentoService.listarPorContrato(contratoId);
            System.out.println("Documentos encontrados: " + docs.size());
            if (docs.size() > 0) {
                docs.forEach(doc -> {
                    System.out.println("  - Documento ID: " + doc.getId() + ", Nome: " + doc.getNome());
                });
            }
            // Converter para DTOs para evitar problemas de serialização JSON
            List<Map<String, Object>> dtos = docs.stream().map(doc -> {
                Map<String, Object> dto = new java.util.HashMap<>();
                dto.put("id", doc.getId());
                dto.put("nome", doc.getNome());
                dto.put("caminhoArquivo", doc.getCaminhoArquivo());
                dto.put("criadoEm", doc.getCriadoEm() != null ? doc.getCriadoEm().toString() : null);
                dto.put("criadoPorId", doc.getCriadoPor() != null ? doc.getCriadoPor().getId() : null);
                return dto;
            }).toList();
            System.out.println("DTOs criados: " + dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("ERRO ao listar documentos do contrato " + contratoId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("erro", "Erro ao buscar documentos: " + e.getMessage()));
        }
    }

    // Download de documento
    @GetMapping("/download/{documentoId}")
    public ResponseEntity<Resource> downloadDocumento(@PathVariable Long documentoId) {
        try {
            Resource resource = documentoService.obterArquivo(documentoId);
            Documento documento = documentoService.findById(documentoId)
                    .orElseThrow(() -> new RuntimeException("Documento não encontrado"));

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + documento.getNome() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Excluir documento
    @DeleteMapping("/{documentoId}")
    public ResponseEntity<?> excluirDocumento(@PathVariable Long documentoId) {
        try {
            documentoService.excluirDocumento(documentoId);
            return ResponseEntity.ok().body("Documento excluído com sucesso");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erro ao excluir documento: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }
}
