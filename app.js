const N = Naval;
const $ = id => document.getElementById(id);
let player, enemy, phase, selected, vertical, timer, targets, hits;
const coord = c => 'ABCDEFGHIJ'[Math.floor(c / 10)] + (c % 10 + 1);
function log(message) { const item = document.createElement('li'); item.textContent = message; $('log').prepend(item); while ($('log').children.length > 5) $('log').lastChild.remove(); }
function makeGrid(id, isEnemy) {
  const grid = $(id); grid.replaceChildren();
  for (let r = -1; r < 10; r++) for (let c = -1; c < 10; c++) {
    const el = document.createElement(r < 0 || c < 0 ? 'span' : 'button');
    if (r < 0 || c < 0) { el.className = 'axis'; el.textContent = r < 0 ? (c < 0 ? '' : c + 1) : 'ABCDEFGHIJ'[r]; }
    else { const cell = r * 10 + c; el.className = 'cell'; el.dataset.cell = cell; el.setAttribute('aria-label', coord(cell)); el.addEventListener('click', () => isEnemy ? fire(cell) : position(r, c)); if (!isEnemy) { el.addEventListener('pointerenter', () => preview(r, c)); el.addEventListener('focus', () => preview(r, c)); el.addEventListener('blur', clearPreview); } }
    grid.append(el);
  }
  grid.addEventListener('pointerleave', clearPreview);
}
function clearPreview() { document.querySelectorAll('.preview,.invalid').forEach(el => el.classList.remove('preview', 'invalid')); }
function preview(r, c) {
  clearPreview(); if (phase !== 'setup' || selected === null) return;
  const spec = N.FLEET[selected]; const valid = N.canPlace(player, r, c, spec.size, vertical);
  for (const [y, x] of N.cells(r, c, spec.size, vertical)) if (y < 10 && x < 10) $('player-board').querySelector(`[data-cell="${y * 10 + x}"]`).classList.add(valid ? 'preview' : 'invalid');
}
function renderBoard(id, b, own) {
  $(id).querySelectorAll('button').forEach(el => {
    const c = Number(el.dataset.cell), shot = b.shots.has(c), ship = b.ships.find(s => s.cells.includes(c));
    el.className = 'cell'; el.textContent = '';
    if (ship && (own || phase === 'over')) el.classList.add('occupied');
    if (shot) { el.classList.add(ship ? 'hit' : 'miss'); el.textContent = ship ? '×' : '•'; if (ship && N.sunk(b, ship)) el.classList.add('sunk'); }
    el.disabled = own ? phase !== 'setup' || selected === null : phase !== 'player' || shot;
    el.setAttribute('aria-label', `${coord(c)}${shot ? ship ? ', atingido' : ', água' : ship && (own || phase === 'over') ? ', ' + ship.name : ''}`);
  });
}
function render() {
  renderBoard('player-board', player, true); renderBoard('enemy-board', enemy, false);
  $('enemy-board').classList.toggle('active', phase === 'player');
  $('player-count').textContent = `${player.ships.filter(s => !N.sunk(player, s)).length} NAVIOS`;
  $('enemy-count').textContent = `${enemy.ships.filter(s => !N.sunk(enemy, s)).length} NAVIOS`;
  $('fleet').replaceChildren();
  N.FLEET.forEach((s, i) => { const placed = player.ships.some(p => p.name === s.name); const el = document.createElement('button'); el.className = 'fleet-item' + (selected === i && phase === 'setup' ? ' selected' : '') + (placed ? ' placed' : ''); el.disabled = placed || phase !== 'setup'; el.setAttribute('aria-pressed', String(selected === i)); el.innerHTML = `<span>${s.name}</span><span class="ship-blocks" aria-label="${s.size} casas">${'<i></i>'.repeat(s.size)}</span>`; el.onclick = () => { selected = i; render(); }; $('fleet').append(el); });
  $('start').disabled = player.ships.length !== 5;
  $('setup-controls').hidden = phase !== 'setup'; $('battle-stats').hidden = phase === 'setup';
  $('shots').textContent = String(enemy.shots.size).padStart(2, '0'); $('accuracy').textContent = (enemy.shots.size ? Math.round(hits / enemy.shots.size * 100) : 0) + '%';
}
function reset() {
  clearTimeout(timer); player = N.board(); enemy = N.randomBoard(); phase = 'setup'; selected = 0; vertical = false; targets = []; hits = 0;
  $('log').replaceChildren(); $('status').textContent = 'Posicione seus navios'; $('phase-label').textContent = 'PREPARAÇÃO'; $('phase-number').textContent = '01'; $('turn-label').textContent = 'AGUARDANDO COMANDO'; $('command-title').textContent = 'Prepare sua frota'; $('help').textContent = 'Selecione um navio e clique no seu tabuleiro para posicioná-lo.'; $('radar-note').textContent = '⌖ O inimigo está além do horizonte'; $('rotate').innerHTML = '↔ Girar navio <kbd>R</kbd>'; log('Comando iniciado. Aguardando sua frota.'); render();
}
function position(r, c) {
  if (phase !== 'setup' || selected === null) return;
  if (!N.place(player, r, c, N.FLEET[selected], vertical)) { $('status').textContent = 'Posição inválida. Escolha casas livres.'; return; }
  selected = N.FLEET.findIndex(s => !player.ships.some(p => p.name === s.name)); if (selected === -1) selected = null;
  $('status').textContent = selected === null ? 'Frota pronta. Inicie a batalha!' : 'Navio posicionado. Prepare o próximo.'; render();
}
function finish(won) { phase = 'over'; $('phase-number').textContent = '03'; $('phase-label').textContent = 'MISSÃO CONCLUÍDA'; $('status').textContent = won ? 'Vitória! O oceano é seu.' : 'Sua frota foi destruída.'; $('turn-label').textContent = won ? 'VITÓRIA' : 'DERROTA'; $('command-title').textContent = won ? 'Missão cumprida' : 'Até a próxima, capitão'; $('help').textContent = 'Frotas reveladas. Use Nova partida para jogar novamente.'; log(won ? 'Toda a frota inimiga foi afundada. Vitória!' : 'O inimigo afundou sua frota. Fim da operação.'); render(); }
function fire(c) {
  if (phase !== 'player') return;
  const result = N.attack(enemy, c); if (!result) return; if (result.hit) hits++;
  log(`Você · ${coord(c)}: ${result.sunk ? result.sunk + ' afundado!' : result.hit ? 'alvo atingido!' : 'água.'}`);
  if (result.won) return finish(true);
  phase = 'computer'; $('status').textContent = 'O inimigo está escolhendo um alvo…'; $('turn-label').textContent = 'TURNO INIMIGO'; render(); timer = setTimeout(computerTurn, 650);
}
function computerTurn() {
  let c; do { c = targets.pop(); } while (c !== undefined && player.shots.has(c));
  if (c === undefined) { const available = Array.from({length:100}, (_,i) => i).filter(i => !player.shots.has(i)); c = available[Math.floor(Math.random() * available.length)]; }
  const result = N.attack(player, c);
  if (result.hit) { const r = Math.floor(c / 10), col = c % 10; for (const [y,x] of [[r-1,col],[r+1,col],[r,col-1],[r,col+1]]) if (y>=0 && y<10 && x>=0 && x<10 && !player.shots.has(y*10+x)) targets.push(y*10+x); }
  log(`Inimigo · ${coord(c)}: ${result.sunk ? result.sunk + ' afundado!' : result.hit ? 'sua frota foi atingida!' : 'água.'}`);
  if (result.won) return finish(false);
  phase = 'player'; $('status').textContent = 'Sua vez. Escolha uma coordenada.'; $('turn-label').textContent = 'SEU TURNO'; render();
}
$('random').onclick = () => { if (phase !== 'setup') return; player = N.randomBoard(); selected = null; $('status').textContent = 'Frota pronta. Inicie a batalha!'; log('Frota distribuída automaticamente.'); render(); };
$('rotate').onclick = () => { if (phase !== 'setup') return; vertical = !vertical; clearPreview(); $('rotate').innerHTML = `${vertical ? '↕' : '↔'} Girar navio <kbd>R</kbd>`; };
document.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'r' && !$('rules').open && !e.ctrlKey && !e.metaKey && !e.altKey) $('rotate').click(); });
$('start').onclick = () => { if (phase !== 'setup' || player.ships.length !== 5) return; phase = 'player'; selected = null; $('phase-number').textContent = '02'; $('phase-label').textContent = 'EM COMBATE'; $('status').textContent = 'Sua vez. Escolha uma coordenada.'; $('turn-label').textContent = 'SEU TURNO'; $('command-title').textContent = 'Ao seu comando'; $('help').textContent = 'Ataque o radar inimigo. Cada disparo revela um pouco mais do oceano.'; $('radar-note').textContent = '⌖ Escolha uma coordenada para atacar'; log('Batalha iniciada. Você dispara primeiro.'); render(); };
$('new-game').onclick = reset;
$('rules-button').onclick = () => $('rules').showModal(); $('close-rules').onclick = $('understood').onclick = () => $('rules').close();
makeGrid('player-board', false); makeGrid('enemy-board', true); reset();
