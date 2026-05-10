document.addEventListener('DOMContentLoaded', () => {
    // Background Parallax Effect
    const parallaxLayers = document.querySelectorAll('.parallax-layer');

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2);
        const y = (e.clientY - window.innerHeight / 2);

        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed'));
            // Calculando o deslocamento baseado no mouse e na velocidade da camada
            const xOffset = (x * speed) / 100;
            const yOffset = (y * speed) / 100;
            
            // Usando requestAnimationFrame implicitamente ao não sobrecarregar, mas para melhor performance:
            layer.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        });
    });
    // Mascot Interaction
    const mascotContainer = document.querySelector('.mascot-container');
    const mascotImg = document.querySelector('.mascot-protein');
    
    if (mascotContainer && mascotImg) {
        const floatingIcons = mascotContainer.querySelectorAll('.floating-icon');
        
        document.addEventListener('mousemove', (e) => {
            // Calcular a posição do mouse em relação ao mascote
            const rect = mascotContainer.getBoundingClientRect();
            const mascotCenterX = rect.left + rect.width / 2;
            const mascotCenterY = rect.top + rect.height / 2;
            
            // Movimentação sutil da div inteira
            const xMove = (e.clientX - mascotCenterX) * 0.03;
            const yMove = (e.clientY - mascotCenterY) * 0.03;
            mascotContainer.style.transform = `translate(${xMove}px, ${yMove}px)`;

            // Movimentação independente dos ícones atrás (efeito parallax)
            floatingIcons.forEach((icon, index) => {
                const factor = (index + 1) * 0.05; // Fatores diferentes para cada ícone
                const iconX = (e.clientX - mascotCenterX) * factor;
                const iconY = (e.clientY - mascotCenterY) * factor;
                icon.style.transform = `translate(${iconX}px, ${iconY}px)`;
            });
        });

        // Efeito ao clicar para fazer algo divertido na imagem
        mascotImg.addEventListener('click', () => {
            mascotImg.style.transition = 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            mascotImg.style.transform = `scale(0.8)`;
            
            setTimeout(() => {
                mascotImg.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                mascotImg.style.transform = `scale(1.2) rotate(-10deg)`;
            }, 100);
            
            // Retorna ao hover normal da CSS depois de um tempo
            setTimeout(() => {
                mascotImg.style.transform = '';
            }, 600);
        });
    }    // Form Submission Logic
    const form = document.getElementById('registration-form');
    if (form) {
        // --- COLE SEU LINK DO GOOGLE APPS SCRIPT AQUI ---
        const scriptURL = 'https://script.google.com/macros/s/AKfycbxroSfH7Yl0XJd7MHcwBgFKzIIStfiD7P-AA9x5pRwZMNH_aECjc0_TR2aQp_w5ldc5/exec'; 
        
        const submitBtn = document.getElementById('submit-btn');
        const spinner = submitBtn.querySelector('.spinner');
        const btnText = submitBtn.querySelector('span');
        const formMessage = document.getElementById('form-message');

        // Modal de aviso pré-pagamento
        const avisoPagamentoModal = document.getElementById('aviso-pagamento-modal');
        const confirmPagamentoBtn = document.getElementById('confirm-pagamento-btn');
        const cancelPagamentoBtn = document.getElementById('cancel-pagamento-btn');
        const confirmSpinner = document.getElementById('confirm-spinner');
        const confirmBtnText = confirmPagamentoBtn ? confirmPagamentoBtn.querySelector('span') : null;

        // Ao submeter o formulário, mostra o modal de aviso primeiro
        form.addEventListener('submit', e => {
            e.preventDefault();
            
            if (scriptURL === 'COLE_SEU_LINK_AQUI') {
                showMessage('Erro: O link do Google Sheets ainda não foi configurado pelo administrador.', 'error');
                return;
            }

            // Valida o formulário nativamente antes de abrir o modal
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Abre o modal de aviso
            avisoPagamentoModal.style.display = 'flex';
        });

        // Botão cancelar: fecha o modal
        if (cancelPagamentoBtn) {
            cancelPagamentoBtn.addEventListener('click', () => {
                avisoPagamentoModal.style.display = 'none';
            });
        }

        // Fechar ao clicar fora
        if (avisoPagamentoModal) {
            window.addEventListener('click', (e) => {
                if (e.target === avisoPagamentoModal) {
                    avisoPagamentoModal.style.display = 'none';
                }
            });
        }

        // Botão confirmar: envia os dados
        if (confirmPagamentoBtn) {
            confirmPagamentoBtn.addEventListener('click', () => {
                // UI Loading State
                confirmPagamentoBtn.disabled = true;
                confirmSpinner.style.display = 'block';
                confirmBtnText.textContent = 'Enviando...';

                // Coletar dados via FormData
                const formData = new FormData(form);

                fetch(scriptURL, { method: 'POST', body: formData })
                    .then(response => {
                        // Após envio bem-sucedido, vai para a página de escolha de planos
                        window.location.href = 'planos.html';
                    })
                    .catch(error => {
                        console.error('Erro!', error.message);
                        avisoPagamentoModal.style.display = 'none';
                        showMessage('Ocorreu um erro ao enviar sua inscrição. Tente novamente mais tarde.', 'error');
                    })
                    .finally(() => {
                        // Restaurar UI
                        confirmPagamentoBtn.disabled = false;
                        confirmSpinner.style.display = 'none';
                        confirmBtnText.textContent = 'Entendi, prosseguir para pagamento';
                    });
            });
        }

        function showMessage(text, type) {
            formMessage.textContent = text;
            formMessage.className = 'form-message ' + type;
            formMessage.style.display = 'block';
        }
    }

    // Upload de Arquivo (Página de Pagamento)
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');
        const fileNameDisplay = document.getElementById('file-name');
        
        const uploadBtn = document.getElementById('upload-btn');
        const uploadSpinner = uploadBtn.querySelector('.spinner');
        const uploadBtnText = uploadBtn.querySelector('span');
        const uploadMessage = document.getElementById('upload-message');
        
        let selectedFile = null;

        // --- COLE SEU LINK DO GOOGLE APPS SCRIPT AQUI ---
        const uploadScriptURL = 'https://script.google.com/macros/s/AKfycbxroSfH7Yl0XJd7MHcwBgFKzIIStfiD7P-AA9x5pRwZMNH_aECjc0_TR2aQp_w5ldc5/exec'; 

        // Abrir seletor ao clicar
        dropArea.addEventListener('click', () => fileInput.click());

        // Eventos de Drag & Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
        });

        dropArea.addEventListener('drop', (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;
            handleFiles(files);
        });

        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            if (files.length > 0) {
                selectedFile = files[0];
                fileNameDisplay.textContent = 'Arquivo selecionado: ' + selectedFile.name;
            }
        }

        uploadForm.addEventListener('submit', e => {
            e.preventDefault();
            
            if (uploadScriptURL === 'COLE_SEU_LINK_AQUI') {
                showUploadMessage('Erro: O link do Google Sheets ainda não foi configurado pelo administrador.', 'error');
                return;
            }

            if (!selectedFile) {
                showUploadMessage('Por favor, selecione um arquivo de comprovante.', 'error');
                return;
            }

            // UI Loading State
            uploadBtn.disabled = true;
            uploadSpinner.style.display = 'block';
            uploadBtnText.textContent = 'Enviando...';
            uploadMessage.style.display = 'none';

            // Ler o arquivo como Base64
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Data = e.target.result.split(',')[1];
                const nome = document.getElementById('upload-nome').value;
                const tipoInscricaoInput = document.getElementById('tipo-inscricao');
                const tipoInscricao = tipoInscricaoInput ? tipoInscricaoInput.value : 'Padrão';

                // Montar o formulário que será enviado
                const formData = new URLSearchParams();
                formData.append('nome', nome);
                formData.append('tipo', tipoInscricao);
                formData.append('filename', selectedFile.name);
                formData.append('mimeType', selectedFile.type);
                formData.append('fileData', base64Data);
                // Campo especial para o script saber que é um upload
                formData.append('action', 'upload'); 

                fetch(uploadScriptURL, { 
                    method: 'POST', 
                    body: formData,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(response => {
                    showUploadMessage('Comprovante enviado com sucesso! Sua inscrição será confirmada em breve.', 'success');
                    uploadForm.reset();
                    selectedFile = null;
                    fileNameDisplay.textContent = '';
                })
                .catch(error => {
                    console.error('Erro!', error.message);
                    showUploadMessage('Ocorreu um erro ao enviar o comprovante. Tente novamente mais tarde.', 'error');
                })
                .finally(() => {
                    // Restaurar UI
                    uploadBtn.disabled = false;
                    uploadSpinner.style.display = 'none';
                    uploadBtnText.textContent = 'Enviar Comprovante';
                });
            };
            
            reader.onerror = function() {
                showUploadMessage('Erro ao ler o arquivo.', 'error');
                uploadBtn.disabled = false;
                uploadSpinner.style.display = 'none';
                uploadBtnText.textContent = 'Enviar Comprovante';
            };

            reader.readAsDataURL(selectedFile);
        });

        function showUploadMessage(text, type) {
            uploadMessage.textContent = text;
            uploadMessage.className = 'form-message ' + type;
            uploadMessage.style.display = 'block';
        }
    }

    // Lógica do Modal de Aviso na Página Inicial
    const openAvisoBtn = document.getElementById('open-aviso-btn');
    const avisoModal = document.getElementById('aviso-modal');
    
    if (openAvisoBtn && avisoModal) {
        const closeModalBtn = document.getElementById('close-modal-btn');
        const agreeCheckbox = document.getElementById('agree-checkbox');
        const proceedBtn = document.getElementById('proceed-btn');

        // Abre o modal
        openAvisoBtn.addEventListener('click', () => {
            avisoModal.style.display = 'flex';
        });

        // Fecha o modal pelo botão Cancelar
        closeModalBtn.addEventListener('click', () => {
            avisoModal.style.display = 'none';
            agreeCheckbox.checked = false;
            proceedBtn.disabled = true;
            proceedBtn.style.opacity = '0.5';
            proceedBtn.style.cursor = 'not-allowed';
        });

        // Fecha o modal se clicar fora dele (no fundo escuro)
        window.addEventListener('click', (e) => {
            if (e.target === avisoModal) {
                avisoModal.style.display = 'none';
                agreeCheckbox.checked = false;
                proceedBtn.disabled = true;
                proceedBtn.style.opacity = '0.5';
                proceedBtn.style.cursor = 'not-allowed';
            }
        });

        // Habilita o botão apenas se o checkbox estiver marcado
        agreeCheckbox.addEventListener('change', () => {
            if (agreeCheckbox.checked) {
                proceedBtn.disabled = false;
                proceedBtn.style.opacity = '1';
                proceedBtn.style.cursor = 'pointer';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.style.opacity = '0.5';
                proceedBtn.style.cursor = 'not-allowed';
            }
        });

        // Redireciona para a página de inscrição ao clicar em prosseguir
        proceedBtn.addEventListener('click', () => {
            window.location.href = 'inscricao.html';
        });
    }

    // ========================================
    // Lógica da Página - Festa de Encerramento
    // ========================================
    const festaCards = document.getElementById('option-cards');
    if (festaCards) {
        const cardInscrito = document.getElementById('card-inscrito');
        const cardExterno = document.getElementById('card-externo');
        const formSection = document.getElementById('festa-form-section');
        const formTitle = document.getElementById('form-section-title');
        const verifyBtn = document.getElementById('verify-btn');
        const proceedFestaBtn = document.getElementById('proceed-festa-btn');
        const verifyBtnText = document.getElementById('verify-btn-text');
        const verifySpinner = document.getElementById('verify-spinner');
        const verifyStatus = document.getElementById('verify-status');
        const nomeInput = document.getElementById('festa-nome');
        const cpfInput = document.getElementById('festa-cpf');
        const paymentSection = document.getElementById('festa-payment-section');
        const valorTag = document.getElementById('festa-valor-tag');
        const successModal = document.getElementById('festa-success-modal');

        // URL do Google Apps Script (mesmo já usado no projeto)
        const festaScriptURL = 'https://script.google.com/macros/s/AKfycbxroSfH7Yl0XJd7MHcwBgFKzIIStfiD7P-AA9x5pRwZMNH_aECjc0_TR2aQp_w5ldc5/exec';

        let selectedOption = null;

        // CPF: aceitar apenas números
        cpfInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 11);
        });

        // Seleção de cards
        function selectOption(option) {
            selectedOption = option;
            cardInscrito.classList.toggle('selected', option === 'inscrito');
            cardExterno.classList.toggle('selected', option === 'externo');

            // Mostrar formulário
            formSection.classList.add('visible');
            verifyStatus.style.display = 'none';
            paymentSection.classList.remove('visible');

            if (option === 'inscrito') {
                formTitle.textContent = 'Verifique sua Inscrição';
                nomeInput.placeholder = 'Nome completo conforme usado na inscrição';
                verifyBtn.style.display = 'flex';
                proceedFestaBtn.style.display = 'none';
            } else {
                formTitle.textContent = 'Seus Dados';
                nomeInput.placeholder = 'Seu nome completo';
                verifyBtn.style.display = 'none';
                proceedFestaBtn.style.display = 'flex';
            }
        }

        cardInscrito.addEventListener('click', () => selectOption('inscrito'));
        cardExterno.addEventListener('click', () => selectOption('externo'));

        // Botão prosseguir (externo — sem verificação)
        proceedFestaBtn.addEventListener('click', () => {
            const nome = nomeInput.value.trim();
            const cpf = cpfInput.value.trim();
            if (!nome || cpf.length < 11) {
                verifyStatus.textContent = 'Por favor, preencha o nome completo e o CPF corretamente.';
                verifyStatus.className = 'verify-status error';
                verifyStatus.style.display = 'block';
                return;
            }
            verifyStatus.style.display = 'none';
            showPayment('60,00', 'Externo', nome, cpf);
        });

        // Botão verificar inscrição
        verifyBtn.addEventListener('click', () => {
            const nome = nomeInput.value.trim();
            const cpf = cpfInput.value.trim();

            if (!nome || cpf.length < 11) {
                verifyStatus.textContent = 'Por favor, preencha o nome completo e o CPF corretamente.';
                verifyStatus.className = 'verify-status error';
                verifyStatus.style.display = 'block';
                return;
            }

            // Loading
            verifyBtn.disabled = true;
            verifyBtnText.textContent = 'Verificando...';
            verifySpinner.style.display = 'block';
            verifyStatus.style.display = 'none';

            const url = festaScriptURL + '?action=verificarInscricao&nome=' + encodeURIComponent(nome) + '&cpf=' + encodeURIComponent(cpf);

            fetch(url, { method: 'POST' })
                .then(response => response.text())
                .then(text => {
                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch(parseErr) {
                        data = null;
                    }

                    if (data && data.encontrado) {
                        verifyStatus.textContent = '✅ Inscrição encontrada! Prossiga com o pagamento abaixo.';
                        verifyStatus.className = 'verify-status success';
                        verifyStatus.style.display = 'block';
                        showPayment('50,00', 'Inscrito SIMOL', nome, cpf);
                    } else {
                        verifyStatus.innerHTML = '❌ Inscrição não encontrada. Verifique se o nome e CPF estão iguais aos usados na inscrição.<br><small style="margin-top:8px;display:inline-block;">Se preferir, selecione a opção "Quero apenas participar da festa" (R$ 60,00).</small>';
                        verifyStatus.className = 'verify-status error';
                        verifyStatus.style.display = 'block';
                        paymentSection.classList.remove('visible');
                    }
                })
                .catch(error => {
                    console.error('Erro na verificação:', error);
                    verifyStatus.textContent = 'Erro ao verificar. Tente novamente mais tarde.';
                    verifyStatus.className = 'verify-status error';
                    verifyStatus.style.display = 'block';
                })
                .finally(() => {
                    verifyBtn.disabled = false;
                    verifyBtnText.textContent = 'Verificar Inscrição';
                    verifySpinner.style.display = 'none';
                });
        });

        function showPayment(valor, tipo, nome, cpf) {
            valorTag.textContent = 'R$ ' + valor;
            document.getElementById('festa-tipo').value = tipo;
            document.getElementById('festa-valor').value = valor;
            document.getElementById('festa-nome-hidden').value = nome;
            document.getElementById('festa-cpf-hidden').value = cpf;
            paymentSection.classList.add('visible');
            // Scroll suave até a seção de pagamento
            setTimeout(() => {
                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        // Upload de comprovante — Festa
        const festaUploadForm = document.getElementById('festa-upload-form');
        const festaDropArea = document.getElementById('festa-drop-area');
        const festaFileInput = document.getElementById('festa-file-input');
        const festaFileName = document.getElementById('festa-file-name');
        const festaUploadBtn = document.getElementById('festa-upload-btn');
        const festaUploadSpinner = festaUploadBtn.querySelector('.spinner');
        const festaUploadBtnText = festaUploadBtn.querySelector('span');
        const festaUploadMessage = document.getElementById('festa-upload-message');
        let festaSelectedFile = null;

        festaDropArea.addEventListener('click', () => festaFileInput.click());

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            festaDropArea.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            festaDropArea.addEventListener(eventName, () => festaDropArea.classList.add('highlight'), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            festaDropArea.addEventListener(eventName, () => festaDropArea.classList.remove('highlight'), false);
        });

        festaDropArea.addEventListener('drop', (e) => {
            handleFestaFiles(e.dataTransfer.files);
        });

        festaFileInput.addEventListener('change', function() {
            handleFestaFiles(this.files);
        });

        function handleFestaFiles(files) {
            if (files.length > 0) {
                festaSelectedFile = files[0];
                festaFileName.textContent = 'Arquivo selecionado: ' + festaSelectedFile.name;
            }
        }

        festaUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!festaSelectedFile) {
                showFestaUploadMessage('Por favor, selecione um arquivo de comprovante.', 'error');
                return;
            }

            // Loading
            festaUploadBtn.disabled = true;
            festaUploadSpinner.style.display = 'block';
            festaUploadBtnText.textContent = 'Enviando...';
            festaUploadMessage.style.display = 'none';

            const reader = new FileReader();
            reader.onload = function(ev) {
                const base64Data = ev.target.result.split(',')[1];
                const nome = document.getElementById('festa-nome-hidden').value;
                const cpf = document.getElementById('festa-cpf-hidden').value;
                const tipo = document.getElementById('festa-tipo').value;
                const valor = document.getElementById('festa-valor').value;

                const formData = new URLSearchParams();
                formData.append('action', 'uploadFesta');
                formData.append('nome', nome);
                formData.append('cpf', cpf);
                formData.append('tipo', tipo);
                formData.append('valor', valor);
                formData.append('filename', festaSelectedFile.name);
                formData.append('mimeType', festaSelectedFile.type);
                formData.append('fileData', base64Data);

                fetch(festaScriptURL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                .then(response => {
                    // Mostrar modal de sucesso
                    successModal.style.display = 'flex';
                })
                .catch(error => {
                    console.error('Erro!', error.message);
                    showFestaUploadMessage('Erro ao enviar comprovante. Tente novamente.', 'error');
                })
                .finally(() => {
                    festaUploadBtn.disabled = false;
                    festaUploadSpinner.style.display = 'none';
                    festaUploadBtnText.textContent = 'Enviar Comprovante';
                });
            };

            reader.onerror = function() {
                showFestaUploadMessage('Erro ao ler o arquivo.', 'error');
                festaUploadBtn.disabled = false;
                festaUploadSpinner.style.display = 'none';
                festaUploadBtnText.textContent = 'Enviar Comprovante';
            };

            reader.readAsDataURL(festaSelectedFile);
        });

        function showFestaUploadMessage(text, type) {
            festaUploadMessage.textContent = text;
            festaUploadMessage.className = 'form-message ' + type;
            festaUploadMessage.style.display = 'block';
        }

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.style.display = 'none';
            }
        });
    }

    // Button Molecules Interaction (Hover & Click)
    const interactiveButtons = document.querySelectorAll('.action-btn, #open-aviso-btn');
    
    interactiveButtons.forEach(btn => {
        // Criar moléculas no hover
        btn.addEventListener('mouseenter', () => {
            for (let i = 0; i < 4; i++) {
                createMolecule(btn, false);
            }
        });

        // Remover moléculas ao sair
        btn.addEventListener('mouseleave', () => {
            const molecules = btn.querySelectorAll('.btn-molecule');
            molecules.forEach(m => {
                m.style.opacity = '0';
                setTimeout(() => m.remove(), 300);
            });
        });

        // Efeito de explosão no Click (funciona no celular também)
        btn.addEventListener('click', () => {
            for (let i = 0; i < 10; i++) {
                createMolecule(btn, true);
            }
        });
    });

    function createMolecule(parent, isExplosion) {
        const molecule = document.createElement('div');
        molecule.className = 'btn-molecule';
        
        // Posição inicial aleatória ao redor do botão
        const rect = parent.getBoundingClientRect();
        const startX = Math.random() * rect.width;
        const startY = Math.random() * rect.height;
        
        molecule.style.left = `${startX}px`;
        molecule.style.top = `${startY}px`;
        
        parent.appendChild(molecule);

        // Pequeno delay para a animação entrar
        requestAnimationFrame(() => {
            molecule.style.opacity = '1';
            
            if (isExplosion) {
                // Voa para longe e some
                const angle = Math.random() * Math.PI * 2;
                const distance = 100 + Math.random() * 100;
                const destX = Math.cos(angle) * distance;
                const destY = Math.sin(angle) * distance;
                
                molecule.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
                molecule.style.opacity = '0';
                molecule.style.transition = 'all 0.8s ease-out';
                
                setTimeout(() => molecule.remove(), 800);
            } else {
                // Fica orbitando sutilmente
                const orbitX = (Math.random() - 0.5) * 60;
                const orbitY = (Math.random() - 0.5) * 60;
                molecule.style.transform = `translate(${orbitX}px, ${orbitY}px)`;
            }
        });
    }

});
