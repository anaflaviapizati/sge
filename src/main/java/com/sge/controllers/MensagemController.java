package com.sge.controllers;

import com.sge.models.Contrato;
import com.sge.models.Mensagem;
import com.sge.models.Usuario;
import com.sge.models.Perfil;
import com.sge.services.ContratoService;
import com.sge.services.MensagemService;
import com.sge.repositories.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contratos/{contratoId}/mensagens")
public class MensagemController {

    private final MensagemService mensagemService;
    private final ContratoService contratoService;
    private final UsuarioRepository usuarioRepository;

    public MensagemController(MensagemService mensagemService, ContratoService contratoService, UsuarioRepository usuarioRepository) {
        this.mensagemService = mensagemService;
        this.contratoService = contratoService;
        this.usuarioRepository = usuarioRepository;
    }

    // 🔹 Listar todas as mensagens de um contrato
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar(@PathVariable Long contratoId, Principal principal) {
        Contrato contrato = contratoService.findByIdAndUsuario(contratoId, principal.getName());
        List<Mensagem> msgs = mensagemService.listarPorContrato(contrato.getId());
        return ResponseEntity.ok(
                msgs.stream().map(m -> toDto(m, contrato)).toList()
        );
    }

    // 🔹 Enviar nova mensagem com tipoEnvio obrigatório
    @PostMapping
    public ResponseEntity<Map<String, Object>> enviar(
            @PathVariable Long contratoId,
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        String conteudo = body.getOrDefault("conteudo", "").trim();
        if (conteudo.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Conteúdo vazio"));
        }

        Contrato contrato = contratoService.findByIdAndUsuario(contratoId, principal.getName());
        Usuario autor = usuarioRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        // 🔹 Determina o tipo de envio (obrigatório)
        String tipoEnvioStr = body.getOrDefault("tipoEnvio", "").trim();
        if (tipoEnvioStr.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Tipo de envio obrigatório"));
        }

        Mensagem.TipoEnvio tipoEnvio;
        try {
            tipoEnvio = Mensagem.TipoEnvio.valueOf(tipoEnvioStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Tipo de envio inválido"));
        }

        // 🔹 Cria a mensagem
        Mensagem mensagem = mensagemService.criarMensagem(contrato, autor, conteudo, tipoEnvio);

        // 🔹 Verifica se é orientador: pelo perfil do usuário OU se está atribuído como orientador do contrato
        boolean isOrientador = autor.getPerfil() == Perfil.ORIENTADOR ||
                (contrato.getOrientador() != null &&
                principal.getName().equalsIgnoreCase(contrato.getOrientador().getEmail()));

        if (isOrientador) {
            switch (tipoEnvio) {
                case ENVIAR_E_APROVAR -> contrato.setStatus(Contrato.StatusContrato.APROVADO);
                case ENVIAR_E_REPROVAR -> contrato.setStatus(Contrato.StatusContrato.REPROVADO);
                case ENVIAR_E_SOLICITAR_CORRECAO -> contrato.setStatus(Contrato.StatusContrato.CORRECAO_SOLICITADA);
                case NORMAL -> {
                    // Mensagem normal não altera o status
                }
            }
            if (tipoEnvio != Mensagem.TipoEnvio.NORMAL) {
                contratoService.save(contrato);
            }
        } else {
            // Mensagem normal do aluno não altera status
            if (tipoEnvio != Mensagem.TipoEnvio.NORMAL) {
                // Mensagem enviada pelo aluno com ação: contrato fica aguardando resposta (EM_ANALISE)
                contrato.setStatus(Contrato.StatusContrato.EM_ANALISE);
                contratoService.save(contrato);
            }
        }

        return ResponseEntity.ok(toDto(mensagem, contrato));
    }

    // 🔹 Converte mensagem em DTO, incluindo status atual do contrato
    private Map<String, Object> toDto(Mensagem m, Contrato c) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", m.getId());
        dto.put("conteudo", m.getConteudo());
        dto.put("criadoEm", m.getCriadoEm() != null ? m.getCriadoEm().toString() : "");
        dto.put("autor", m.getAutor() != null ? m.getAutor().getNome() : "");
        dto.put("autorEmail", m.getAutor() != null ? m.getAutor().getEmail() : "");
        // Garante que autorId sempre seja retornado
        dto.put("autorId", m.getAutor() != null ? m.getAutor().getId() : null);
        dto.put("tipoEnvio", m.getTipoEnvio().name());
        dto.put("statusContrato", c.getStatus().name());
        dto.put("statusCodigo", c.getStatus().getCodigo());
        return dto;
    }
}
