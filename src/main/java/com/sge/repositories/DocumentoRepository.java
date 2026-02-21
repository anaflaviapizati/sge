package com.sge.repositories;

import com.sge.models.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    
    // Query usando JPQL para buscar documentos pelo ID do contrato
    @Query("SELECT d FROM Documento d WHERE d.contrato.id = :contratoId")
    List<Documento> findByContratoId(@Param("contratoId") Long contratoId);
    
    // Query SQL nativa como alternativa (mais direta)
    @Query(value = "SELECT * FROM documentos WHERE contrato_id = :contratoId", nativeQuery = true)
    List<Documento> findByContratoIdNative(@Param("contratoId") Long contratoId);
    
    // Método alternativo usando nomenclatura do Spring Data JPA
    List<Documento> findByContrato_Id(Long contratoId);
}
