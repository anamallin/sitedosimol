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
        document.addEventListener('mousemove', (e) => {
            // Calcular a posição do mouse em relação ao mascote
            const rect = mascotContainer.getBoundingClientRect();
            const mascotCenterX = rect.left + rect.width / 2;
            const mascotCenterY = rect.top + rect.height / 2;
            
            // Movimentação sutil da div inteira
            const xMove = (e.clientX - mascotCenterX) * 0.03;
            const yMove = (e.clientY - mascotCenterY) * 0.03;
            
            mascotContainer.style.transform = `translate(${xMove}px, ${yMove}px)`;
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
        const scriptURL = 'https://script.google.com/macros/s/AKfycbxB2H867vxXwrzIIeIVf59KxiWDZ45tYcTvdgGgmOyNr3EgOs6RTCtC7M1BnCYQxQs1/exec'; 
        
        const submitBtn = document.getElementById('submit-btn');
        const spinner = submitBtn.querySelector('.spinner');
        const btnText = submitBtn.querySelector('span');
        const formMessage = document.getElementById('form-message');

        form.addEventListener('submit', e => {
            e.preventDefault();
            
            if (scriptURL === 'COLE_SEU_LINK_AQUI') {
                showMessage('Erro: O link do Google Sheets ainda não foi configurado pelo administrador.', 'error');
                return;
            }

            // UI Loading State
            submitBtn.disabled = true;
            spinner.style.display = 'block';
            btnText.textContent = 'Enviando...';
            formMessage.style.display = 'none';

            // Coletar dados via FormData
            const formData = new FormData(form);

            fetch(scriptURL, { method: 'POST', body: formData })
                .then(response => {
                    // Após envio bem-sucedido, vai para a página de escolha de planos
                    window.location.href = 'planos.html';
                })
                .catch(error => {
                    console.error('Erro!', error.message);
                    showMessage('Ocorreu um erro ao enviar sua inscrição. Tente novamente mais tarde.', 'error');
                })
                .finally(() => {
                    // Restaurar UI
                    submitBtn.disabled = false;
                    spinner.style.display = 'none';
                    btnText.textContent = 'Confirmar Inscrição';
                });
        });

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
        const uploadScriptURL = 'https://script.google.com/macros/s/AKfycbxB2H867vxXwrzIIeIVf59KxiWDZ45tYcTvdgGgmOyNr3EgOs6RTCtC7M1BnCYQxQs1/exec'; 

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

});
