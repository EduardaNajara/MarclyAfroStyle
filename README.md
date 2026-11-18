# Marcly Afro Style

Projeto front-end em Angular baseado no painel do ateliê no [Figma](https://www.figma.com/design/6ZVWUhoyHt0xCg3RrO3g4d/Marcly-Afro-Style?node-id=44-2).

## Rodar localmente

```bash
npm install
npm start
```

O servidor de desenvolvimento fica disponível em `http://localhost:4200`.

## Páginas e rotas

| Página | Rota | Componente |
| --- | --- | --- |
| Login | `/login` | `pages/login/login-page.component.ts` |
| Início | `/inicio` | `pages/home/home-page.component.ts` |
| Clientes | `/clientes` | `pages/clients/clients-page.component.ts` |
| Pedidos | `/pedidos` | `pages/orders/orders-page.component.ts` |
| Relatórios | `/relatorios` | `pages/reports/reports-page.component.ts` |
| Configurações | `/configuracoes` | `pages/settings/settings-page.component.ts` |

O shell e o menu compartilhado ficam em `layout/dashboard-layout.component.ts`. Cada tela tem um model próprio em `models/pages/`. O roteamento carrega as páginas do painel sob demanda.

Os dados são exemplos locais. Formulários, busca e filtros funcionam no navegador, mas ainda não há autenticação real, API ou persistência em banco de dados.
