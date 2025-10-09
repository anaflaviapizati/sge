import React from 'react';

export default function Home() {
    return (
        <div className="container-fluid mt-4 px-4">
            <div className="row">
                <div className="col-12">
                    <h3 className="mb-5 text-center" style={{ color: '#ff5252' }}>
                        Bem vindo ao Sistema de Gerenciamento de Estágios
                    </h3>
                    <p className="text-center mb-4" style={{ textAlign: 'justify' }}>
                        Este sistema foi desenvolvido para facilitar e organizar todo o processo de estágio, tanto para estudantes quanto para orientadores e instituições de ensino. Aqui, você poderá gerenciar todas as etapas do seu estágio de forma prática, segura e centralizada.
                    </p>
                    <div className="row justify-content-center mb-5">
                        {/* Card Como funciona */}
                        <div className="col-md-5 mb-4 mb-md-0">
                            <div className="card h-100">
                                <div className="card-header" style={{ background: '#ff5252', color: '#fff' }}>
                                    <h5 className="mb-0">Como funciona?</h5>
                                </div>
                                <div className="card-body" style={{ textAlign: 'justify' }}>
                                    <ul>
                                        <li>Cadastrar os dados do estágio: informações da empresa, supervisor, período e carga horária.</li>
                                        <li>Anexar e enviar documentos obrigatórios, como o Termo de Compromisso, o Plano de Atividades e os Relatórios de Estágio.</li>
                                        <li>Acompanhar o status do estágio em tempo real, com atualizações sobre a análise e aprovação dos documentos.</li>
                                        <li>Receber notificações e lembretes de prazos importantes, como a entrega de relatórios ou renovação do termo.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/* Card Ajuda */}
                        <div className="col-md-5">
                            <div className="card h-100">
                                <div className="card-header" style={{ background: '#ff5252', color: '#fff' }}>
                                    <h5 className="mb-0">Ajuda</h5>
                                </div>
                                <div className="card-body" style={{ textAlign: 'justify' }}>
                                    <ul>
                                        <li>Modelos de documentos prontos para download e preenchimento.</li>
                                        <li>Artigos explicativos sobre as principais resoluções e normas que regem os estágios, com base na legislação vigente.</li>
                                        <li>Orientações detalhadas sobre cada etapa do processo, desde o cadastro inicial até a finalização do estágio.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
