package com.sge.services;

import com.sge.models.Curso;
import com.sge.repositories.CursoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CursoService {
    private final CursoRepository cursoRepository;

    public CursoService(CursoRepository cursoRepository) {
        this.cursoRepository = cursoRepository;
    }

    public List<Curso> findAll() {
        return cursoRepository.findAll();
    }

    public Curso save(Curso curso) {
        return cursoRepository.save(curso);
    }

    public void initializeCursos() {
        if (cursoRepository.count() == 0) {
            cursoRepository.save(new Curso("Sistemas de Informação"));
            cursoRepository.save(new Curso("Engenharia de Produção"));
            cursoRepository.save(new Curso("Engenharia Elétrica"));
            cursoRepository.save(new Curso("Engenharia de Computação"));
        }
    }
}
