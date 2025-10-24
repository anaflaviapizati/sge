package com.sge.controllers;

import com.sge.models.Documento;
import com.sge.services.DocumentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

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
            @RequestParam("arquivo") MultipartFile arquivo
    ) {
        try {
            Documento doc = documentoService.salvarDocumento(contratoId, arquivo);
            return ResponseEntity.ok(doc);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erro ao salvar arquivo: " + e.getMessage());
        }
    }

    // Listar documentos por contrato
    @GetMapping("/{contratoId}")
    public ResponseEntity<List<Documento>> listarDocumentos(@PathVariable Long contratoId) {
        List<Documento> docs = documentoService.listarPorContrato(contratoId);
        return ResponseEntity.ok(docs);
    }
}
