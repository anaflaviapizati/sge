import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-dark text-light py-4 mt-5">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-6">
                        <h5>SGE - Sistema de Gerenciamento de Estágios</h5>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <p className="mb-0">
                            © 2024 SGE. Todos os direitos reservados.
                        </p>
                        <small className="text-muted">
                            Desenvolvido por Ana Flávia Pizati
                        </small>
                    </div>
                </div>
            </div>
        </footer>
    );
}
