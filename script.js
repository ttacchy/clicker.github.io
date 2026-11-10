// ===== DADOS DO JOGO =====

// As 5 formas do herói. "custo" é quanto custa evoluir PARA a próxima forma.
const formasHeroi = [
  { emoji: "🥚", custo: 30 },
  { emoji: "🐣", custo: 60 },
  { emoji: "🐥", custo: 100 },
  { emoji: "🦅", custo: 150 },
  { emoji: "🐉", custo: 0 }   // última forma: não evolui mais
];

// Os monstros, em ordem. O último é o chefe final.
const monstros = [
  { emoji: "🐀", nome: "Rato",   vida: 20, ataque: 4,  recompensa: 20 },
  { emoji: "🦇", nome: "Morcego", vida: 32, ataque: 6,  recompensa: 35 },
  { emoji: "🐺", nome: "Lobo",   vida: 48, ataque: 8,  recompensa: 55 },
  { emoji: "👹", nome: "Chefe",  vida: 80, ataque: 10, recompensa: 0 }
];

// Estado do jogo (tudo que muda enquanto jogamos)
let moedas, nivel, vidaHeroi, vidaMaxHeroi, bonusLuva, custoLuva;
let numeroMonstro, vidaMonstro, defendendo, travado, idPartida;

// ===== PEGANDO OS ELEMENTOS DA PÁGINA =====
const telaInicio = document.getElementById("tela-inicio");
const telaJogo = document.getElementById("tela-jogo");
const telaFim = document.getElementById("tela-fim");
const menuBatalha = document.getElementById("menu-batalha");
const menuLoja = document.getElementById("menu-loja");
const textoMensagem = document.getElementById("mensagem");

const botaoAtacar = document.getElementById("botao-atacar");
const botaoDefender = document.getElementById("botao-defender");
const botaoCurar = document.getElementById("botao-curar");
const botaoLuva = document.getElementById("botao-luva");
const botaoEvoluir = document.getElementById("botao-evoluir");

// ===== FUNÇÕES AUXILIARES =====

// Sorteia um número inteiro entre min e max (inclusive)
function sortear(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Quanto dano o herói causa: cresce com o nível e com as luvas
function danoDoHeroi() {
  return 5 + nivel * 2 + bonusLuva + sortear(0, 2);
}

// Mostra só uma tela por vez
function mostrarTela(tela) {
  telaInicio.classList.add("escondida");
  telaJogo.classList.add("escondida");
  telaFim.classList.add("escondida");
  tela.classList.remove("escondida");
}

// Faz um emoji tremer (efeito de dano)
function tremer(idDoElemento) {
  const elemento = document.getElementById(idDoElemento);
  elemento.classList.remove("tremer");
  void elemento.offsetWidth; // truque para reiniciar a animação
  elemento.classList.add("tremer");
}

// ===== INÍCIO E BATALHAS =====

// Começa (ou reinicia) o jogo do zero
function iniciarJogo() {
  idPartida = (idPartida || 0) + 1; // identifica esta partida (evita "restos" da anterior)
  moedas = 10;
  nivel = 0;
  vidaMaxHeroi = 40;
  vidaHeroi = vidaMaxHeroi;
  bonusLuva = 0;
  custoLuva = 20;
  numeroMonstro = 0;
  mostrarTela(telaJogo);
  comecarBatalha();
}

// Prepara a batalha contra o monstro atual
function comecarBatalha() {
  vidaMonstro = monstros[numeroMonstro].vida;
  defendendo = false;
  travado = false;
  menuLoja.classList.add("escondida");
  menuBatalha.classList.remove("escondida");
  textoMensagem.textContent = "Um " + monstros[numeroMonstro].nome + " apareceu! Sua vez.";
  atualizarTela();
}

// Ataque do herói (é o "clique" do jogo!)
function atacar() {
  if (travado) return;
  travado = true;
  const dano = danoDoHeroi();
  vidaMonstro = Math.max(0, vidaMonstro - dano);
  tremer("emoji-monstro");
  textoMensagem.textContent = "Você causou " + dano + " de dano!";
  atualizarTela();
  proximoPasso();
}

// Defender: o próximo ataque do monstro causa metade do dano
function defender() {
  if (travado) return;
  travado = true;
  defendendo = true;
  textoMensagem.textContent = "Você se protegeu!";
  atualizarTela();
  proximoPasso();
}

// Curar: gasta 10 moedas e recupera vida
function curar() {
  if (travado || moedas < 10 || vidaHeroi === vidaMaxHeroi) return;
  travado = true;
  moedas -= 10;
  vidaHeroi = Math.min(vidaMaxHeroi, vidaHeroi + 15);
  textoMensagem.textContent = "Você recuperou vida!";
  atualizarTela();
  proximoPasso();
}

// Depois da ação do herói: ou o monstro morreu, ou é a vez dele
function proximoPasso() {
  const partida = idPartida;
  if (vidaMonstro <= 0) {
    setTimeout(function () {
      if (partida === idPartida) venceuBatalha();
    }, 700);
  } else {
    // Espera um pouquinho para dar tempo de ler a mensagem
    setTimeout(function () {
      if (partida === idPartida) turnoDoMonstro();
    }, 800);
  }
}

// Vez do monstro atacar
function turnoDoMonstro() {
  const monstro = monstros[numeroMonstro];
  let dano = monstro.ataque + sortear(0, 2);
  if (defendendo) dano = Math.floor(dano / 2);
  defendendo = false;

  vidaHeroi = Math.max(0, vidaHeroi - dano);
  tremer("emoji-heroi");
  textoMensagem.textContent = monstro.nome + " causou " + dano + " de dano!";
  atualizarTela();

  if (vidaHeroi <= 0) {
    const partida = idPartida;
    setTimeout(function () {
      if (partida === idPartida) terminarJogo(false); // sem vida: DERROTA
    }, 700);
  } else {
    travado = false; // volta a ser a vez do jogador
  }
}

// O herói derrotou o monstro
function venceuBatalha() {
  if (numeroMonstro === monstros.length - 1) {
    terminarJogo(true); // derrotou o chefe: VITÓRIA!
    return;
  }
  const ganho = monstros[numeroMonstro].recompensa;
  moedas += ganho;
  vidaHeroi = Math.min(vidaMaxHeroi, vidaHeroi + 15); // descansa um pouco
  textoMensagem.textContent = "Vitória! Você ganhou " + ganho + " moedas. Use a loja!";
  // Troca os botões de batalha pelos da loja
  menuBatalha.classList.add("escondida");
  menuLoja.classList.remove("escondida");
  atualizarTela();
}

// ===== LOJA =====

// Luva: aumenta o dano para sempre
function comprarLuva() {
  if (moedas < custoLuva) return;
  moedas -= custoLuva;
  bonusLuva += 2;
  custoLuva = Math.ceil(custoLuva * 1.6); // a próxima fica mais cara
  textoMensagem.textContent = "Luva comprada! Mais dano!";
  atualizarTela();
}

// Evoluir: o herói muda de forma, ganha vida máxima e se cura
function evoluir() {
  if (nivel >= formasHeroi.length - 1 || moedas < formasHeroi[nivel].custo) return;
  moedas -= formasHeroi[nivel].custo;
  nivel += 1;
  vidaMaxHeroi += 20;
  vidaHeroi = vidaMaxHeroi;
  textoMensagem.textContent = "Você evoluiu! Mais vida e mais dano!";
  atualizarTela();
}

// Vai para a próxima batalha
function proximaBatalha() {
  numeroMonstro += 1;
  comecarBatalha();
}

// ===== FIM DE JOGO =====
function terminarJogo(venceu) {
  idPartida += 1; // cancela qualquer espera que ainda esteja rolando
  document.getElementById("titulo-fim").textContent = venceu ? "VOCÊ VENCEU!" : "FIM DE JOGO";
  document.getElementById("emoji-fim").textContent = venceu ? "🏆" : "💀";
  document.getElementById("mensagem-fim").textContent = venceu
    ? "Você derrotou o chefe final! Parabéns!"
    : "Sua vida acabou. Tente de novo!";
  mostrarTela(telaFim);
}

// ===== ATUALIZAR A TELA =====
function atualizarTela() {
  const monstro = monstros[numeroMonstro];
  document.getElementById("moedas").textContent = moedas;
  document.getElementById("nivel").textContent = nivel + 1;
  document.getElementById("emoji-heroi").textContent = formasHeroi[nivel].emoji;
  document.getElementById("emoji-monstro").textContent = monstro.emoji;

  // Barras de vida (a largura é a porcentagem da vida que sobrou)
  document.getElementById("vida-heroi").style.width = (vidaHeroi / vidaMaxHeroi * 100) + "%";
  document.getElementById("vida-monstro").style.width = (vidaMonstro / monstro.vida * 100) + "%";
  document.getElementById("texto-vida-heroi").textContent = "Você: " + vidaHeroi + "/" + vidaMaxHeroi;
  document.getElementById("texto-vida-monstro").textContent = monstro.nome + ": " + vidaMonstro + "/" + monstro.vida;

  document.getElementById("custo-luva").textContent = custoLuva;
  const ultimaForma = nivel >= formasHeroi.length - 1;
  document.getElementById("custo-evoluir").textContent = ultimaForma ? "MAX" : formasHeroi[nivel].custo;

  // Desliga os botões que você não pode usar agora
  botaoAtacar.disabled = travado;
  botaoDefender.disabled = travado;
  botaoCurar.disabled = travado || moedas < 10 || vidaHeroi === vidaMaxHeroi;
  botaoLuva.disabled = moedas < custoLuva;
  botaoEvoluir.disabled = ultimaForma || moedas < formasHeroi[nivel].custo;
}

// ===== LIGANDO OS BOTÕES ÀS FUNÇÕES =====
// "click" funciona tanto com o mouse quanto com toque no celular
document.getElementById("botao-jogar").addEventListener("click", iniciarJogo);
document.getElementById("botao-reiniciar-jogo").addEventListener("click", iniciarJogo);
document.getElementById("botao-reiniciar-fim").addEventListener("click", iniciarJogo);
botaoAtacar.addEventListener("click", atacar);
botaoDefender.addEventListener("click", defender);
botaoCurar.addEventListener("click", curar);
botaoLuva.addEventListener("click", comprarLuva);
botaoEvoluir.addEventListener("click", evoluir);
document.getElementById("botao-proxima").addEventListener("click", proximaBatalha);
