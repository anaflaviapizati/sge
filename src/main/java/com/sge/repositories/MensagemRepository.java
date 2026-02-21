package com.sge.repositories;

import com.sge.models.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    List<Mensagem> findByContratoIdOrderByCriadoEmAsc(Long contratoId);
    
    // 🔹 Busca mensagens com autor carregado (JOIN FETCH)
    @Query("SELECT m FROM Mensagem m JOIN FETCH m.autor WHERE m.contrato.id = :contratoId ORDER BY m.criadoEm ASC")
    List<Mensagem> findByContratoIdWithAutor(@Param("contratoId") Long contratoId);
}
