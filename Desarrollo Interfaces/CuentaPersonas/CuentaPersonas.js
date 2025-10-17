document.addEventListener('DOMContentLoaded', () => {
            // Referencias a los elementos del DOM - Contadores
            const totalDisplay = document.getElementById('total-display');
            const totalTexto = document.getElementById('total-texto');
            const hombresDisplay = document.getElementById('hombres-display');
            const hombresTexto = document.getElementById('hombres-texto');
            const hombresMasBtn = document.getElementById('hombres-mas');
            const hombresMenosBtn = document.getElementById('hombres-menos');
            const mujeresDisplay = document.getElementById('mujeres-display');
            const mujeresTexto = document.getElementById('mujeres-texto');
            const mujeresMasBtn = document.getElementById('mujeres-mas');
            const mujeresMenosBtn = document.getElementById('mujeres-menos');
            const resetBtn = document.getElementById('reset');
            
            // Referencias a los elementos del DOM - Gemini
            const geminiBtn = document.getElementById('gemini-suggester');
            const suggestionContainer = document.getElementById('suggestion-container');
            const suggestionText = document.getElementById('suggestion-text');
            const loader = document.getElementById('loader');

            // Referencias a los elementos del DOM - Configuración
            const menuToggle = document.getElementById('menu-toggle');
            const sidebar = document.getElementById('sidebar');
            const bgFileInput = document.getElementById('bg-file-input');
            const bgUrlInput = document.getElementById('bg-url-input');
            const applyBgBtn = document.getElementById('apply-bg-btn');
            const themeToggleBtn = document.getElementById('theme-toggle-btn');
            const hombresColorPicker = document.getElementById('hombres-color-picker');
            const mujeresColorPicker = document.getElementById('mujeres-color-picker');


            // Estado inicial
            let hombresCount = 0;
            let mujeresCount = 0;

            // --- LÓGICA DE CONTADORES ---

            function actualizarUI() {
                const totalCount = hombresCount + mujeresCount;
                totalDisplay.textContent = totalCount;
                hombresDisplay.textContent = hombresCount;
                mujeresDisplay.textContent = mujeresCount;
                totalTexto.textContent = (totalCount === 1) ? 'persona' : 'personas';
                hombresTexto.textContent = (hombresCount === 1) ? 'persona' : 'personas';
                mujeresTexto.textContent = (mujeresCount === 1) ? 'persona' : 'personas';
                hombresMenosBtn.disabled = (hombresCount === 0);
                mujeresMenosBtn.disabled = (mujeresCount === 0);
                geminiBtn.disabled = (totalCount === 0);
            }
            
            hombresMasBtn.addEventListener('click', () => { hombresCount++; actualizarUI(); });
            hombresMenosBtn.addEventListener('click', () => { if (hombresCount > 0) { hombresCount--; actualizarUI(); } });
            mujeresMasBtn.addEventListener('click', () => { mujeresCount++; actualizarUI(); });
            mujeresMenosBtn.addEventListener('click', () => { if (mujeresCount > 0) { mujeresCount--; actualizarUI(); } });
            resetBtn.addEventListener('click', () => {
                hombresCount = 0;
                mujeresCount = 0;
                suggestionContainer.classList.add('hidden');
                suggestionText.textContent = '';
                actualizarUI();
            });
            
            // --- LÓGICA DE GEMINI ---
            
            async function getGroupSuggestion() {
                suggestionContainer.classList.remove('hidden');
                suggestionText.textContent = '';
                loader.style.display = 'block';
                geminiBtn.disabled = true;

                const userQuery = `Eres un planificador de eventos muy creativo. Para un grupo de ${hombresCount} hombres y ${mujeresCount} mujeres, sugiere una actividad divertida y apropiada. La sugerencia debe ser breve (una o dos frases) y amigable. Responde siempre en español.`;
                const apiKey = ""; 
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                
                const payload = { contents: [{ parts: [{ text: userQuery }] }], };

                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!response.ok) { throw new Error(`Error en la API: ${response.statusText}`); }
                    const result = await response.json();
                    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                    suggestionText.textContent = text || 'No se pudo obtener una sugerencia. Inténtalo de nuevo.';
                } catch (error) {
                    console.error("Error al llamar a la API de Gemini:", error);
                    suggestionText.textContent = 'Hubo un problema de conexión. Revisa la consola para más detalles.';
                } finally {
                    loader.style.display = 'none';
                    geminiBtn.disabled = false;
                }
            }

            geminiBtn.addEventListener('click', getGroupSuggestion);


            // --- LÓGICA DE CONFIGURACIÓN ---
            
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
            
            themeToggleBtn.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                const isDarkMode = document.body.classList.contains('dark-theme');
                themeToggleBtn.textContent = isDarkMode ? 'Activar Modo Claro' : 'Activar Modo Oscuro';
            });
            
            function setBackgroundImage(url) {
                document.body.style.backgroundImage = `url('${url}')`;
            }

            bgFileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setBackgroundImage(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });

            applyBgBtn.addEventListener('click', () => {
                const url = bgUrlInput.value.trim();
                if (url) {
                    setBackgroundImage(url);
                }
            });

            hombresColorPicker.addEventListener('input', (e) => {
                document.documentElement.style.setProperty('--color-hombres', e.target.value);
            });
            
            mujeresColorPicker.addEventListener('input', (e) => {
                document.documentElement.style.setProperty('--color-mujeres', e.target.value);
            });


            // Llamada inicial para establecer el estado de la UI
            actualizarUI();
        });
