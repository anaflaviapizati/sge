package com.sge.services;

import com.sge.models.Contrato;
import com.sge.models.DadosAluno;
import com.sge.models.Usuario;
import com.sge.repositories.ContratoRepository;
import com.sge.repositories.DadosAlunoRepository;
import com.sge.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Service
public class ContratoService {
    private final ContratoRepository contratoRepository;
    private final DadosAlunoRepository dadosAlunoRepository;
    private final UsuarioRepository usuarioRepository;

    public ContratoService(ContratoRepository contratoRepository, DadosAlunoRepository dadosAlunoRepository, UsuarioRepository usuarioRepository) {
        this.contratoRepository = contratoRepository;
        this.dadosAlunoRepository = dadosAlunoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Contrato> findByAlunoEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        
        DadosAluno aluno = dadosAlunoRepository.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalArgumentException("Dados do aluno não encontrados"));
        
        return contratoRepository.findByAluno(aluno);
    }

    public List<Contrato> findByOrientadorEmail(String email) {
        return contratoRepository.findByOrientador_EmailIgnoreCase(email);
    }

    public Contrato save(Contrato contrato) {
        return contratoRepository.save(contrato);
    }

    public Contrato findByIdAndUsuario(Long id, String email) {
        Optional<Contrato> opt = contratoRepository.findById(id);
        Contrato contrato = opt.orElseThrow(() -> new IllegalArgumentException("Contrato não encontrado"));

        // Permissão básica: o usuário precisa ser o aluno dono do contrato ou o orientador
        boolean permitido = false;
        if (contrato.getAluno() != null && contrato.getAluno().getUsuario() != null) {
            permitido = email.equalsIgnoreCase(contrato.getAluno().getUsuario().getEmail());
        }
        if (!permitido && contrato.getOrientador() != null) {
            permitido = email.equalsIgnoreCase(contrato.getOrientador().getEmail());
        }
        if (!permitido) {
            throw new SecurityException("Acesso negado ao contrato");
        }
        return contrato;
    }

    public Contrato criarContrato(DadosAluno aluno, String empresa, String setor, String cargo, String descricao, LocalDate dataInicio, LocalDate dataFim, String orientadorEmail) {
        Contrato c = new Contrato();
        c.setAluno(aluno);
        c.setEmpresa(empresa);
        c.setSetor(setor);
        c.setCargo(cargo);
        c.setDescricao(descricao);
        c.setDataInicio(dataInicio);
        c.setDataFim(dataFim);
        c.setStatus(Contrato.StatusContrato.PENDENTE);

        if (orientadorEmail != null && !orientadorEmail.isBlank()) {
            usuarioRepository.findByEmail(orientadorEmail).ifPresent(c::setOrientador);
        }
        return contratoRepository.save(c);
    }
}
