## Gestão de OS e Tarefas — Horas Trabalhadas

Aplicação web simples para cadastro e gestão de tarefas de uma Ordem de Serviço (OS), com cálculo de dias úteis, soma de horas, exportação para Excel/PDF, compartilhamento por WhatsApp/Email e persistência local por `ID da OS` usando `localStorage`.

### Índice
- Visão geral
- Estrutura do projeto
- Principais funcionalidades
- Como usar
- Persistência e formato dos dados
- Cálculo de dias úteis (feriados)
- Exportação e compartilhamento
- Estilo (UI/UX), responsividade e impressão
- Desenvolvimento
- Roadmap

## Visão geral
- Interface única (SPA simples) em `index.html`.
- Sem build ou backend; basta abrir no navegador.
- Dados persistidos por `ID da OS` em `localStorage` do navegador.

## Estrutura do projeto
```text
dash-atividades-horas/
  ├─ index.html
  ├─ assets/
  │  ├─ css/
  │  │  └─ styles.css
  │  └─ js/
  │     ├─ holidays-br.js
  │     └─ app.js
  └─ package-lock.json (não é necessário para uso)
```

## Principais funcionalidades
- Cadastro de tarefas: responsável, setor, atividade, descrição, datas, dias úteis, horas e status.
- Cálculo automático de dias úteis entre datas (desconsidera finais de semana e feriados fixos nacionais).
- Tabela com totais de dias úteis e horas; ações de editar/excluir item e limpar todos.
- Exportações: Excel (XLSX) e PDF (jsPDF + AutoTable via CDN).
- Compartilhamento: abre WhatsApp com mensagem pronta e `mailto:` para email.
- Persistência: salvar/carregar pela chave `ID da OS`.

## Como usar
1. Abra `index.html` no navegador (duplo clique funciona). Para CORS mais rígido, use um servidor local simples.
2. (Opcional) Faça upload do logo da empresa para exibir no cabeçalho.
3. Preencha `ID da OS` e `Nome da Empresa`.
4. Cadastre tarefas no formulário e clique em "Adicionar tarefa".
5. Clique em "Salvar OS" para gravar (ou altere tarefas com `ID da OS` preenchido para persistir automaticamente).
6. Para recuperar, informe novamente o `ID da OS` (ao sair do campo, os dados são carregados).
7. Use os botões de exportar/compartilhar conforme necessário.

## Persistência e formato dos dados
- A aplicação salva por `localStorage` usando a chave `os_manager_<ID_DA_OS>`.
- Exemplo de payload salvo:
```json
{
  "orderId": "OS-2025-001",
  "companyName": "ACME Ltda.",
  "tasks": [
    {
      "id": "mbe5c4q1t",
      "responsibleName": "Fulano da Silva",
      "department": "TI",
      "activity": "Correção de bug",
      "description": "Ajuste no módulo de login",
      "startDate": "2025-08-11",
      "endDate": "2025-08-12",
      "businessDays": 2,
      "hours": 6,
      "status": "concluida"
    }
  ],
  "logoDataUrl": "data:image/png;base64,iVBORw0...",
  "updatedAt": "2025-08-12T12:34:56.000Z"
}
```

### Observações
- Os dados ficam somente no navegador/dispositivo atual.
- Para migrar entre dispositivos, use as exportações (Excel/PDF) ou implemente importação/exportação JSON (ver Roadmap).

## Cálculo de dias úteis (feriados)
- Finais de semana (sábado/domingo) não são contabilizados.
- Feriados: `assets/js/holidays-br.js` inclui apenas feriados nacionais fixos. Feriados móveis (Carnaval, Corpus Christi etc.) não estão inclusos por padrão.

## Exportação e compartilhamento
- Excel: usa `xlsx` via CDN.
- PDF: usa `jspdf` + `jspdf-autotable` via CDN.
- WhatsApp: abre `https://wa.me/<numero>?text=<mensagem>` com um resumo da OS.
- Email: usa `mailto:` com `subject` e `body` preenchidos.

## Estilo (UI/UX), responsividade e impressão
- Tema escuro moderno com variáveis CSS em `assets/css/styles.css`.
- Componentes: cabeçalho, cards, formulários em grid, botões (primary/danger/ghost/icon), tabela com sticky header e zebra, rodapé fixo.
- Responsividade: breakpoints em 1100px, 860px e 640px.
- Acessibilidade: foco visível, contrastes, inputs e labels consistentes.
- Impressão: oculta elementos de ação e aplica estilo claro básico.

## Desenvolvimento
- Basta editar `index.html`, `assets/css/styles.css` e `assets/js/*.js`.
- Dependências externas são carregadas por CDN em `index.html`:
  - Google Fonts (Inter)
  - `xlsx`
  - `jspdf` e `jspdf-autotable`
- Não é necessário Node/npm para uso. O `package-lock.json` é irrelevante.

### Servidor local (opcional)
Se preferir servir os arquivos:
```bash
# Python 3
python -m http.server 8080
# Depois acesse: http://localhost:8080
```

## Roadmap
- Importar/Exportar JSON da OS (backup/restauração entre dispositivos).
- Feriados móveis nacionais (Carnaval, Corpus Christi, Páscoa) e municipais (configuráveis).
- Campos personalizados por OS (ex.: centro de custo, responsável pela OS).
- Filtros e buscas na tabela de tarefas.
- Validações avançadas e máscaras de input (telefone, datas, horas).
- Tema claro e paleta de cores configurável por empresa.

Consulte também `CHANGELOG.md` para histórico das mudanças.


