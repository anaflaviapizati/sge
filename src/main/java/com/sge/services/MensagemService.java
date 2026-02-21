package com.sge.services;

import com.sge.models.Contrato;
import com.sge.models.Mensagem;
import com.sge.models.Usuario;
import com.sge.repositories.MensagemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MensagemService {

    private final MensagemRepository mensagemRepository;

    public MensagemService(MensagemRepository mensagemRepository) {
        this.mensagemRepository = mensagemRepository;
    }

    public List<Mensagem> listarPorContrato(Long contratoId) {
        // Usa query com JOIN FETCH para garantir que o autor seja carregado
        return mensagemRepository.findByContratoIdWithAutor(contratoId);
    }

    // 🔹 Cria mensagem com tipo de envio
    public Mensagem criarMensagem(Contrato contrato, Usuario autor, String conteudo, Mensagem.TipoEnvio tipoEnvio) {
        Mensagem mensagem = new Mensagem();
        mensagem.setContrato(contrato);
        mensagem.setAutor(autor);
        mensagem.setConteudo(conteudo);
        mensagem.setTipoEnvio(tipoEnvio);
        return mensagemRepository.save(mensagem);
    }
}
