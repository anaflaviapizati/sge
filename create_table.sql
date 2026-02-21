-- Execute este script no MySQL para criar a tabela usuarios

USE sge;

-- Remover tabela se existir
DROP TABLE IF EXISTS usuarios;

-- Criar tabela usuarios
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    perfil ENUM('ALUNO', 'ORIENTADOR') NOT NULL
);

-- Verificar se foi criada
DESCRIBE usuarios;

