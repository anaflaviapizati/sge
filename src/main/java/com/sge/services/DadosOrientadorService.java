package com.sge.services;

import com.sge.models.Curso;
import com.sge.models.DadosOrientador;
import com.sge.models.Usuario;
import com.sge.repositories.CursoRepository;
import com.sge.repositories.DadosOrientadorRepository;
import com.sge.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DadosOrientadorService {
    private final DadosOrientadorRepository dadosOrientadorRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    public DadosOrientadorService(
            DadosOrientadorRepository dadosOrientadorRepository,
            UsuarioRepository usuarioRepository,
            CursoRepository cursoRepository
    ) {
        this.dadosOrientadorRepository = dadosOrientadorRepository;
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
    }

    public DadosOrientador getOrCreateByEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        return dadosOrientadorRepository.findByUsuario(usuario)
                .orElseGet(() -> {
                    DadosOrientador dados = new DadosOrientador(usuario);
                    dados.setNome(usuario.getNome()); // Preenche nome do usuário
                    return dadosOrientadorRepository.save(dados);
                });
    }

    public DadosOrientador updateByEmail(String email, Map<String, Object> payload) {
        DadosOrientador dados = getOrCreateByEmail(email);
        Usuario usuario = dados.getUsuario();
        
        if (payload.containsKey("nome")) dados.setNome((String) payload.get("nome"));
        if (payload.containsKey("cpf")) dados.setCpf((String) payload.get("cpf"));
        if (payload.containsKey("telefone")) dados.setTelefone((String) payload.get("telefone"));
        if (payload.containsKey("departamento")) dados.setDepartamento((String) payload.get("departamento"));
        if (payload.containsKey("especialidade")) dados.setEspecialidade((String) payload.get("especialidade"));
        
        // Atualizar curso do orientador
        if (payload.containsKey("cursoId")) {
            Object cursoIdObj = payload.get("cursoId");
            if (cursoIdObj != null && !cursoIdObj.toString().trim().isEmpty()) {
                Long cursoId = Long.parseLong(cursoIdObj.toString());
                Curso curso = cursoRepository.findById(cursoId)
                        .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado"));
                // Remove orientador do curso anterior
                cursoRepository.findAll().stream()
                    .filter(c -> c.getOrientador() != null && c.getOrientador().getId().equals(usuario.getId()))
                    .forEach(c -> {
                        c.setOrientador(null);
                        cursoRepository.save(c);
                    });
                // Associa orientador ao novo curso
                curso.setOrientador(usuario);
                cursoRepository.save(curso);
            } else {
                // Remove orientador de todos os cursos
                cursoRepository.findAll().stream()
                    .filter(c -> c.getOrientador() != null && c.getOrientador().getId().equals(usuario.getId()))
                    .forEach(c -> {
                        c.setOrientador(null);
                        cursoRepository.save(c);
                    });
            }
        }
        
        return dadosOrientadorRepository.save(dados);
    }
}

