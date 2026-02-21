package com.sge.controllers;

import com.sge.models.Contrato;
import com.sge.models.DadosAluno;
import com.sge.models.Usuario;
import com.sge.services.ContratoService;
import com.sge.services.DocumentoService;
import com.sge.repositories.UsuarioRepository;
import com.sge.repositories.DadosAlunoRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contratos")
public class ContratoController {

    private final ContratoService contratoService;
    private final DocumentoService documentoService;
    private final UsuarioRepository usuarioRepository;
    private final DadosAlunoRepository dadosAlunoRepository;

    public ContratoController(ContratoService contratoService, DocumentoService documentoService, UsuarioRepository usuarioRepository, DadosAlunoRepository dadosAlunoRepository) {
        this.contratoService = contratoService;
        this.documentoService = documentoService;
        this.usuarioRepository = usuarioRepository;
        this.dadosAlunoRepository = dadosAlunoRepository;
    }

    @GetMapping("/meus")
    public ResponseEntity<List<Map<String, Object>>> getMeusContratos(Principal principal) {
        String email = principal.getName();
        List<Contrato> contratos = contratoService.findByAlunoEmail(email);
        
        List<Map<String, Object>> contratosDto = contratos.stream()
                .map(this::toDto)
                .toList();
        
        return ResponseEntity.ok(contratosDto);
    }

    // Alias para "/meus" para compatibilizar com o frontend
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarContratos(Principal principal) {
        return getMeusContratos(principal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obterContrato(@PathVariable Long id, Principal principal) {
        Contrato c = contratoService.findByIdAndUsuario(id, principal.getName());
        return ResponseEntity.ok(toDetalheDto(c));
    }

    @GetMapping("/orientador")
    public ResponseEntity<List<Map<String, Object>>> listarPorOrientador(Principal principal) {
        List<Contrato> contratos = contratoService.findByOrientadorEmail(principal.getName());
        List<Map<String, Object>> contratosDto = contratos.stream().map(this::toDto).toList();
        return ResponseEntity.ok(contratosDto);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> criarContrato(
            Principal principal,
            @RequestParam String empresa,
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            @RequestParam(required = false) String orientador,
            @RequestParam(required = false) String setor,
            @RequestParam(required = false) String cargo,
            @RequestParam(required = false) Map<String, MultipartFile> allFiles
    ) throws Exception {
        try {
            System.out.println("=== Recebendo requisição de criação de contrato ===");
            System.out.println("Usuário: " + principal.getName());
            System.out.println("Empresa: " + empresa);
            System.out.println("DataInicio: " + dataInicio);
            System.out.println("DataFim: " + dataFim);
            System.out.println("Setor: " + setor);
            System.out.println("Cargo: " + cargo);
            System.out.println("Orientador: " + orientador);
            if (allFiles == null) {
                allFiles = new HashMap<>();
            }
            System.out.println("Total de arquivos recebidos: " + allFiles.size());
            allFiles.forEach((key, value) -> {
                if (value != null && !value.isEmpty()) {
                    System.out.println("  Arquivo[" + key + "]: " + value.getOriginalFilename() + " (" + value.getSize() + " bytes)");
                }
            });
            
            // Resolve usuário/aluno a partir do principal
            Usuario usuario = usuarioRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
            System.out.println("Usuário encontrado: " + usuario.getEmail());
            
            DadosAluno aluno = dadosAlunoRepository.findByUsuario(usuario)
                    .orElseThrow(() -> new IllegalArgumentException("Dados do aluno não encontrados"));
            System.out.println("Dados do aluno encontrados: " + aluno.getNome());

            if (empresa == null || empresa.isBlank()) {
                System.err.println("ERRO: Empresa é obrigatória");
                return ResponseEntity.badRequest().body(Map.of("erro", "Empresa é obrigatória"));
            }
            if (dataInicio == null || dataInicio.isBlank()) {
                System.err.println("ERRO: Data de início é obrigatória");
                return ResponseEntity.badRequest().body(Map.of("erro", "Data de início é obrigatória"));
            }

        LocalDate inicio;
        try {
            inicio = LocalDate.parse(dataInicio);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Data de início inválida (use yyyy-MM-dd)"));
        }

        LocalDate fim = null;
        if (dataFim != null && !dataFim.isBlank()) {
            try {
                fim = LocalDate.parse(dataFim);
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body(Map.of("erro", "Data de fim inválida (use yyyy-MM-dd)"));
            }
        }

            Contrato novo = contratoService.criarContrato(aluno, empresa, setor, cargo, descricao, inicio, fim, orientador);
            System.out.println("Contrato criado com ID: " + novo.getId());

            // Salvar anexos enviados como anexo_0, anexo_1, ...
            List<String> chavesOrdenadas = allFiles.keySet().stream()
                    .filter(k -> k.startsWith("anexo_"))
                    .sorted()
                    .collect(Collectors.toList());
            
            System.out.println("Chaves de anexos encontradas: " + chavesOrdenadas);
            
            int documentosSalvos = 0;
            if (!chavesOrdenadas.isEmpty()) {
                for (String k : chavesOrdenadas) {
                    MultipartFile arquivo = allFiles.get(k);
                    if (arquivo != null && !arquivo.isEmpty()) {
                        try {
                            System.out.println("Salvando documento " + k + ": " + arquivo.getOriginalFilename());
                            documentoService.salvarDocumento(novo.getId(), arquivo, principal.getName());
                            documentosSalvos++;
                            System.out.println("Documento " + k + " salvo com sucesso");
                        } catch (IOException e) {
                            // Log do erro mas continua salvando outros documentos
                            System.err.println("Erro ao salvar documento " + k + ": " + e.getMessage());
                            e.printStackTrace();
                        }
                    }
                }
            } else {
                System.out.println("Nenhuma chave de anexo encontrada (chaves disponíveis: " + allFiles.keySet() + ")");
            }
            
            System.out.println("Total de documentos salvos: " + documentosSalvos);
            
            if (documentosSalvos == 0 && !chavesOrdenadas.isEmpty()) {
                // Se nenhum documento foi salvo mas havia documentos enviados
                System.err.println("ATENÇÃO: Nenhum documento foi salvo, mas havia " + chavesOrdenadas.size() + " arquivos enviados");
            }

            // Recarrega o contrato do banco para garantir que está atualizado
            Contrato contratoAtualizado = contratoService.findByIdAndUsuario(novo.getId(), principal.getName());
            System.out.println("Contrato carregado do banco com " + (contratoAtualizado.getDocumentos() != null ? contratoAtualizado.getDocumentos().size() : 0) + " documentos");
            System.out.println("=== Contrato criado com sucesso ===");
            
            return ResponseEntity.ok(toDetalheDto(contratoAtualizado));
        } catch (Exception e) {
            System.err.println("ERRO ao criar contrato: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("erro", "Erro ao criar contrato: " + e.getMessage()));
        }
    }

    private Map<String, Object> toDto(Contrato c) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", c.getId());
        dto.put("empresa", c.getEmpresa());
        dto.put("dataInicio", c.getDataInicio() != null ? c.getDataInicio().toString() : "");
        dto.put("dataFim", c.getDataFim() != null ? c.getDataFim().toString() : "");
        dto.put("status", c.getStatus() != null ? c.getStatus().name() : "");
        dto.put("orientadorNome", c.getOrientador() != null ? c.getOrientador().getNome() : "");
        dto.put("criadoEm", c.getCriadoEm() != null ? c.getCriadoEm().toString() : "");
        return dto;
    }

    private Map<String, Object> toDetalheDto(Contrato c) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", c.getId());
        dto.put("empresa", c.getEmpresa());
        dto.put("setor", c.getSetor() != null ? c.getSetor() : "");
        dto.put("cargo", c.getCargo() != null ? c.getCargo() : "");
        dto.put("dataInicio", c.getDataInicio() != null ? c.getDataInicio().toString() : "");
        dto.put("dataFim", c.getDataFim() != null ? c.getDataFim().toString() : "");
        dto.put("descricao", c.getDescricao() != null ? c.getDescricao() : "");
        dto.put("orientador", c.getOrientador() != null ? c.getOrientador().getNome() : "");
        dto.put("status", c.getStatus() != null ? c.getStatus().name() : "");
        dto.put("criadoEm", c.getCriadoEm() != null ? c.getCriadoEm().toString() : "");
        return dto;
    }
}
