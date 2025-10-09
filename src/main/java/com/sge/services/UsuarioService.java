package com.sge.services;

import com.sge.models.Usuario;
import com.sge.models.Perfil;
import com.sge.repositories.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario cadastrar(String nome, String email, String senha, Perfil perfil) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        String hash = passwordEncoder.encode(senha);
        Usuario usuario = new Usuario(email, hash, nome, perfil);
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> autenticar(String email, String senha) {
        return usuarioRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(senha, u.getSenhaHash()));
    }
}


