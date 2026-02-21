package com.sge.controllers;

import com.sge.models.DadosAluno;
import com.sge.services.DadosAlunoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dados-aluno")
public class DadosAlunoController {

    private final DadosAlunoService dadosAlunoService;

    public DadosAlunoController(DadosAlunoService dadosAlunoService) {
        this.dadosAlunoService = dadosAlunoService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        String email = principal.getName();
        DadosAluno dados = dadosAlunoService.getOrCreateByEmail(email);
        return ResponseEntity.ok(toDto(dados));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, Object> payload, Principal principal) {
        String email = principal.getName();
        DadosAluno updated = dadosAlunoService.updateByEmail(email, payload);
        return ResponseEntity.ok(toDto(updated));
    }

    private Map<String, Object> toDto(DadosAluno d) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("nome", d.getNome() != null ? d.getNome() : "");
        dto.put("cpf", d.getCpf() != null ? d.getCpf() : "");
        dto.put("rg", d.getRg() != null ? d.getRg() : "");
        dto.put("rua", d.getRua() != null ? d.getRua() : "");
        dto.put("numero", d.getNumero() != null ? d.getNumero() : "");
        dto.put("bairro", d.getBairro() != null ? d.getBairro() : "");
        dto.put("cep", d.getCep() != null ? d.getCep() : "");
        dto.put("cidade", d.getCidade() != null ? d.getCidade() : "");
        dto.put("estado", d.getEstado() != null ? d.getEstado() : "");
        dto.put("telefone", d.getTelefone() != null ? d.getTelefone() : "");
        dto.put("matricula", d.getMatricula() != null ? d.getMatricula() : "");
        dto.put("cursoId", d.getCurso() != null ? d.getCurso().getId() : null);
        dto.put("cursoNome", d.getCurso() != null ? d.getCurso().getNome() : "");
        return dto;
    }
}


