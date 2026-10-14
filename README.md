# F&E Clean — Site e Painel de Gestão

Site institucional e sistema de gestão da **F&E Clean Higienização de Estofados** (Ribeirão Preto · SP).

- **Site público** (`/`): landing page com serviços, resultados, depoimentos, FAQ e formulário de contato.
- **Painel de gestão** (`/admin/`): agenda, clientes, ordens de serviço com assinatura e PDF, catálogo de serviços, financeiro e lembretes. Funciona como aplicativo instalável (PWA) e offline.
- **Cadastro de clientes** (`/cadastro.html?u=feclean-oficial`): link público que o cliente preenche; o cadastro aparece no painel em tempo real.
- **Política de privacidade** (`/lgpd.html`).

## Arquitetura

| Parte | Tecnologia | Onde fica |
| --- | --- | --- |
| Site público | React 19 + Vite + Tailwind CSS 4 | `src/` |
| Painel, cadastro e LGPD | HTML + JavaScript puro (módulos ES), sem build | `public/` |
| Banco de dados e login | Firebase Firestore + Authentication (Google) | projeto `fehizienizacao` |
| Hospedagem | Firebase Hosting, deploy automático pelo GitHub Actions | `.github/workflows/` |

O Vite compila só o site público. Tudo em `public/` é copiado como está para `dist/`, por isso o painel é editado direto nos arquivos de `public/`.

```text
src/
  App.tsx            Landing page
  lib/contato.ts     Grava o formulário "Fale conosco" (carrega o Firebase só no envio)
  assets/            Imagens (WebP) e vídeo da landing page
public/
  admin/index.html   Painel de gestão
  cadastro.html      Formulário público de cadastro de clientes
  lgpd.html          Política de privacidade
  sw.js              Service worker (offline e lembretes)
  js/app.js          Interface do painel
  js/store.js        Acesso ao Firestore e login
  js/cadastro.js     Lógica do formulário público
  css/app.css        Estilos do painel, cadastro e LGPD
  img/               Imagens do painel
firestore.rules      Regras de segurança do banco
firebase.json        Hosting: rotas, cabeçalhos de segurança e cache
```

## Rodando localmente

Requisito: Node.js 20 ou mais recente.

```bash
npm install
npm run dev        # http://localhost:3000 (site) e http://localhost:3000/admin/ (painel)
npm run lint       # checagem de tipos do site
npm run build      # gera dist/
npm run preview    # serve o dist/ gerado
```

Não há variáveis de ambiente: a configuração do Firebase é pública por design e fica em `src/lib/contato.ts` e `public/js/firebase-config.js`. Quem protege os dados são as regras do Firestore.

## Deploy

- **Site e painel:** todo push na branch `main` publica no Firebase Hosting (`firebase-hosting-merge.yml`). Pull requests geram uma URL de preview.
- **Regras do Firestore:** não são publicadas pelo GitHub Actions. Depois de alterar `firestore.rules`, publique manualmente:

  ```bash
  firebase deploy --only firestore:rules
  ```

### Ao alterar arquivos do painel (`public/`)

Os arquivos do painel são referenciados com `?v=N` para forçar a atualização nos celulares. Ao mudar um deles:

1. aumente o `?v=` onde o arquivo é referenciado (HTML ou `import`);
2. atualize a mesma URL na lista `APP_SHELL` de `public/sw.js`;
3. aumente a constante `VERSAO` em `public/sw.js`.

## Acesso ao painel

O login é feito exclusivamente com conta Google.

- **Contas mestre:** definidas em `firestore.rules` e em `public/js/store.js` (as duas listas precisam ser iguais). Têm acesso permanente e são as únicas que autorizam ou revogam outras contas.
- **Equipe:** as contas mestre autorizam e-mails em *Configurações → Contas Google Autorizadas*. Cada autorização vira um documento em `autorizados/{email}`.

## Dados no Firestore

| Caminho | Conteúdo | Quem acessa |
| --- | --- | --- |
| `usuarios/feclean-oficial/servicos` | Catálogo de serviços | Equipe autorizada |
| `usuarios/feclean-oficial/clientes` | Clientes | Equipe autorizada; o público só **cria** pelo link de cadastro |
| `usuarios/feclean-oficial/agendamentos` | Agendamentos e ordens de serviço | Equipe autorizada |
| `usuarios/feclean-oficial/lancamentos` | Receitas e despesas | Equipe autorizada |
| `usuarios/feclean-oficial/configuracoes` | Mensagens de WhatsApp | Equipe autorizada |
| `autorizados/{email}` | Contas liberadas no painel | Leitura: equipe; escrita: contas mestre |
| `contact_messages` | Formulário "Fale conosco" do site | O público só **cria**; equipe lê |

Qualquer outro caminho é bloqueado.
