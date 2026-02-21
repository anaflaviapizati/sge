package com.sge.models;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contratos")
@EntityListeners(AuditingEntityListener.class)
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "aluno_id", nullable = false)
    private DadosAluno aluno;

    @ManyToOne
    @JoinColumn(name = "orientador_id")
    private Usuario orientador;

    @Column(nullable = false)
    private String empresa;

    @Column
    private String setor;

    @Column
    private String cargo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    // 🔹 Salva o enum como inteiro no banco
    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    private StatusContrato status;

    @OneToMany(mappedBy = "contrato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Documento> documentos;

    @OneToMany(mappedBy = "contrato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Mensagem> mensagens;

    @CreatedDate
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @LastModifiedDate
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public enum StatusContrato {
        PENDENTE(0),           // aluno enviou, aguardando análise
        EM_ANALISE(1),         // orientador está avaliando
        CORRECAO_SOLICITADA(2),// orientador pediu ajustes
        APROVADO(3),           // contrato validado
        REPROVADO(4),          // contrato rejeitado
        FINALIZADO(5);         // estágio concluído

        private final int codigo;

        StatusContrato(int codigo) {
            this.codigo = codigo;
        }

        public int getCodigo() {
            return codigo;
        }

        public static StatusContrato fromCodigo(int codigo) {
            for (StatusContrato status : StatusContrato.values()) {
                if (status.getCodigo() == codigo) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Código de status inválido: " + codigo);
        }
    }

    public Contrato() {}

    public Contrato(DadosAluno aluno, String empresa, LocalDate dataInicio, StatusContrato status) {
        this.aluno = aluno;
        this.empresa = empresa;
        this.dataInicio = dataInicio;
        this.status = status;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public DadosAluno getAluno() {
        return aluno;
    }

    public void setAluno(DadosAluno aluno) {
        this.aluno = aluno;
    }

    public Usuario getOrientador() {
        return orientador;
    }

    public void setOrientador(Usuario orientador) {
        this.orientador = orientador;
    }

    public String getEmpresa() {
        return empresa;
    }

    public void setEmpresa(String empresa) {
        this.empresa = empresa;
    }

    public String getSetor() {
        return setor;
    }

    public void setSetor(String setor) {
        this.setor = setor;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public StatusContrato getStatus() {
        return status;
    }

    public void setStatus(StatusContrato status) {
        this.status = status;
    }

    public List<Documento> getDocumentos() {
        return documentos;
    }

    public void setDocumentos(List<Documento> documentos) {
        this.documentos = documentos;
    }

    public List<Mensagem> getMensagens() {
        return mensagens;
    }

    public void setMensagens(List<Mensagem> mensagens) {
        this.mensagens = mensagens;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
