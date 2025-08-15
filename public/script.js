// TROQUE pela URL da sua API no Render
const API_URL = 'http://localhost:3333';

const form = document.getElementById('formProduto');
const tabela = document.querySelector('#tabelaProdutos tbody');

const spanFat = document.getElementById('fat');
const spanVendidos = document.getElementById('vendidos');
const spanMaisVendido = document.getElementById('maisVendido');
const btnLimparEstoque = document.getElementById('btnLimparEstoque');
const btnReload = document.getElementById('btnReload');

let produtos = [];
let vendas = [];

// Carregar produtos da API
async function carregarProdutos() {
  const res = await fetch(`${API_URL}/produtos`);
  if (!res.ok) { alert('Falha ao carregar produtos'); return; }
  produtos = await res.json();
  atualizarTabela();
}

// Atualiza tabela com ações
function atualizarTabela() {
  tabela.innerHTML = '';

  produtos.forEach(produto => {
    const tr = document.createElement('tr');
    if ((produto.quantidade ?? 0) === 0) tr.classList.add('fora-estoque');

    tr.innerHTML = `
      <td>${produto.nome}</td>
      <td>${produto.categoria || '-'}</td>
      <td>${produto.quantidade}</td>
      <td>R$ ${Number(produto.preco_venda).toFixed(2)}</td>
      <td>${produto.validade ? new Date(produto.validade).toLocaleDateString() : '-'}</td>
      <td></td>
    `;

    const tdAcoes = tr.querySelector('td:last-child');

    // Botão Vender
    const btnVender = document.createElement('button');
    btnVender.textContent = 'Vender';
    btnVender.disabled = (produto.quantidade ?? 0) === 0;
    btnVender.addEventListener('click', () => venderProduto(produto.id));
    tdAcoes.appendChild(btnVender);

    // Botão Editar
    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarProduto(produto));
    tdAcoes.appendChild(btnEditar);

    // Botão Remover
    const btnRemover = document.createElement('button');
    btnRemover.textContent = 'Remover';
    btnRemover.addEventListener('click', () => removerProduto(produto.id));
    tdAcoes.appendChild(btnRemover);

    tabela.appendChild(tr);
  });
}

// Função vender
async function venderProduto(id) {
  const qtd = parseInt(prompt('Quantidade vendida:'), 10);
  if (!qtd || qtd <= 0) return;

  const res = await fetch(`${API_URL}/vendas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produto_id: id, quantidade: qtd })
  });
  if (!res.ok) { alert('Erro ao vender'); return; }

  await carregarProdutos();
  await carregarRelatorio();
}

// Função remover
async function removerProduto(id) {
  if (!confirm('Deseja remover este produto?')) return;

  const res = await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
  if (!res.ok) { alert('Erro ao remover'); return; }

  await carregarProdutos();
  await carregarRelatorio();
}

// Função editar produto (pode melhorar com modal)
async function editarProduto(produto) {
  const novoNome = prompt('Novo nome:', produto.nome);
  if (!novoNome) return;

  const payload = { ...produto, nome: novoNome };

  const res = await fetch(`${API_URL}/produtos/${produto.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) { alert('Erro ao editar'); return; }

  await carregarProdutos();
  await carregarRelatorio();
}

// Carregar relatório
async function carregarRelatorio() {
  const res = await fetch(`${API_URL}/relatorio`);
  if (!res.ok) return;
  const r = await res.json();

  spanFat.textContent = Number(r.faturamento).toFixed(2);
  spanVendidos.textContent = r.itens_vendidos;
  spanMaisVendido.textContent = r.produto_mais_vendido ? `${r.produto_mais_vendido.nome} (${r.produto_mais_vendido.qtd})` : '-';
}

// Adicionar produto
form.addEventListener('submit', async ev => {
  ev.preventDefault();

  const payload = {
    nome: document.getElementById('nome').value.trim(),
    categoria: document.getElementById('categoria').value.trim() || null,
    quantidade: parseInt(document.getElementById('quantidade').value, 10),
    preco_compra: parseFloat(document.getElementById('precoCompra').value),
    preco_venda: parseFloat(document.getElementById('precoVenda').value),
    validade: document.getElementById('validade').value || null
  };

  const res = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) { alert('Erro ao cadastrar'); return; }

  form.reset();
  await carregarProdutos();
  await carregarRelatorio();
});

// Limpar estoque
btnLimparEstoque.addEventListener('click', async () => {
  if (!confirm('Tem certeza que quer zerar todo o estoque?')) return;

  try {
    for (const produto of produtos) {
      await fetch(`${API_URL}/produtos/${produto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...produto, quantidade: 0 })
      });
      produto.quantidade = 0;
    }
    vendas = [];
    atualizarTabela();
    alert('Estoque zerado!');
  } catch (error) {
    console.error(error);
    alert('Erro ao limpar estoque');
  }
});

// Recarregar dados
btnReload.addEventListener('click', async () => {
  produtos = [];
  await carregarProdutos();
  await carregarRelatorio();
});

// Inicialização
(async function init(){
  await carregarProdutos();
  await carregarRelatorio();
})();
