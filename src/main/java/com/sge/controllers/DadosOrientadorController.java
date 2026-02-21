package com.sge.controllers;

import com.sge.models.DadosOrientador;
import com.sge.services.DadosOrientadorService;
import com.sge.repositories.CursoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dados-orientador")
public class DadosOrientadorController {

    private final DadosOrientadorService dadosOrientadorService;
    private final CursoRepository cursoRepository;

    public DadosOrientadorController(DadosOrientadorService dadosOrientadorService, CursoRepository cursoRepository) {
        this.dadosOrientadorService = dadosOrientadorService;
        this.cursoRepository = cursoRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        String email = principal.getName();
        DadosOrientador dados = dadosOrientadorService.getOrCreateByEmail(email);
        return ResponseEntity.ok(toDto(dados));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, Object> payload, Principal principal) {
        String email = principal.getName();
        DadosOrientador updated = dadosOrientadorService.updateByEmail(email, payload);
        return ResponseEntity.ok(toDto(updated));
    }

    private Map<String, Object> toDto(DadosOrientador d) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", d.getId());
        map.put("nome", d.getNome());
        map.put("cpf", d.getCpf());
        map.put("telefone", d.getTelefone());
        map.put("departamento", d.getDepartamento());
        map.put("especialidade", d.getEspecialidade());
        // Buscar curso onde este usuário é orientador
        if (d.getUsuario() != null) {
            cursoRepository.findAll().stream()
                .filter(c -> c.getOrientador() != null && 
                       c.getOrientador().getId().equals(d.getUsuario().getId()))
                .findFirst()
                .ifPresent(curso -> map.put("cursoId", curso.getId()));
        }
        map.put("criadoEm", d.getCriadoEm() != null ? d.getCriadoEm().toString() : "");
        map.put("atualizadoEm", d.getAtualizadoEm() != null ? d.getAtualizadoEm().toString() : "");
        return map;
    }
}

