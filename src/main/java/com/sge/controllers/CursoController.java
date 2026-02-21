package com.sge.controllers;

import com.sge.models.Curso;
import com.sge.models.Usuario;
import com.sge.services.CursoService;
import com.sge.repositories.UsuarioRepository;
import com.sge.repositories.DadosAlunoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    private final CursoService cursoService;
    private final UsuarioRepository usuarioRepository;
    private final DadosAlunoRepository dadosAlunoRepository;

    public CursoController(CursoService cursoService, 
                          UsuarioRepository usuarioRepository, DadosAlunoRepository dadosAlunoRepository) {
        this.cursoService = cursoService;
        this.usuarioRepository = usuarioRepository;
        this.dadosAlunoRepository = dadosAlunoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Curso>> getAllCursos() {
        List<Curso> cursos = cursoService.findAll();
        return ResponseEntity.ok(cursos);
    }

    /** Retorna cursos com orientador (id, nome, email) para uso na página de Ajuda. */
    @GetMapping("/com-orientadores")
    public ResponseEntity<List<Map<String, Object>>> getCursosComOrientadores() {
        List<Map<String, Object>> dtos = cursoService.findAll().stream()
                .map(c -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", c.getId());
                    dto.put("nome", c.getNome());
                    if (c.getOrientador() != null) {
                        Map<String, Object> ori = new HashMap<>();
                        ori.put("id", c.getOrientador().getId());
                        ori.put("nome", c.getOrientador().getNome());
                        ori.put("email", c.getOrientador().getEmail());
                        dto.put("orientador", ori);
                    } else {
                        dto.put("orientador", null);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/orientadores")
    public ResponseEntity<List<Map<String, Object>>> getOrientadoresPorCurso(Principal principal) {
        String email = principal.getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        
        // Busca o curso do aluno logado
        var dadosAluno = dadosAlunoRepository.findByUsuario(usuario);
        if (dadosAluno.isEmpty() || dadosAluno.get().getCurso() == null) {
            return ResponseEntity.ok(List.of());
        }
        
        String cursoNome = dadosAluno.get().getCurso().getNome();
        
        // Busca todos os cursos que têm o mesmo nome e retorna orientadores únicos
        List<Map<String, Object>> orientadores = cursoService.findAll().stream()
                .filter(c -> c.getNome().equals(cursoNome) && c.getOrientador() != null)
                .map(c -> {
                    Map<String, Object> orientador = new HashMap<>();
                    orientador.put("id", c.getOrientador().getId());
                    orientador.put("nome", c.getOrientador().getNome());
                    orientador.put("email", c.getOrientador().getEmail());
                    return orientador;
                })
                .collect(Collectors.toMap(
                    o -> (Long) o.get("id"), // Usa ID como chave para remover duplicatas
                    o -> o,
                    (existing, replacement) -> existing // Mantém o primeiro em caso de duplicata
                ))
                .values()
                .stream()
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(orientadores);
    }
}
