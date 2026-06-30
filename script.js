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

            // Usando requestAnimationFrame implicitamente ao nÃ£o sobrecarregar, mas para melhor performance:
            layer.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
        });
    });
    // Mascot Interaction
    const mascotContainer = document.querySelector('.mascot-container');
    const mascotImg = document.querySelector('.mascot-protein');

    if (mascotContainer && mascotImg) {
        const floatingIcons = mascotContainer.querySelectorAll('.floating-icon');

        document.addEventListener('mousemove', (e) => {
            // Calcular a posiÃ§Ã£o do mouse em relaÃ§Ã£o ao mascote
            const rect = mascotContainer.getBoundingClientRect();
            const mascotCenterX = rect.left + rect.width / 2;
            const mascotCenterY = rect.top + rect.height / 2;

            // MovimentaÃ§Ã£o sutil da div inteira
            const xMove = (e.clientX - mascotCenterX) * 0.03;
            const yMove = (e.clientY - mascotCenterY) * 0.03;
            mascotContainer.style.transform = `translate(${xMove}px, ${yMove}px)`;

            // MovimentaÃ§Ã£o independente dos Ã­cones atrÃ¡s (efeito parallax)
            floatingIcons.forEach((icon, index) => {
                const factor = (index + 1) * 0.05; // Fatores diferentes para cada Ã­cone
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
        // URL do Web App Apps Script (deploy fornecido)
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzIqzvbnUxu2Yq2-ve_9CbsN_jhYQupkJAnrcgeOGSOXqU5PF8nO7-l6NotNJyz5hHvAg/exec';

        const submitBtn = document.getElementById('submit-btn');
        const spinner = submitBtn.querySelector('.spinner');
        const btnText = submitBtn.querySelector('span');
        const formMessage = document.getElementById('form-message');
        const SOLD_OUT_MESSAGE = 'inscriÃ§Ãµes esgotadas';
        // Modal de aviso prÃ©-pagamento
        const avisoPagamentoModal = document.getElementById('aviso-pagamento-modal');
        const confirmPagamentoBtn = document.getElementById('confirm-pagamento-btn');
        const cancelPagamentoBtn = document.getElementById('cancel-pagamento-btn');
        const confirmSpinner = document.getElementById('confirm-spinner');
        const confirmBtnText = confirmPagamentoBtn ? confirmPagamentoBtn.querySelector('span') : null;
        const pendingRegistrationRaw = localStorage.getItem('simol_registration_data');

        if (pendingRegistrationRaw && formMessage) {
            try {
                const pendingRegistration = JSON.parse(pendingRegistrationRaw);
                if (pendingRegistration && (pendingRegistration.nome || pendingRegistration.NOME) && (pendingRegistration.CPF || pendingRegistration.cpf)) {
                    const resumeBox = document.createElement('div');
                    resumeBox.className = 'form-message success';
                    resumeBox.style.display = 'block';
                    resumeBox.style.marginBottom = '18px';
                    resumeBox.innerHTML = `
                        <strong>Inscricao pendente encontrada.</strong><br>
                        Voce pode continuar para enviar o comprovante sem preencher tudo novamente.
                        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
                            <button type="button" id="resume-registration-btn" class="submit-btn" style="width:auto; margin:0; padding:10px 16px;">Continuar pagamento</button>
                            <button type="button" id="clear-registration-draft-btn" class="back-btn" style="border:none; background:transparent; cursor:pointer; margin:0; padding:10px 0;">Descartar rascunho</button>
                        </div>
                    `;
                    form.parentNode.insertBefore(resumeBox, form);

                    document.getElementById('resume-registration-btn').addEventListener('click', () => {
                        window.location.href = 'planos.html';
                    });
                    document.getElementById('clear-registration-draft-btn').addEventListener('click', () => {
                        localStorage.removeItem('simol_registration_data');
                        localStorage.removeItem('simol_tipo_inscricao');
                        localStorage.removeItem('simol_programa_pos');
                        localStorage.removeItem('simol_cpf');
                        localStorage.removeItem('simol_isento');
                        localStorage.removeItem('simol_tamanho_camiseta');
                        resumeBox.remove();
                    });
                }
            } catch (err) {
                console.error('Erro ao recuperar inscricao pendente:', err);
            }
        }

        // Ao submeter o formulÃ¡rio, mostra o modal de aviso primeiro
        form.addEventListener('submit', e => {
            e.preventDefault();

            if (scriptURL === 'COLE_SEU_LINK_AQUI') {
                showMessage('Erro: O link do Google Sheets ainda nÃ£o foi configurado pelo administrador.', 'error');
                return;
            }

            // Valida o formulÃ¡rio nativamente antes de abrir o modal
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);

            // Abre o modal de aviso
            avisoPagamentoModal.style.display = 'flex';
        });

        // BotÃ£o cancelar: fecha o modal
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

        // BotÃ£o confirmar: envia os dados
        if (confirmPagamentoBtn) {
            confirmPagamentoBtn.addEventListener('click', () => {
                // UI Loading State
                confirmPagamentoBtn.disabled = true;
                confirmSpinner.style.display = 'block';
                confirmBtnText.textContent = 'Enviando...';

                // Coletar dados via FormData
                const formData = new FormData(form);
                const cpfValue = formData.get('CPF') ? formData.get('CPF').replace(/\D/g, '').padStart(11, '0') : '';

                if (!cpfValue) {
                    avisoPagamentoModal.style.display = 'none';
                    showMessage('CPF invÃ¡lido ou nÃ£o informado.', 'error');
                    confirmPagamentoBtn.disabled = false;
                    confirmSpinner.style.display = 'none';
                    confirmBtnText.textContent = 'Entendi, prosseguir para pagamento';
                    return;
                }

                // Verifica se o CPF jÃ¡ estÃ¡ cadastrado antes de prosseguir
                fetch(`${scriptURL}?action=checarCpf&cpf=${cpfValue}`)
                    .then(response => response.json())
                    .then(result => {
                        if (result.encontrado) {
                            avisoPagamentoModal.style.display = 'none';
                            showMessage('Este CPF jÃ¡ possui uma inscriÃ§Ã£o cadastrada.', 'error');
                            confirmPagamentoBtn.disabled = false;
                            confirmSpinner.style.display = 'none';
                            confirmBtnText.textContent = 'Entendi, prosseguir para pagamento';
                        } else if (result.inscricoesAbertas === false) {
                            avisoPagamentoModal.style.display = 'none';
                            showMessage(SOLD_OUT_MESSAGE, 'error');
                            confirmPagamentoBtn.disabled = false;
                            confirmSpinner.style.display = 'none';
                            confirmBtnText.textContent = 'Entendi, prosseguir para pagamento';
                        } else {
                            // Salvar os dados do formulÃ¡rio localmente para enviar junto com o comprovante de pagamento
                            const regData = {};
                            for (let [key, val] of formData.entries()) {
                                if (key === 'RESTRICAO_ALIMENTAR') {
                                    if (!regData[key]) regData[key] = [];
                                    regData[key].push(val);
                                } else {
                                    regData[key] = val;
                                }
                            }
                            localStorage.setItem('simol_registration_data', JSON.stringify(regData));

                            // Salvar o tipo, o programa e o CPF da inscriÃ§Ã£o para ajustar as prÃ³ximas pÃ¡ginas
                            localStorage.setItem('simol_tipo_inscricao', formData.get('TIPO_INSCRICAO'));
                            const programaPos = formData.get('PROGRAMA_POS');
                            if (programaPos) {
                                localStorage.setItem('simol_programa_pos', programaPos);
                            } else {
                                localStorage.removeItem('simol_programa_pos');
                            }
                            localStorage.setItem('simol_cpf', cpfValue);

                            // Redireciona para planos.html sem mandar pro Sheets ainda
                            window.location.href = 'planos.html';
                        }
                    })
                    .catch(error => {
                        console.error('Erro na verificaÃ§Ã£o de CPF!', error.message);
                        avisoPagamentoModal.style.display = 'none';
                        showMessage('Ocorreu um erro ao verificar sua inscriÃ§Ã£o. Tente novamente mais tarde.', 'error');
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

    // Upload de Arquivo (PÃ¡gina de Pagamento)
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');
        const fileNameDisplay = document.getElementById('file-name');

        const uploadBtn = document.getElementById('upload-btn');
        const uploadSpinner = uploadBtn.querySelector('.spinner');
        const uploadBtnText = uploadBtn.querySelector('span');
        const uploadMessage = document.getElementById('upload-message');
        const REGISTRATION_DATA_KEY = 'simol_registration_data';

        // Desabilitar botÃ£o por padrÃ£o
        uploadBtn.disabled = true;

        let selectedFile = null;
        let uploadCompleted = false; // Rastrear se o upload foi concluÃ­do com sucesso

        // URL do Web App Apps Script (deploy fornecido) - usado para uploads
        const uploadScriptURL = 'https://script.google.com/macros/s/AKfycbzIqzvbnUxu2Yq2-ve_9CbsN_jhYQupkJAnrcgeOGSOXqU5PF8nO7-l6NotNJyz5hHvAg/exec';

        function getSavedRegistrationData() {
            try {
                return JSON.parse(localStorage.getItem(REGISTRATION_DATA_KEY) || '{}') || {};
            } catch (err) {
                console.error('Erro ao recuperar dados da inscricao:', err);
                return {};
            }
        }

        function appendSavedRegistrationData(formData) {
            const savedData = getSavedRegistrationData();
            Object.keys(savedData).forEach(key => {
                const value = Array.isArray(savedData[key]) ? savedData[key].join(', ') : savedData[key];
                if (value !== undefined && value !== null && value !== '') {
                    formData.append(key, value);
                }
            });
            return savedData;
        }

        const savedRegistrationData = getSavedRegistrationData();
        const savedNome = savedRegistrationData.nome || savedRegistrationData.NOME || '';
        const savedCpf = savedRegistrationData.CPF || savedRegistrationData.cpf || localStorage.getItem('simol_cpf') || '';
        const nomeInputUpload = document.getElementById('upload-nome');
        const cpfHiddenUpload = document.getElementById('cpf-hidden');
        if (nomeInputUpload && savedNome && !nomeInputUpload.value) nomeInputUpload.value = savedNome;
        if (cpfHiddenUpload && savedCpf && !cpfHiddenUpload.value) cpfHiddenUpload.value = savedCpf.toString().replace(/\D/g, '').padStart(11, '0');

        if (!savedNome || !savedCpf) {
            showUploadMessage('Nao encontrei os dados da inscricao neste aparelho. Volte ao formulario de inscricao e preencha novamente antes de enviar o comprovante.', 'error');
        }

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
                uploadBtn.disabled = false; // Habilitar botÃ£o
            }
        }

        uploadForm.addEventListener('submit', e => {
            e.preventDefault();

            if (uploadScriptURL === 'COLE_SEU_LINK_AQUI') {
                showUploadMessage('Erro: O link do Google Sheets ainda nÃ£o foi configurado pelo administrador.', 'error');
                return;
            }

            if (!selectedFile) {
                showUploadMessage('Por favor, selecione um arquivo de comprovante.', 'error');
                return;
            }

            const pendingRegistrationData = getSavedRegistrationData();
            const pendingNome = pendingRegistrationData.nome || pendingRegistrationData.NOME || '';
            const pendingCpf = pendingRegistrationData.CPF || pendingRegistrationData.cpf || localStorage.getItem('simol_cpf') || '';
            if (!pendingNome || !pendingCpf) {
                showUploadMessage('Nao foi possivel finalizar porque os dados da inscricao nao foram encontrados neste aparelho. Volte ao formulario de inscricao e preencha novamente; a planilha so sera atualizada depois do comprovante.', 'error');
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
                const tipoInscricao = tipoInscricaoInput ? tipoInscricaoInput.value : 'PadrÃ£o';

                // Montar o formulÃ¡rio que serÃ¡ enviado
                const formData = new URLSearchParams();
                const savedData = appendSavedRegistrationData(formData);
                const cpfFromSavedData = savedData.CPF || savedData.cpf || '';
                const nomeFinal = savedData.nome || savedData.NOME || nome;
                formData.append('nome', nomeFinal);
                formData.append('tipo', tipoInscricao);
                const programaPosInput = document.getElementById('programa-pos');
                if (programaPosInput && programaPosInput.value) {
                    formData.append('PROGRAMA_POS', programaPosInput.value);
                }

                const produtosInput = document.getElementById('produtos-selecionados');
                if (produtosInput && produtosInput.value) {
                    formData.append('PRODUTOS', produtosInput.value);
                }

                const tamanhoInput = document.getElementById('tamanho-camiseta-hidden');
                if (tamanhoInput && tamanhoInput.value) {
                    formData.append('TAMANHO_CAMISETA', tamanhoInput.value);
                }
                const cpfInput = document.getElementById('cpf-hidden');
                if (cpfInput && cpfInput.value) {
                    formData.append('cpf', cpfInput.value);
                } else if (cpfFromSavedData) {
                    formData.append('cpf', cpfFromSavedData);
                }

                formData.append('filename', selectedFile.name);
                formData.append('mimeType', selectedFile.type);
                formData.append('fileData', base64Data);
                // Campo especial para o script saber que Ã© um upload
                formData.append('action', 'upload');

                fetch(uploadScriptURL, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'error') {
                        throw new Error(data.message || data.error || 'Ocorreu um erro ao enviar o comprovante.');
                    }
                    uploadCompleted = true; // Marcar como concluÃ­do
                    showUploadMessage('Comprovante enviado com sucesso! Sua inscriÃ§Ã£o serÃ¡ confirmada em breve.', 'success');
                    uploadForm.reset();
                    selectedFile = null;
                    fileNameDisplay.textContent = '';
                    localStorage.removeItem(REGISTRATION_DATA_KEY);
                    localStorage.removeItem('simol_tipo_inscricao');
                    localStorage.removeItem('simol_programa_pos');
                    localStorage.removeItem('simol_cpf');
                    localStorage.removeItem('simol_isento');
                    localStorage.removeItem('simol_tamanho_camiseta');
                })
                .catch(error => {
                    console.error('Erro!', error.message);
                    showUploadMessage(error.message || 'Ocorreu um erro ao enviar o comprovante. Tente novamente mais tarde.', 'error');
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

        // Impedir navegaÃ§Ã£o sem enviar o comprovante (OBRIGATÃ“RIO)
        window.addEventListener('beforeunload', (e) => {
            if (!uploadCompleted) {
                // Uma vez na pÃ¡gina de pagamento, DEVE enviar o comprovante
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Bloquear links de navegaÃ§Ã£o
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && !uploadCompleted) {
                // Se hÃ¡ arquivo selecionado mas nÃ£o foi enviado
                e.preventDefault();
                showUploadMessage('âš ï¸ COMPROVANTE OBRIGATÃ“RIO: Por favor, anexe e envie seu comprovante antes de sair desta pÃ¡gina.', 'error');
                return false;
            }
        });
    }

    // LÃ³gica do Modal de Aviso na PÃ¡gina Inicial
    const openAvisoBtn = document.getElementById('open-aviso-btn');
    const avisoModal = document.getElementById('aviso-modal');

    if (openAvisoBtn && avisoModal) {
        const closeModalBtn = document.getElementById('close-modal-btn');
        const agreeCheckbox = document.getElementById('agree-checkbox');
        const proceedBtn = document.getElementById('proceed-btn');

        function closeAvisoModal() {
            avisoModal.style.display = 'none';
            agreeCheckbox.checked = false;
            proceedBtn.disabled = true;
            proceedBtn.style.opacity = '0.5';
            proceedBtn.style.cursor = 'not-allowed';
        }

        // Abre o modal de aviso
        openAvisoBtn.addEventListener('click', () => {
            avisoModal.style.display = 'flex';
        });

        // Fecha o modal pelo botÃ£o Cancelar
        closeModalBtn.addEventListener('click', () => {
            closeAvisoModal();
        });

        // Fecha o modal se clicar fora dele (no fundo escuro)
        window.addEventListener('click', (e) => {
            if (e.target === avisoModal) {
                closeAvisoModal();
            }
        });

        // Habilita o botÃ£o apenas se o checkbox estiver marcado
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

        // Redireciona para a pÃ¡gina de inscriÃ§Ã£o ao clicar em prosseguir
        proceedBtn.addEventListener('click', () => {
            window.location.href = 'inscricao.html';
        });
    }

    // ========================================
    // LÃ³gica da PÃ¡gina - Festa de Encerramento
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

        // URL do Google Apps Script (mesmo jÃ¡ usado no projeto)
        const festaScriptURL = 'https://script.google.com/macros/s/AKfycbzIqzvbnUxu2Yq2-ve_9CbsN_jhYQupkJAnrcgeOGSOXqU5PF8nO7-l6NotNJyz5hHvAg/exec';

        let selectedOption = null;

        // CPF: aceitar apenas nÃºmeros
        cpfInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 11);
        });

        // SeleÃ§Ã£o de cards
        function selectOption(option) {
            selectedOption = option;
            cardInscrito.classList.toggle('selected', option === 'inscrito');
            cardExterno.classList.toggle('selected', option === 'externo');

            // Mostrar formulÃ¡rio
            formSection.classList.add('visible');
            verifyStatus.style.display = 'none';
            paymentSection.classList.remove('visible');

            if (option === 'inscrito') {
                formTitle.textContent = 'Verifique sua InscriÃ§Ã£o';
                nomeInput.placeholder = 'Nome completo conforme usado na inscriÃ§Ã£o';
                verifyBtn.style.display = 'flex';
                proceedFestaBtn.style.display = 'none';
                document.getElementById('festa-external-fields').style.display = 'none';
            } else {
                formTitle.textContent = 'Seus Dados';
                nomeInput.placeholder = 'Seu nome completo';
                verifyBtn.style.display = 'none';
                proceedFestaBtn.style.display = 'flex';
                document.getElementById('festa-external-fields').style.display = 'block';
            }
        }

        cardInscrito.addEventListener('click', () => selectOption('inscrito'));
        cardExterno.addEventListener('click', () => selectOption('externo'));

        // BotÃ£o prosseguir (externo â€” sem verificaÃ§Ã£o)
        proceedFestaBtn.addEventListener('click', () => {
            const nome = nomeInput.value.trim();
            const cpf = cpfInput.value.trim();
            const email = document.getElementById('festa-email').value.trim();
            const telefone = document.getElementById('festa-telefone').value.trim();

            if (!nome || cpf.length < 11 || !email || !telefone) {
                verifyStatus.textContent = 'Por favor, preencha todos os campos (Nome, CPF, E-mail e Telefone) corretamente.';
                verifyStatus.className = 'verify-status error';
                verifyStatus.style.display = 'block';
                return;
            }
            verifyStatus.style.display = 'none';
            showPayment('60,00', 'Externo', nome, cpf, email, telefone);
        });

        // BotÃ£o verificar inscriÃ§Ã£o
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
                        verifyStatus.textContent = 'âœ… InscriÃ§Ã£o encontrada! Prossiga com o pagamento abaixo.';
                        verifyStatus.className = 'verify-status success';
                        verifyStatus.style.display = 'block';
                        showPayment('50,00', 'Inscrito SIMOL', nome, cpf);
                    } else {
                        verifyStatus.innerHTML = 'âŒ InscriÃ§Ã£o nÃ£o encontrada. Verifique se o nome e CPF estÃ£o iguais aos usados na inscriÃ§Ã£o.<br><small style="margin-top:8px;display:inline-block;">Se preferir, selecione a opÃ§Ã£o "Quero apenas participar da festa" (R$ 60,00).</small>';
                        verifyStatus.className = 'verify-status error';
                        verifyStatus.style.display = 'block';
                        paymentSection.classList.remove('visible');
                    }
                })
                .catch(error => {
                    console.error('Erro na verificaÃ§Ã£o:', error);
                    verifyStatus.textContent = 'Erro ao verificar. Tente novamente mais tarde.';
                    verifyStatus.className = 'verify-status error';
                    verifyStatus.style.display = 'block';
                })
                .finally(() => {
                    verifyBtn.disabled = false;
                    verifyBtnText.textContent = 'Verificar InscriÃ§Ã£o';
                    verifySpinner.style.display = 'none';
                });
        });

        function showPayment(valor, tipo, nome, cpf, email = '', telefone = '') {
            valorTag.textContent = 'R$ ' + valor;
            document.getElementById('festa-tipo').value = tipo;
            document.getElementById('festa-valor').value = valor;
            document.getElementById('festa-nome-hidden').value = nome;
            document.getElementById('festa-cpf-hidden').value = cpf;

            // Adicionando campos ocultos para email e telefone se nÃ£o existirem
            let emailHidden = document.getElementById('festa-email-hidden');
            if (!emailHidden) {
                emailHidden = document.createElement('input');
                emailHidden.type = 'hidden';
                emailHidden.id = 'festa-email-hidden';
                festaUploadForm.appendChild(emailHidden);
            }
            emailHidden.value = email;

            let telHidden = document.getElementById('festa-telefone-hidden');
            if (!telHidden) {
                telHidden = document.createElement('input');
                telHidden.type = 'hidden';
                telHidden.id = 'festa-telefone-hidden';
                festaUploadForm.appendChild(telHidden);
            }
            telHidden.value = telefone;

            paymentSection.classList.add('visible');
            // Scroll suave atÃ© a seÃ§Ã£o de pagamento
            setTimeout(() => {
                paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        // Upload de comprovante â€” Festa
        const festaUploadForm = document.getElementById('festa-upload-form');
        const festaDropArea = document.getElementById('festa-drop-area');
        const festaFileInput = document.getElementById('festa-file-input');
        const festaFileName = document.getElementById('festa-file-name');
        const festaUploadBtn = document.getElementById('festa-upload-btn');
        const festaUploadSpinner = festaUploadBtn.querySelector('.spinner');
        const festaUploadBtnText = festaUploadBtn.querySelector('span');
        const festaUploadMessage = document.getElementById('festa-upload-message');

        // Desabilitar botÃ£o por padrÃ£o
        festaUploadBtn.disabled = true;

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
                festaUploadBtn.disabled = false; // Habilitar botÃ£o
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
                const email = document.getElementById('festa-email-hidden') ? document.getElementById('festa-email-hidden').value : '';
                const telefone = document.getElementById('festa-telefone-hidden') ? document.getElementById('festa-telefone-hidden').value : '';

                const formData = new URLSearchParams();
                formData.append('action', 'uploadFesta');
                formData.append('nome', nome);
                formData.append('cpf', cpf);
                formData.append('tipo', tipo);
                formData.append('valor', valor);
                formData.append('email', email);
                formData.append('telefone', telefone);
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
        // Criar molÃ©culas no hover
        btn.addEventListener('mouseenter', () => {
            for (let i = 0; i < 4; i++) {
                createMolecule(btn, false);
            }
        });

        // Remover molÃ©culas ao sair
        btn.addEventListener('mouseleave', () => {
            const molecules = btn.querySelectorAll('.btn-molecule');
            molecules.forEach(m => {
                m.style.opacity = '0';
                setTimeout(() => m.remove(), 300);
            });
        });

        // Efeito de explosÃ£o no Click (funciona no celular tambÃ©m)
        btn.addEventListener('click', () => {
            for (let i = 0; i < 10; i++) {
                createMolecule(btn, true);
            }
        });
    });

    function createMolecule(parent, isExplosion) {
        const molecule = document.createElement('div');
        molecule.className = 'btn-molecule';

        // PosiÃ§Ã£o inicial aleatÃ³ria ao redor do botÃ£o
        const rect = parent.getBoundingClientRect();
        const startX = Math.random() * rect.width;
        const startY = Math.random() * rect.height;

        molecule.style.left = `${startX}px`;
        molecule.style.top = `${startY}px`;

        parent.appendChild(molecule);

        // Pequeno delay para a animaÃ§Ã£o entrar
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

    // Copiar chave PIX (botÃ£o de copiar em pagamento.html)
    (function setupCopyPix() {
        const copyBtn = document.getElementById('copy-pix-btn');
        const pixEl = document.getElementById('pix-key');
        if (!copyBtn || !pixEl) return;

        const originalContent = copyBtn.innerHTML;

        copyBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const text = pixEl.textContent.trim();
            if (!text) return;

            // Tentar Clipboard API
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                } else {
                    // Fallback
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                }

                copyBtn.textContent = 'Copiado!';
                copyBtn.disabled = true;
                showToast('Chave PIX copiada');
                setTimeout(() => {
                    copyBtn.disabled = false;
                    copyBtn.innerHTML = originalContent;
                }, 2000);
            } catch (err) {
                console.error('Erro ao copiar PIX:', err);
                copyBtn.textContent = 'Erro';
                showToast('Erro ao copiar');
                setTimeout(() => { copyBtn.innerHTML = originalContent; }, 2000);
            }
        });
    })();

    // FunÃ§Ã£o utilitÃ¡ria para mostrar um toast simples
    function showToast(message) {
        const toast = document.getElementById('copy-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.style.transition = '';
        toast.style.opacity = '1';
        toast.style.display = 'block';
        // ForÃ§ar reflow para garantir transiÃ§Ã£o
        void toast.offsetWidth;
        toast.style.transition = 'opacity 300ms ease';
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        }, 1700);
    }

});
