-- Script SQL para criar todas as tabelas do sistema SGE
-- Execute este script no MySQL

USE sge;

-- Tabela: usuarios (já pode existir)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    perfil ENUM('ALUNO', 'ORIENTADOR') NOT NULL
);

-- Tabela: cursos
CREATE TABLE IF NOT EXISTS cursos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    orientador_id BIGINT,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orientador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela: dados_alunos
CREATE TABLE IF NOT EXISTS dados_alunos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    curso_id BIGINT,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    rua VARCHAR(255),
    numero VARCHAR(255),
    bairro VARCHAR(255),
    cep VARCHAR(9),
    cidade VARCHAR(255),
    estado VARCHAR(2),
    telefone VARCHAR(15),
    matricula VARCHAR(255),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
);

-- Tabela: dados_orientadores
CREATE TABLE IF NOT EXISTS dados_orientadores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    rua VARCHAR(255),
    numero VARCHAR(255),
    bairro VARCHAR(255),
    cep VARCHAR(9),
    cidade VARCHAR(255),
    estado VARCHAR(2),
    telefone VARCHAR(15),
    departamento VARCHAR(255),
    especialidade VARCHAR(255),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela: contratos
CREATE TABLE IF NOT EXISTS contratos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aluno_id BIGINT NOT NULL,
    orientador_id BIGINT,
    empresa VARCHAR(255) NOT NULL,
    setor VARCHAR(255),
    cargo VARCHAR(255),
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    status INT NOT NULL DEFAULT 0,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES dados_alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (orientador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela: documentos
CREATE TABLE IF NOT EXISTS documentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contrato_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE CASCADE
);

-- Tabela: mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contrato_id BIGINT NOT NULL,
    autor_id BIGINT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo_envio VARCHAR(50) NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Verificar tabelas criadas
SHOW TABLES;

