package com.sge.controllers;

import com.sge.models.DadosAluno;
import com.sge.models.DadosOrientador;
import com.sge.models.Perfil;
import com.sge.models.Usuario;
import com.sge.repositories.CursoRepository;
import com.sge.repositories.DadosAlunoRepository;
import com.sge.repositories.DadosOrientadorRepository;
import com.sge.repositories.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final UsuarioRepository usuarioRepository;
    private final DadosAlunoRepository dadosAlunoRepository;
    private final DadosOrientadorRepository dadosOrientadorRepository;
    private final CursoRepository cursoRepository;

    public PerfilController(
            UsuarioRepository usuarioRepository,
            DadosAlunoRepository dadosAlunoRepository,
            DadosOrientadorRepository dadosOrientadorRepository,
            CursoRepository cursoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.dadosAlunoRepository = dadosAlunoRepository;
        this.dadosOrientadorRepository = dadosOrientadorRepository;
        this.cursoRepository = cursoRepository;
    }

    @GetMapping("/completo")
    public ResponseEntity<Map<String, Object>> verificarPerfilCompleto(Principal principal) {
        String email = principal.getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        boolean completo = false;
        
        if (usuario.getPerfil() == Perfil.ALUNO) {
            DadosAluno dados = dadosAlunoRepository.findByUsuario(usuario).orElse(null);
            if (dados != null) {
                completo = isDadosAlunoCompleto(dados);
            }
        } else if (usuario.getPerfil() == Perfil.ORIENTADOR) {
            DadosOrientador dados = dadosOrientadorRepository.findByUsuario(usuario).orElse(null);
            if (dados != null) {
                completo = isDadosOrientadorCompleto(dados);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("completo", completo);
        response.put("perfil", usuario.getPerfil().name());
        
        return ResponseEntity.ok(response);
    }

    private boolean isDadosAlunoCompleto(DadosAluno dados) {
        return dados.getNome() != null && !dados.getNome().trim().isEmpty() &&
               dados.getCpf() != null && !dados.getCpf().trim().isEmpty() &&
               dados.getRua() != null && !dados.getRua().trim().isEmpty() &&
               dados.getNumero() != null && !dados.getNumero().trim().isEmpty() &&
               dados.getBairro() != null && !dados.getBairro().trim().isEmpty() &&
               dados.getCep() != null && !dados.getCep().trim().isEmpty() &&
               dados.getCidade() != null && !dados.getCidade().trim().isEmpty() &&
               dados.getEstado() != null && !dados.getEstado().trim().isEmpty() &&
               dados.getTelefone() != null && !dados.getTelefone().trim().isEmpty();
    }

    private boolean isDadosOrientadorCompleto(DadosOrientador dados) {
        boolean dadosBasicos = dados.getNome() != null && !dados.getNome().trim().isEmpty() &&
               dados.getCpf() != null && !dados.getCpf().trim().isEmpty() &&
               dados.getTelefone() != null && !dados.getTelefone().trim().isEmpty() &&
               dados.getDepartamento() != null && !dados.getDepartamento().trim().isEmpty() &&
               dados.getEspecialidade() != null && !dados.getEspecialidade().trim().isEmpty();
        
        // Verificar se o orientador está associado a um curso
        boolean temCurso = false;
        if (dados.getUsuario() != null) {
            temCurso = cursoRepository.findAll().stream()
                .anyMatch(c -> c.getOrientador() != null && 
                          c.getOrientador().getId().equals(dados.getUsuario().getId()));
        }
        
        return dadosBasicos && temCurso;
    }
}

