package com.sge.repositories;

import com.sge.models.DadosAluno;
import com.sge.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DadosAlunoRepository extends JpaRepository<DadosAluno, Long> {
    Optional<DadosAluno> findByUsuario(Usuario usuario);
}


