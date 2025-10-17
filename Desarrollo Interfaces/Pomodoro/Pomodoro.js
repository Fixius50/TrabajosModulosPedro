// Referencias a los elementos del DOM
        const setupContainer = document.getElementById('setup-container');
        const pomodoroContainer = document.getElementById('pomodoro-container');
        const createForm = document.getElementById('create-form');
        const joinForm = document.getElementById('join-form');
        const timerDisplay = document.getElementById('timer-display');
        const startPauseBtn = document.getElementById('start-pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const mainTitle = document.getElementById('main-title');
        const resetPomodoroBtn = document.getElementById('reset-pomodoro-btn');
        const chipsCountSpan = document.getElementById('chips-count');
        const gamblingCard = document.getElementById('gambling-card');
        const playGameBtn = document.getElementById('play-game-btn');

        
        // Ruleta
        const rouletteOverlay = document.getElementById('roulette-overlay');
        const rouletteWheel = document.getElementById('roulette-wheel');
        const rouletteResult = document.getElementById('roulette-result');
        const betAmountRoulette = document.getElementById('bet-amount-roulette');
        const closeRouletteBtn = document.getElementById('close-roulette-btn');
        
        // Póker
        const pokerOverlay = document.getElementById('poker-overlay');
        const pokerHandEl = document.getElementById('poker-hand');
        const pokerResultEl = document.getElementById('poker-result');
        const pokerDealBtn = document.getElementById('poker-deal-btn');
        const pokerDrawBtn = document.getElementById('poker-draw-btn');
        const betAmountPoker = document.getElementById('bet-amount-poker');
        const closePokerBtn = document.getElementById('close-poker-btn');

        // Tienda (NUEVAS REFERENCIAS)
        const openShopBtn = document.getElementById('open-shop-btn');
        const shopOverlay = document.getElementById('shop-overlay');
        const closeShopBtn = document.getElementById('close-shop-btn');
        const shopChipsCount = document.getElementById('shop-chips-count');
        const chipsToRedeemInput = document.getElementById('chips-to-redeem');
        const realMoneyDisplay = document.getElementById('real-money-display');
        const bankAccountInput = document.getElementById('bank-account');
        const redeemChipsBtn = document.getElementById('redeem-chips-btn');


        const roomCodeEl = document.getElementById('room-code');
        const playerCardsContainer = document.getElementById('player-cards-container');
        const simulateJoinBtn = document.getElementById('simulate-join-btn');
        
        // Pestañas
        const createTabBtn = document.getElementById('create-tab-btn');
        const joinTabBtn = document.getElementById('join-tab-btn');
        const createContent = document.getElementById('create-content');
        const joinContent = document.getElementById('join-content');
        const publicRoomsList = document.getElementById('public-rooms-list');


        // Herramientas y Apuntes
        const backToMainBtn = document.getElementById('back-to-main-btn');
        const toggleNotesBtn = document.getElementById('toggle-notes-btn');
        const notesContainer = document.getElementById('notes-container');
        const notesTextarea = document.getElementById('notes-textarea');
        const resumeSessionContainer = document.getElementById('resume-session-container');

        // Equipos
        const createTeamBtn = document.getElementById('create-team-btn');
        const teamNameInput = document.getElementById('team-name-input');
        const teamListEl = document.getElementById('team-list');
        const bankDisplaySpan = document.querySelector('#bank-display span');
        const joinRequestsContainer = document.getElementById('join-requests-container');
        const joinRequestsList = document.getElementById('join-requests-list');
        const invitationsContainer = document.getElementById('invitations-container');
        const invitationsList = document.getElementById('invitations-list');

        // Settings
        const settingsToggleBtn = document.getElementById('settings-toggle-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const themeBtns = document.querySelectorAll('.theme-btn');
        const fontColorPicker = document.getElementById('font-color-picker');


        // Team Stats Card
        const teamStatsCard = document.getElementById('team-stats-card');
        const teamStatsName = document.getElementById('team-stats-name');
        const teamStatsTime = document.getElementById('team-stats-time');
        const teamStatsChips = document.getElementById('team-stats-chips');
        const teamStatsMembers = document.getElementById('team-stats-members');
        
        // --- Gemini API Elements ---
        const customAlert = document.getElementById('custom-alert');

        // Variables de estado
        let timerInterval = null;
        let isRunning = false;
        let settings = {};
        let roomData = {
            players: [],
            teams: {}, // { teamId: { name, totalSeconds, isRunning } }
            requests: [], // { playerName, teamId }
            invitations: [], // { targetPlayerName, teamId, teamName }
            bankChips: 0,
            roomCode: '',
            chipsPerInterval: 1,
            chipInterval: 60,
            game: 'roulette'
        };
        // Estado del Póker
        let pokerDeck = [];
        let playerHand = [];

        // --- MANEJO DE PESTAÑAS ---
        createTabBtn.addEventListener('click', () => {
            createTabBtn.classList.add('active');
            joinTabBtn.classList.remove('active');
            createContent.classList.add('active');
            joinContent.classList.remove('active');
        });
        joinTabBtn.addEventListener('click', () => {
            joinTabBtn.classList.add('active');
            createTabBtn.classList.remove('active');
            joinContent.classList.add('active');
            createContent.classList.remove('active');
            renderPublicRooms();
        });

        // --- LÓGICA DEL TEMPORIZADOR Y FICHAS ---
        function formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return [hours, minutes, secs].map(v => v < 10 ? "0" + v : v).join(":");
        }
        
        function distributeChips() {
            roomData.bankChips = 0;
            const playersInTeams = new Set();

            for (const teamId in roomData.teams) {
                const team = roomData.teams[teamId];
                const teamPlayers = roomData.players.filter(p => p.teamId === teamId);
                if (teamPlayers.length === 0) continue;

                teamPlayers.forEach(p => playersInTeams.add(p.name));

                const intervalsPassed = Math.floor(team.totalSeconds / roomData.chipInterval);
                const totalGeneratedChips = intervalsPassed * roomData.chipsPerInterval;
                const chipsPerPlayer = Math.floor(totalGeneratedChips / teamPlayers.length);
                const remainder = totalGeneratedChips % teamPlayers.length;
                roomData.bankChips += remainder;

                teamPlayers.forEach(player => {
                    player.chips = chipsPerPlayer;
                });
            }

            roomData.players.forEach(player => {
                if (!playersInTeams.has(player.name)) {
                    const intervalsPassed = Math.floor((player.totalSeconds || 0) / roomData.chipInterval);
                    const generatedChips = intervalsPassed * roomData.chipsPerInterval;
                    player.chips = generatedChips;
                }
            });
            
            updateUI();
        }

        function updateUI() {
            const me = getMyPlayerData();
            if (!me) return;

            const myTeamId = me.teamId;
            let currentSeconds = me.totalSeconds || 0;
            
            if (myTeamId && roomData.teams[myTeamId]) {
                currentSeconds = roomData.teams[myTeamId].totalSeconds;
            }

            timerDisplay.textContent = formatTime(currentSeconds);
            chipsCountSpan.textContent = me.chips || 0;
            bankDisplaySpan.textContent = roomData.bankChips;
            renderPlayers();
            renderTeams();
            renderJoinRequests();
            renderInvitations();
            updateTeamStatsCard();

            // Control visibility of the gambling card
            if (!isRunning && me.chips > 0) {
                gamblingCard.classList.remove('hidden');
                playGameBtn.textContent = `Jugar a ${roomData.game === 'roulette' ? 'la Ruleta' : 'Póker'}`;
            } else {
                gamblingCard.classList.add('hidden');
            }
        }

        function toggleTimer() {
            const me = getMyPlayerData();
            const myTeamId = me.teamId;

            if (myTeamId) {
                const team = roomData.teams[myTeamId];
                isRunning = !team.isRunning;
                team.isRunning = isRunning;
            } else { // Solo logic
                isRunning = !me.isRunning;
                me.isRunning = isRunning;
            }

            if(isRunning) {
                startPauseBtn.textContent = 'Pausar';
                resetBtn.disabled = true;
            } else {
                startPauseBtn.textContent = 'Continuar';
                resetBtn.disabled = false;
            }
            updateUI();
        }

        function mainTick() {
            let hasActiveTimer = false;
            for (const teamId in roomData.teams) {
                if (roomData.teams[teamId].isRunning) {
                    roomData.teams[teamId].totalSeconds++;
                    hasActiveTimer = true;
                }
            }
            roomData.players.forEach(p => {
                if (!p.teamId && p.isRunning) {
                    p.totalSeconds = (p.totalSeconds || 0) + 1;
                    hasActiveTimer = true;
                }
            });

            if(hasActiveTimer) {
                distributeChips();
            }
        }
        
        function resetTimer() {
             const me = getMyPlayerData();
             if (!me) return;
             const myTeamId = me.teamId;

             if (myTeamId && roomData.teams[myTeamId] && !roomData.teams[myTeamId].isRunning) {
                  roomData.teams[myTeamId].totalSeconds = 0;
             } else if (!myTeamId && !me.isRunning) {
                  me.totalSeconds = 0;
             }
             distributeChips();
             startPauseBtn.textContent = 'Iniciar';
             resetBtn.disabled = true;
        }
        
        // --- LÓGICA DE LA RULETA ---
        const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
        const colors = {
            red: [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3],
            black: [15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26],
            green: [0]
        };

        function buildRouletteWheel() {
            const segmentAngle = 360 / numbers.length;
            let gradientParts = [];
            
            rouletteWheel.innerHTML = ''; // Clear previous numbers

            numbers.forEach((num, index) => {
                let color;
                if (colors.red.includes(num)) color = 'var(--roulette-red)';
                else if (colors.black.includes(num)) color = 'var(--roulette-black)';
                else color = 'var(--roulette-green)';

                gradientParts.push(`${color} ${index * segmentAngle}deg`);
                gradientParts.push(`${color} ${(index + 1) * segmentAngle}deg`);
                
                const numberDiv = document.createElement('div');
                numberDiv.className = 'roulette-number';
                numberDiv.textContent = num;
                numberDiv.style.transform = `rotate(${index * segmentAngle + segmentAngle / 2}deg)`;
                rouletteWheel.appendChild(numberDiv);
            });
            
            rouletteWheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;
        }

        function playRoulette(betColor) {
            const me = getMyPlayerData();
            const betAmount = parseInt(betAmountRoulette.value, 10);
            if (isNaN(betAmount) || betAmount <= 0) { showAlert("Apuesta inválida."); return; }
            if (betAmount > me.chips) { showAlert("No tienes suficientes fichas."); return; }
            
            me.chips -= betAmount;
            rouletteResult.textContent = "La bola está girando...";
            document.querySelectorAll('#roulette-modal .betting-options button').forEach(b => b.disabled = true);

            const randomIndex = Math.floor(Math.random() * numbers.length);
            const winningNumber = numbers[randomIndex];
            let resultColor;
            if (colors.red.includes(winningNumber)) resultColor = 'red';
            else if (colors.black.includes(winningNumber)) resultColor = 'black';
            else resultColor = 'green';
            
            const segmentAngle = 360 / numbers.length;
            const targetAngle = -(randomIndex * segmentAngle + (segmentAngle / 2));
            const randomSpins = Math.floor(Math.random() * 4) + 5; // 5 to 8 spins
            const finalAngle = targetAngle + 360 * randomSpins;

            rouletteWheel.style.transition = 'transform 5s ease-out';
            rouletteWheel.style.transform = `rotate(${finalAngle}deg)`;
            
            setTimeout(() => {
                let winnings = 0;
                if (betColor === resultColor) {
                    winnings = (resultColor === 'green') ? betAmount * 14 : betAmount * 2;
                    rouletteResult.textContent = `¡GANASTE! Salió ${winningNumber} ${resultColor}. Recibes ${winnings} fichas.`;
                    me.chips += winnings;
                } else {
                    rouletteResult.textContent = `Perdiste. Salió ${winningNumber} ${resultColor}.`;
                }
                updateUI();
                saveState();
                document.querySelectorAll('#roulette-modal .betting-options button').forEach(b => b.disabled = false);
            }, 5100);
        }
        
        // --- LÓGICA DEL PÓKER ---
        function createDeck() {
            const suits = ['♥', '♦', '♣', '♠'];
            const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
            pokerDeck = [];
            for (let i = 0; i < suits.length; i++) {
                for (let j = 0; j < ranks.length; j++) {
                    pokerDeck.push({ suit: suits[i], rank: ranks[j], value: values[j] });
                }
            }
        }

        function shuffleDeck() {
            for (let i = pokerDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pokerDeck[i], pokerDeck[j]] = [pokerDeck[j], pokerDeck[i]];
            }
        }

        function renderHand() {
            pokerHandEl.innerHTML = '';
            playerHand.forEach((card, index) => {
                const cardEl = document.createElement('div');
                cardEl.className = 'playing-card';
                cardEl.classList.add((card.suit === '♥' || card.suit === '♦') ? 'red' : 'black');
                cardEl.dataset.index = index;
                cardEl.innerHTML = `
                    <span class="card-rank-top">${card.rank}</span>
                    <span class="card-suit">${card.suit}</span>
                    <span class="card-rank-bottom">${card.rank}</span>
                `;
                cardEl.addEventListener('click', () => {
                    if (pokerDrawBtn.disabled === false) {
                        cardEl.classList.toggle('selected');
                    }
                });
                pokerHandEl.appendChild(cardEl);
            });
        }
        
        function evaluateHand(hand) {
             const payouts = {
                 'Royal Flush': 250, 'Straight Flush': 50, 'Four of a Kind': 25, 'Full House': 9, 'Flush': 6,
                 'Straight': 4, 'Three of a Kind': 3, 'Two Pair': 2, 'Jacks or Better': 1, 'Nothing': 0
             };
             const ranks = hand.map(c => c.value).sort((a,b) => a-b);
             const suits = hand.map(c => c.suit);
             const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
             const counts = Object.values(rankCounts).sort((a,b) => b-a);
             
             const isFlush = new Set(suits).size === 1;
             const isStraight = ranks.every((rank, i) => i === 0 || rank === ranks[i-1] + 1) || JSON.stringify(ranks) === JSON.stringify([2,3,4,5,14]); // Ace-low straight
             
             if (isStraight && isFlush && ranks[4] === 14) return { hand: 'Royal Flush', payout: payouts['Royal Flush']};
             if (isStraight && isFlush) return { hand: 'Straight Flush', payout: payouts['Straight Flush'] };
             if (counts[0] === 4) return { hand: 'Four of a Kind', payout: payouts['Four of a Kind'] };
             if (counts[0] === 3 && counts[1] === 2) return { hand: 'Full House', payout: payouts['Full House'] };
             if (isFlush) return { hand: 'Flush', payout: payouts['Flush'] };
             if (isStraight) return { hand: 'Straight', payout: payouts['Straight'] };
             if (counts[0] === 3) return { hand: 'Three of a Kind', payout: payouts['Three of a Kind'] };
             if (counts[0] === 2 && counts[1] === 2) return { hand: 'Two Pair', payout: payouts['Two Pair'] };
             if (counts[0] === 2 && parseInt(Object.keys(rankCounts).find(key => rankCounts[key] === 2)) >= 11) {
                 return { hand: 'Jacks or Better', payout: payouts['Jacks or Better']};
             }
             return { hand: 'Nothing', payout: 0 };
        }

        pokerDealBtn.addEventListener('click', () => {
            const me = getMyPlayerData();
            const betAmount = parseInt(betAmountPoker.value, 10);

            if (pokerDealBtn.textContent.includes('Nueva')) { // Reset for new hand
                 pokerResultEl.textContent = '';
                 pokerDealBtn.textContent = 'Apostar y Repartir';
                 pokerDrawBtn.disabled = true;
                 pokerHandEl.innerHTML = '';
                 betAmountPoker.disabled = false;
                 return;
            }

            if (isNaN(betAmount) || betAmount <= 0) { showAlert("Apuesta inválida."); return; }
            if (betAmount > me.chips) { showAlert("No tienes suficientes fichas."); return; }
            
            me.chips -= betAmount;
            updateUI();
            saveState();

            createDeck();
            shuffleDeck();
            playerHand = pokerDeck.splice(0, 5);
            renderHand();

            pokerResultEl.textContent = "Selecciona cartas para descartar";
            pokerDealBtn.disabled = true;
            pokerDrawBtn.disabled = false;
            betAmountPoker.disabled = true;
        });
        
        pokerDrawBtn.addEventListener('click', () => {
            const selectedCards = document.querySelectorAll('.playing-card.selected');
            selectedCards.forEach(cardEl => {
                const index = parseInt(cardEl.dataset.index);
                playerHand[index] = pokerDeck.pop();
            });
            
            renderHand();
            
            const betAmount = parseInt(betAmountPoker.value, 10);
            const result = evaluateHand(playerHand);
            const winnings = result.payout * betAmount;

            if (winnings > 0) {
                pokerResultEl.textContent = `${result.hand}! Ganas ${winnings} fichas.`;
                const me = getMyPlayerData();
                me.chips += winnings;
                updateUI();
                saveState();
            } else {
                 pokerResultEl.textContent = `Nada. Inténtalo de nuevo.`;
            }
            
            pokerDrawBtn.disabled = true;
            pokerDealBtn.disabled = false;
            pokerDealBtn.textContent = 'Nueva Mano';
        });

        // --- GESTIÓN DE ESTADO ---
        function saveState() {
              settings.roomData = roomData;
              localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        }

        function getMyPlayerData() {
            return roomData.players.find(p => p.name === settings.playerName);
        }

        // --- LÓGICA DEL LOBBY Y EQUIPOS ---
        function renderPlayers() {
            playerCardsContainer.innerHTML = ''; 
            const me = getMyPlayerData();
            
            roomData.players.forEach(player => {
                const teamName = player.teamId ? roomData.teams[player.teamId].name : 'Sin equipo';
                const card = document.createElement('div');
                card.className = 'player-card';
                card.classList.toggle('leader', player.isLeader);
                
                let actionsHTML = '';
                if (me.isLeader && me.teamId && !player.teamId && player.name !== me.name) {
                     const alreadyInvited = roomData.invitations.some(inv => inv.targetPlayerName === player.name && inv.teamId === me.teamId);
                    if (!alreadyInvited) {
                        actionsHTML = `
                            <div class="actions">
                                <button class="btn btn-secondary" onclick="invitePlayer('${player.name}')">Invitar</button>
                            </div>
                        `;
                    }
                }

                card.innerHTML = `
                    <h4>${player.name}</h4>
                    <p>Fichas: ${player.chips}</p>
                    <p class="player-team-name">${teamName}</p>
                    ${actionsHTML}
                `;
                playerCardsContainer.appendChild(card);
            });
        }
        
        function renderTeams() {
            teamListEl.innerHTML = '';
            for (const teamId in roomData.teams) {
                const team = roomData.teams[teamId];
                const li = document.createElement('li');
                li.className = 'team-item';
                li.innerHTML = `<span>${team.name}</span>`;
                
                const me = getMyPlayerData();
                const hasRequested = roomData.requests.some(req => req.playerName === me.name && req.teamId === teamId);
                if (!me.teamId && !hasRequested) {
                    const requestBtn = document.createElement('button');
                    requestBtn.textContent = 'Solicitar';
                    requestBtn.className = 'btn btn-secondary';
                    requestBtn.onclick = () => requestToJoinTeam(teamId);
                    li.appendChild(requestBtn);
                }
                teamListEl.appendChild(li);
            }
        }

        function renderJoinRequests() {
            const me = getMyPlayerData();
            if (!me || !me.isLeader) {
                joinRequestsContainer.classList.add('hidden');
                return;
            }
            
            const myTeamRequests = roomData.requests.filter(req => req.teamId === me.teamId);

            if(myTeamRequests.length === 0) {
                 joinRequestsContainer.classList.add('hidden');
                 return;
            }

            joinRequestsContainer.classList.remove('hidden');
            joinRequestsList.innerHTML = '';
            myTeamRequests.forEach(req => {
                const li = document.createElement('li');
                li.className = 'request-item';
                li.innerHTML = `<span>${req.playerName}</span>`;
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'actions';
                
                const acceptBtn = document.createElement('button');
                acceptBtn.textContent = 'Aceptar';
                acceptBtn.className = 'btn btn-secondary';
                acceptBtn.onclick = () => acceptRequest(req.playerName);
                
                const declineBtn = document.createElement('button');
                declineBtn.textContent = 'Rechazar';
                declineBtn.className = 'btn btn-danger';
                declineBtn.onclick = () => declineRequest(req.playerName);

                actionsDiv.appendChild(acceptBtn);
                actionsDiv.appendChild(declineBtn);
                li.appendChild(actionsDiv);
                joinRequestsList.appendChild(li);
            });
        }
        
        function renderInvitations() {
            const me = getMyPlayerData();
            const myInvitations = roomData.invitations.filter(inv => inv.targetPlayerName === me.name);

            if(myInvitations.length === 0) {
                invitationsContainer.classList.add('hidden');
                return;
            }
            
            invitationsContainer.classList.remove('hidden');
            invitationsList.innerHTML = '';

            myInvitations.forEach(inv => {
                 const li = document.createElement('li');
                li.className = 'invitation-item';
                li.innerHTML = `<span>${inv.teamName} te invita</span>`;
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'actions';
                
                const acceptBtn = document.createElement('button');
                acceptBtn.textContent = 'Aceptar';
                acceptBtn.className = 'btn btn-secondary';
                acceptBtn.onclick = () => acceptInvitation(inv.teamId);
                
                const declineBtn = document.createElement('button');
                declineBtn.textContent = 'Rechazar';
                declineBtn.className = 'btn btn-danger';
                declineBtn.onclick = () => declineInvitation(inv.teamId);

                actionsDiv.appendChild(acceptBtn);
                actionsDiv.appendChild(declineBtn);
                li.appendChild(actionsDiv);
                invitationsList.appendChild(li);
            });
        }

        function updateTeamStatsCard() {
            const me = getMyPlayerData();
            if (!me || !me.teamId) {
                teamStatsCard.classList.add('hidden');
                return;
            }
            
            const team = roomData.teams[me.teamId];
            const teamPlayers = roomData.players.filter(p => p.teamId === me.teamId);
            const intervalsPassed = Math.floor(team.totalSeconds / roomData.chipInterval);
            const totalTeamChips = intervalsPassed * roomData.chipsPerInterval;

            teamStatsName.textContent = `Estadísticas de ${team.name}`;
            teamStatsTime.textContent = formatTime(team.totalSeconds);
            teamStatsChips.textContent = totalTeamChips;
            teamStatsMembers.textContent = teamPlayers.map(p => p.name).join(', ');
            
            teamStatsCard.classList.remove('hidden');
        }
        
        function createTeam() {
            const name = teamNameInput.value.trim();
            if (!name) { showAlert("El nombre del equipo no puede estar vacío."); return; }
            const me = getMyPlayerData();
            if (me.teamId) { showAlert("Ya estás en un equipo."); return; }

            const teamId = 'team_' + Date.now();
            roomData.teams[teamId] = { name: name, totalSeconds: 0, isRunning: false };
            me.teamId = teamId; // Automatically join the team you create
            teamNameInput.value = '';
            distributeChips();
            saveState();
        }

        function requestToJoinTeam(teamId) {
            const me = getMyPlayerData();
            if (me.teamId) { showAlert("Ya estás en un equipo."); return; }
            roomData.requests.push({ playerName: me.name, teamId: teamId });
            updateUI(); 
            saveState();
        }
        
        function invitePlayer(playerName) {
            const me = getMyPlayerData();
            if (!me.isLeader || !me.teamId) return;
            
            roomData.invitations.push({ targetPlayerName: playerName, teamId: me.teamId, teamName: roomData.teams[me.teamId].name });
            showAlert(`Invitación enviada a ${playerName}.`);
            saveState();
            updateUI();
        }

        function acceptInvitation(teamId) {
            const me = getMyPlayerData();
            me.teamId = teamId;
            roomData.invitations = roomData.invitations.filter(inv => inv.targetPlayerName !== me.name); // Clear all invitations on accept
            distributeChips();
            saveState();
        }

        function declineInvitation(teamId) {
            const me = getMyPlayerData();
            roomData.invitations = roomData.invitations.filter(inv => !(inv.targetPlayerName === me.name && inv.teamId === teamId));
            saveState();
            updateUI();
        }


        function acceptRequest(playerName) {
            const me = getMyPlayerData();
            if (!me.isLeader || !me.teamId) return;

            const playerToJoin = roomData.players.find(p => p.name === playerName);
            if (playerToJoin) {
                playerToJoin.teamId = me.teamId;
            }
            roomData.requests = roomData.requests.filter(req => req.playerName !== playerName);
            distributeChips();
            saveState();
        }

        function declineRequest(playerName) {
            roomData.requests = roomData.requests.filter(req => req.playerName !== playerName);
            updateUI();
            saveState();
        }
        
        function simulatePlayerJoin() {
            const randomNames = ['Vito', 'Sonny', 'Luca', 'Clemenza', 'Tessio'];
            const newPlayer = {
                name: randomNames[Math.floor(Math.random() * randomNames.length)] + roomData.players.length,
                chips: 0,
                teamId: null, 
                totalSeconds: 0, 
                isLeader: false
            };
            roomData.players.push(newPlayer);
            renderPlayers();
        }
        
        function renderPublicRooms() {
            // This is a simulation. In a real app, this data would come from a server.
            const mockPublicRooms = [
                { title: "Estudio para Examen Final", players: 3, code: "EXAM25" },
                { title: "Proyecto de Diseño UX/UI", players: 2, code: "DESIGNUX" },
                { title: "Maratón de Código", players: 5, code: "CODEFEST" },
            ];

            publicRoomsList.innerHTML = '';
            mockPublicRooms.forEach(room => {
                const roomEl = document.createElement('div');
                roomEl.className = 'public-room-item';
                roomEl.innerHTML = `
                    <div class="info">
                        <span>${room.title}</span>
                        <span>${room.players} jugadores</span>
                    </div>
                    <button class="btn btn-secondary join-public-btn">Unirse</button>
                `;
                const joinBtn = roomEl.querySelector('.join-public-btn');
                joinBtn.addEventListener('click', () => {
                     const playerName = document.getElementById('player-name-join').value;
                     if (!playerName.trim()) {
                         showAlert("Por favor, introduce tu nombre de jugador para unirte.");
                         return;
                     }
                    // Simulate joining by creating a new session with the public room's data
                    settings = { playerName, sessionTitle: room.title, speed: 1, chipsPerInterval: 1, chipInterval: 60, game: 'roulette', roomData: null };
                    // For simulation, we create a new room, but in a real app, we'd fetch the room data.
                    startSession();
                });
                publicRoomsList.appendChild(roomEl);
            });
        }

        // --- LÓGICA DE INICIO Y FORMULARIO ---
        function startSession() {
            localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
            mainTitle.textContent = settings.sessionTitle;
            
            if (!settings.roomData) {
                roomData.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                roomData.chipsPerInterval = settings.chipsPerInterval || 1;
                roomData.chipInterval = settings.chipInterval || 60;
                roomData.game = settings.game || 'roulette';
                
                const hostPlayer = { 
                    name: settings.playerName, 
                    chips: 0, 
                    teamId: null, 
                    totalSeconds: 0, 
                    isLeader: true 
                };
                roomData.players = [hostPlayer];
                roomData.teams = {};
                roomData.requests = [];
                roomData.invitations = [];
                roomData.bankChips = 0;
                
                // Randomly pre-create teams
                if (Math.random() < 0.5) { // 50% chance
                    showAlert("¡Han aparecido equipos aleatorios!");
                    const mockTeams = [
                        { id: 'team_alpha', name: 'Los Alfas' },
                        { id: 'team_beta', name: 'Equipo Beta' },
                        { id: 'team_gamma', name: 'Gamma Force' }
                    ];
                    mockTeams.forEach(team => {
                        roomData.teams[team.id] = { name: team.name, totalSeconds: 0, isRunning: false };
                    });
                }

            } else {
                roomData = settings.roomData;
            }
            
            roomCodeEl.textContent = roomData.roomCode;
            
            pomodoroContainer.classList.remove('hidden');
            setupContainer.classList.add('hidden');
            
            clearInterval(timerInterval);
            timerInterval = setInterval(mainTick, 1000 / (settings.speed || 1));
            
            updateUI();
        }

        function checkAndShowResumeOption() {
            const savedSettingsJSON = localStorage.getItem('pomodoroSettings');
            if (savedSettingsJSON) {
                settings = JSON.parse(savedSettingsJSON);
                resumeSessionContainer.innerHTML = `
                    <p>¡Tienes una sesión en curso: <strong>${settings.sessionTitle}</strong>!</p>
                    <button id="resume-btn" class="btn btn-primary">Reanudar Sesión</button>
                    <hr>
                `;
                document.getElementById('resume-btn').addEventListener('click', startSession);
            } else {
                 resumeSessionContainer.innerHTML = '';
                 settings = {}; 
            }
        }
        
        function applyTheme(theme) {
            document.body.dataset.theme = theme;
            localStorage.setItem('appTheme', theme);
        }

        function applyFontColor(color) {
            document.body.style.setProperty('--text-color', color); // CORREGIDO
            localStorage.setItem('appFontColor', color);
        }


        window.addEventListener('load', () => {
            setupContainer.classList.remove('hidden');
            pomodoroContainer.classList.add('hidden');
            checkAndShowResumeOption();
            buildRouletteWheel();

            const savedTheme = localStorage.getItem('appTheme') || 'dark';
            applyTheme(savedTheme);
            
            const savedFontColor = localStorage.getItem('appFontColor');
            if(savedFontColor){
                fontColorPicker.value = savedFontColor;
                applyFontColor(savedFontColor);
            }
        });

        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const playerName = document.getElementById('player-name-create').value;
            const sessionTitle = document.getElementById('session-title').value;
            const speed = parseFloat(document.getElementById('pomodoro-speed').value);
            const chipsPerInterval = parseInt(document.getElementById('chips-per-interval').value, 10);
            const chipInterval = parseInt(document.getElementById('chip-interval').value, 10);
            const game = document.getElementById('game-selection').value;
            
            settings = { playerName, sessionTitle, speed, chipsPerInterval, chipInterval, game, roomData: null };
            startSession();
        });

        joinForm.addEventListener('submit', (e) => {
            e.preventDefault();
              const playerName = document.getElementById('player-name-join').value;
              const roomCode = document.getElementById('room-code-join').value;
              // Basic simulation: just start a new session with this title/code
              settings = { playerName, sessionTitle: `Sala ${roomCode}`, speed: 1, chipsPerInterval: 1, chipInterval: 60, game: 'roulette', roomData: null };
              startSession();
        });
        
        // --- BOTONES DE ACCIÓN ---
        startPauseBtn.addEventListener('click', toggleTimer);
        resetBtn.addEventListener('click', resetTimer);
        createTeamBtn.addEventListener('click', createTeam);

        playGameBtn.addEventListener('click', () => {
            if (roomData.game === 'roulette') {
                rouletteOverlay.classList.remove('hidden');
            } else if (roomData.game === 'poker') {
                pokerOverlay.classList.remove('hidden');
                // Reset poker game state
                pokerDealBtn.textContent = 'Apostar y Repartir';
                pokerDealBtn.disabled = false;
                pokerDrawBtn.disabled = true;
                betAmountPoker.disabled = false;
                pokerResultEl.textContent = '';
                pokerHandEl.innerHTML = '';
            }
        });

        closeRouletteBtn.addEventListener('click', () => rouletteOverlay.classList.add('hidden'));
        closePokerBtn.addEventListener('click', () => pokerOverlay.classList.add('hidden'));


        resetPomodoroBtn.addEventListener('click', () => {
            saveState(); // Guarda el estado de la sesión actual antes de salir
            clearInterval(timerInterval);
            window.location.reload(); // Recarga la página para volver al inicio
        });

        backToMainBtn.addEventListener('click', () => {
            saveState();
            clearInterval(timerInterval);
            pomodoroContainer.classList.add('hidden');
            setupContainer.classList.remove('hidden');
            checkAndShowResumeOption();
        });

        toggleNotesBtn.addEventListener('click', () => notesContainer.classList.toggle('hidden'));
        notesTextarea.addEventListener('input', () => { /* Logic to save notes can be added here */ });
        simulateJoinBtn.addEventListener('click', simulatePlayerJoin);
        
        // --- SETTINGS PANEL ---
        settingsToggleBtn.addEventListener('click', () => {
            settingsPanel.classList.toggle('open');
        });

        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                applyTheme(theme);
            });
        });
        
        fontColorPicker.addEventListener('input', (e) => {
            applyFontColor(e.target.value);
        });

        // --- LÓGICA DE LA TIENDA (NUEVA) ---
        const EXCHANGE_RATE = 100; // 100 fichas = 1€

        function updateRealMoneyDisplay() {
            const chipsToRedeem = parseInt(chipsToRedeemInput.value, 10);
            if (isNaN(chipsToRedeem) || chipsToRedeem < 0) {
                realMoneyDisplay.textContent = "0.00 €";
                return;
            }
            const money = (chipsToRedeem / EXCHANGE_RATE).toFixed(2);
            realMoneyDisplay.textContent = `${money} €`;
        }

        openShopBtn.addEventListener('click', () => {
            const me = getMyPlayerData();
            if(me) {
                 shopChipsCount.textContent = me.chips;
                 chipsToRedeemInput.max = me.chips;
                 updateRealMoneyDisplay();
                 shopOverlay.classList.remove('hidden');
            }
        });

        closeShopBtn.addEventListener('click', () => {
            shopOverlay.classList.add('hidden');
        });

        chipsToRedeemInput.addEventListener('input', updateRealMoneyDisplay);

        redeemChipsBtn.addEventListener('click', () => {
            const me = getMyPlayerData();
            const chipsToRedeem = parseInt(chipsToRedeemInput.value, 10);
            const bankAccount = bankAccountInput.value.trim();

            if (isNaN(chipsToRedeem) || chipsToRedeem <= 0) {
                showAlert("Por favor, introduce una cantidad válida de fichas.");
                return;
            }
            if (chipsToRedeem > me.chips) {
                showAlert("No tienes suficientes fichas para canjear.");
                return;
            }
            if (bankAccount === "") {
                showAlert("Por favor, introduce un número de cuenta (simulado).");
                return;
            }

            // Simulación de la transacción
            me.chips -= chipsToRedeem;
            const moneyRedeemed = (chipsToRedeem / EXCHANGE_RATE).toFixed(2);

            updateUI();
            saveState();
            
            showAlert(`¡Transferencia simulada de ${moneyRedeemed}€ realizada con éxito!`);
            shopOverlay.classList.add('hidden');
        });


        // --- FUNCIONALIDAD DE ALERTA ---
        function showAlert(message) {
            customAlert.textContent = message;
            customAlert.classList.remove('hidden');
            setTimeout(() => customAlert.classList.add('hidden'), 3000);
        }