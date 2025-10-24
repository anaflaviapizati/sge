package com.sge.controllers;

import com.sge.config.JwtService;
import com.sge.models.Usuario;
import com.sge.models.Perfil;
import com.sge.services.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public AuthController(UsuarioService usuarioService, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String nome = body.getOrDefault("nome", "");
            String email = body.getOrDefault("email", "");
            String senha = body.getOrDefault("senha", "");
            String perfilStr = body.getOrDefault("perfil", "ALUNO");
            Perfil perfil = Perfil.valueOf(perfilStr.toUpperCase());
            Usuario u = usuarioService.cadastrar(nome, email, senha, perfil);
            Map<String, Object> claims = new HashMap<>();
            claims.put("nome", u.getNome());
            claims.put("perfil", u.getPerfil().name());
            String token = jwtService.generateToken(u.getEmail(), claims);
            return ResponseEntity.ok(Map.of("token", token, "usuario", Map.of("id", u.getId(), "nome", u.getNome(), "email", u.getEmail(), "perfil", u.getPerfil().name())));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Erro interno do servidor: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String senha = body.getOrDefault("senha", "");
        return usuarioService.autenticar(email, senha)
                .map(u -> {
                    Map<String, Object> claims = new HashMap<>();
                    claims.put("nome", u.getNome());
                    claims.put("perfil", u.getPerfil().name());
                    String token = jwtService.generateToken(u.getEmail(), claims);
                    return ResponseEntity.ok(Map.of("token", token, "usuario", Map.of("id", u.getId(), "nome", u.getNome(), "email", u.getEmail(), "perfil", u.getPerfil().name())));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("message", "Credenciais inválidas")));
    }
}


