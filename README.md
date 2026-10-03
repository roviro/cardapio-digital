# 🍔 Roviro Cardápio Digital & Delivery Direto

> Plataforma completa de **Cardápio Digital e Pedidos Diretos** para hamburguerias, pizzarias e restaurantes, eliminando até 27% de taxas cobradas por marketplaces (como iFood).

---

## 🚀 Funcionalidades Principais

1. **Cardápio Mobile-First do Cliente (`http://localhost:5174` ou porta `3002`)**:
   - Design moderno no estilo **Dark Glassmorphism** (Roviro Design System).
   - Categorias rápidas (Burgers, Pizzas, Porções, Bebidas, Sobremesas).
   - Busca em tempo real por nome ou ingrediente.
   - Modal de personalização com adicionais pagos (Bacon, Queijo extra, Borda recheada) e observações de preparo.
   - Barra flutuante de carrinho com cálculo automático de subtotal e taxa de entrega.

2. **Checkout Sem Fricção & PIX Bacen Instantâneo**:
   - Escolha entre **🛵 Delivery (Entrega)** e **🏬 Retirada no Balcão**.
   - Integração com **PIX Copia e Cola & QR Code** com cálculo exato do total.
   - Opções para Cartão e Dinheiro (com campo de troco).
   - **Geração de Comprovante Formatado para WhatsApp** em 1 clique para envio direto ao restaurante.

3. **👨‍🍳 Painel da Cozinha & KDS em Tempo Real**:
   - Quadro **Kanban com 4 colunas**: Novos Pedidos, Em Preparo, Em Rota / Balcão e Concluídos.
   - **Campainha Sonora Automática** sintetizada via Web Audio API quando chega um novo pedido.
   - Botão direto para abrir conversa no WhatsApp com o cliente.
   - Avanço de status com 1 clique (`Aceitar & Preparar` ➔ `Despachar Entrega` ➔ `Concluir Pedido`) enviando avisos de status automáticos ao cliente.

4. **📦 Gestão de Produtos & Estoque (Admin)**:
   - Botão de **Pausar / Esgotar Produto** instantaneamente (sem recarregar página), ideal para quando acaba um ingrediente na cozinha.
   - Cadastro ágil de novos produtos com categoria, preço, descrição e foto.
   - Exclusão e filtros por categoria.

5. **⚙️ Configurações da Loja**:
   - Nome do estabelecimento, endereço e status (Aberto / Fechado).
   - WhatsApp que recebe os pedidos.
   - Chave PIX personalizada (CPF, CNPJ, Email ou Telefone) e cidade.
   - Taxa de entrega padrão e tempo estimado.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Web Audio API.
- **Backend**: Bun / Node.js, Express, SQLite (`bun:sqlite` nativo de altíssima performance).
- **Integrações**: Geração padrão EMVCo de PIX Bacen, despachador WhatsApp (Evolution API / Fallback direto via URL).

---

## 🏃 Como Executar

### Pré-requisitos
- Bun (`curl -fsSL https://bun.sh/install | bash`)

### Inicialização em 1 Comando
Execute o script na raiz do projeto:

```bash
./iniciar.sh
```

- **Frontend**: `http://localhost:5174`
- **Backend & KDS**: `http://localhost:3002`

---

## 💰 Modelo de Negócio & Monetização

1. **Setup Inicial**: R$ 400 a R$ 800 para cadastrar o cardápio, configurar fotos e chave PIX do restaurante.
2. **Mensalidade Recorrente (SaaS)**: R$ 97 a R$ 197 / mês por estabelecimento (apresentando a economia: um restaurante que vende R$ 15.000 no iFood paga cerca de R$ 3.000 só de comissão; pagar R$ 150/mês para o Roviro Cardápio gera economia líquida imediata).
3. **Plano White-Label**: O desenvolvedor pode hospedar múltiplas lanchonetes na mesma VPS.

---

Desenvolvido com foco em velocidade, conversão e zero dependências pesadas por **Roviro**.
