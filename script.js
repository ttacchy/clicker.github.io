// ===== DADOS DO JOGO =====

// Lista de personagens. "custo" é quanto custa evoluir PARA o próximo.
const personagens = [
  { emoji: "🥚", nome: "Ovo",     custo: 20 },
  { emoji: "🐣", nome: "Filhote", custo: 50 },
  { emoji: "🐥", nome: "Pintinho", custo: 120 },
  { emoji: "🦅", nome: "Águia",   custo: 250 },
  { emoji: "🐉", nome: "Dragão",  custo: 0 }   // último nível: não evolui mais
];

// Estado do jogo (tudo que muda enquanto jogamos)
let moedas, nivel, porClique, custoLuva, relogio, jogando;

// ===== PEGANDO OS ELEMENTOS DA PÁGINA =====
const telaInicio = document.getElementById("tela-inicio");
const telaJogo = document.getElementById("tela-jogo");
const telaFim = document.getElementById("tela-fim");

const textoMoedas = document.getElementById("moedas");
const textoNivel = document.getElementById("nivel");
const textoPorClique = document.getElementById("por-clique");
const textoCustoLuva = document.getElementById("custo-luva");
const textoCustoEvoluir = document.getElementById("custo-evoluir");
const nomePersonagem = document.getElementById("nome-personagem");
const botaoPersonagem = document.getElementById("personagem");
const botaoLuva = document.getElementById("botao-luva");
const botaoEvoluir = document.getElementById("botao-evoluir");

// ===== FUNÇÕES =====

// Mostra só uma tela por vez
function mostrarTela(tela) {
  telaInicio.classList.add("escondida");
  telaJogo.classList.add("escondida");
  telaFim.classList.add("escondida");
  tela.classList.remove("escondida");
}

// Começa (ou reinicia) o jogo do zero
function iniciarJogo() {
  moedas = 10;
  nivel = 0;
  porClique = 1;
  custoLuva = 15;
  jogando = true;

  clearInterval(relogio); // garante que não existe um relógio antigo rodando
  // A cada 2 segundos, o jogo "gasta" moedas. Quanto maior o nível, mais gasta.
  relogio = setInterval(gastarMoedas, 2000);

  mostrarTela(telaJogo);
  atualizarTela();
}

// Cada clique no personagem dá moedas
function clicarPersonagem() {
  if (!jogando) return;
  moedas += porClique;
  atualizarTela();
}

// Compra a luva: aumenta as moedas por clique
function comprarLuva() {
  if (!jogando || moedas < custoLuva) return;
  moedas -= custoLuva;
  porClique += 1;
  custoLuva = Math.ceil(custoLuva * 1.6); // a próxima luva fica mais cara
  atualizarTela();
}

// Evolui o personagem para o próximo nível
function evoluir() {
  const custo = personagens[nivel].custo;
  // Precisa sobrar pelo menos 1 moeda, senão você perderia na hora
  if (!jogando || moedas <= custo) return;
  moedas -= custo;
  nivel += 1;

  if (nivel === personagens.length - 1) {
    terminarJogo(true); // chegou no último nível: VITÓRIA!
  } else {
    atualizarTela();
  }
}

// Roda a cada 2 segundos: tira moedas do jogador
function gastarMoedas() {
  moedas -= 1 + nivel;
  if (moedas <= 0) {
    moedas = 0;
    terminarJogo(false); // acabou o dinheiro: DERROTA
  } else {
    atualizarTela();
  }
}

// Mostra a tela final com a mensagem certa
function terminarJogo(venceu) {
  jogando = false;
  clearInterval(relogio);
  atualizarTela();

  document.getElementById("titulo-fim").textContent = venceu ? "VOCÊ VENCEU!" : "FIM DE JOGO";
  document.getElementById("emoji-fim").textContent = venceu ? "🐉" : "💸";
  document.getElementById("mensagem-fim").textContent = venceu
    ? "Você evoluiu até o Dragão! Parabéns!"
    : "Suas moedas acabaram. Tente de novo!";
  mostrarTela(telaFim);
}

// Atualiza todos os textos e botões da tela
function atualizarTela() {
  const atual = personagens[nivel];
  textoMoedas.textContent = moedas;
  textoNivel.textContent = nivel + 1;
  textoPorClique.textContent = porClique;
  textoCustoLuva.textContent = custoLuva;
  textoCustoEvoluir.textContent = atual.custo;
  botaoPersonagem.textContent = atual.emoji;
  nomePersonagem.textContent = atual.nome;

  // Desliga o botão se você não tem moedas suficientes
  botaoLuva.disabled = moedas < custoLuva;
  botaoEvoluir.disabled = moedas <= atual.custo;
}

// ===== LIGANDO OS BOTÕES ÀS FUNÇÕES =====
// "click" funciona tanto com o mouse quanto com toque no celular
document.getElementById("botao-jogar").addEventListener("click", iniciarJogo);
document.getElementById("botao-reiniciar-jogo").addEventListener("click", iniciarJogo);
document.getElementById("botao-reiniciar-fim").addEventListener("click", iniciarJogo);
botaoPersonagem.addEventListener("click", clicarPersonagem);
botaoLuva.addEventListener("click", comprarLuva);
botaoEvoluir.addEventListener("click", evoluir);
