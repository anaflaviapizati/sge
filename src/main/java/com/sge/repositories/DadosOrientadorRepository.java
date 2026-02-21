package com.sge.repositories;

import com.sge.models.DadosOrientador;
import com.sge.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DadosOrientadorRepository extends JpaRepository<DadosOrientador, Long> {
    Optional<DadosOrientador> findByUsuario(Usuario usuario);
    Optional<DadosOrientador> findByUsuario_Id(Long usuarioId);
}

