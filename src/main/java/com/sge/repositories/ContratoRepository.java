package com.sge.repositories;

import com.sge.models.Contrato;
import com.sge.models.DadosAluno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContratoRepository extends JpaRepository<Contrato, Long> {
    List<Contrato> findByAluno(DadosAluno aluno);
    List<Contrato> findByOrientador_EmailIgnoreCase(String email);
}
