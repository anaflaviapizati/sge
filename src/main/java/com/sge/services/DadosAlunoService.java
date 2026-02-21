package com.sge.services;

import com.sge.models.Curso;
import com.sge.models.DadosAluno;
import com.sge.models.Usuario;
import com.sge.repositories.CursoRepository;
import com.sge.repositories.DadosAlunoRepository;
import com.sge.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DadosAlunoService {
    private final DadosAlunoRepository dadosAlunoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    public DadosAlunoService(DadosAlunoRepository dadosAlunoRepository, UsuarioRepository usuarioRepository, CursoRepository cursoRepository) {
        this.dadosAlunoRepository = dadosAlunoRepository;
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
    }

    public DadosAluno getOrCreateByEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        return dadosAlunoRepository.findByUsuario(usuario)
                .orElseGet(() -> {
                    DadosAluno dados = new DadosAluno(usuario);
                    dados.setNome(usuario.getNome()); // Preenche nome do usuário
                    return dadosAlunoRepository.save(dados);
                });
    }

    public DadosAluno updateByEmail(String email, Map<String, Object> payload) {
        DadosAluno dados = getOrCreateByEmail(email);
        
        if (payload.containsKey("nome")) dados.setNome((String) payload.get("nome"));
        if (payload.containsKey("cpf")) dados.setCpf((String) payload.get("cpf"));
        if (payload.containsKey("rg")) dados.setRg((String) payload.get("rg"));
        if (payload.containsKey("rua")) dados.setRua((String) payload.get("rua"));
        if (payload.containsKey("numero")) dados.setNumero((String) payload.get("numero"));
        if (payload.containsKey("bairro")) dados.setBairro((String) payload.get("bairro"));
        if (payload.containsKey("cep")) dados.setCep((String) payload.get("cep"));
        if (payload.containsKey("cidade")) dados.setCidade((String) payload.get("cidade"));
        if (payload.containsKey("estado")) dados.setEstado((String) payload.get("estado"));
        if (payload.containsKey("telefone")) dados.setTelefone((String) payload.get("telefone"));
        if (payload.containsKey("matricula")) dados.setMatricula((String) payload.get("matricula"));
        
        // Handle curso relationship
        if (payload.containsKey("cursoId")) {
            Object cursoIdObj = payload.get("cursoId");
            if (cursoIdObj != null) {
                Long cursoId = Long.valueOf(cursoIdObj.toString());
                Curso curso = cursoRepository.findById(cursoId)
                        .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado"));
                dados.setCurso(curso);
            } else {
                dados.setCurso(null);
            }
        }
        
        return dadosAlunoRepository.save(dados);
    }
}


