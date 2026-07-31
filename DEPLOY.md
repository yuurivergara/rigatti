# Deploy

O frontend vai para a **Vercel**. O backend precisa de uma decisão consciente, explicada abaixo.

**Resumo:** Mongo no Atlas → API no Render → frontend na Vercel. Leva uns 20 minutos.

---

## Antes de tudo: por que a API não vai para a Vercel

O endpoint `POST /api/chat` mantém uma resposta `text/event-stream` aberta enquanto o agente pensa,
chama ferramentas e escreve. Numa consulta com duas ou três rodadas de tool calling isso passa
tranquilamente de um minuto.

Funções serverless têm **teto de duração por invocação**. Se a resposta estourar esse teto, a
conexão é cortada no meio e o usuário vê a mensagem truncada — sem erro claro, sem retentativa.
Confira o limite do seu plano na Vercel antes de decidir; ele já mudou algumas vezes.

Por isso a API fica num host de **processo longo** (Render, Railway ou Fly). É gratuito no Render e
não impõe teto por requisição. Se ainda assim você quiser tudo na Vercel, a última seção mostra o
caminho e o que muda.

---

## 1. Banco: MongoDB Atlas

1. Crie uma conta em [mongodb.com/atlas](https://www.mongodb.com/atlas) e um cluster **M0** (grátis).
2. **Database Access** → *Add New Database User*. Guarde usuário e senha.
3. **Network Access** → *Add IP Address* → `0.0.0.0/0`.
   Render e Vercel não publicam faixas de IP fixas nos planos básicos. A proteção real aqui é a
   credencial, não o IP. Em produção séria, use VPC peering ou Private Endpoint.
4. **Connect** → *Drivers* → copie a connection string e acrescente o nome do banco:

```
mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/catalogo?retryWrites=true&w=majority
```

> Se a senha tiver `@`, `/`, `:` ou `#`, faça o percent-encoding dela — senão a URI quebra.

---

## 2. API: Render

1. Suba o repositório para o GitHub.
2. Em [render.com](https://render.com): **New** → **Web Service** → conecte o repositório.
3. Configure:

| Campo | Valor |
| --- | --- |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Instance Type | Free |

4. **Environment** → adicione:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://...            # do passo 1
JWT_SECRET=<48+ caracteres aleatórios>  # openssl rand -base64 48
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-5
CORS_ORIGIN=https://SEU-PROJETO.vercel.app
```

`PORT` não precisa: o Render injeta, e o `env.ts` já lê de lá.

> `CORS_ORIGIN` você só vai saber depois do passo 3. Coloque um valor provisório agora e volte
> para corrigir — sem isso o navegador bloqueia toda chamada do frontend.

5. Deploy. Ao terminar, teste: `https://SUA-API.onrender.com/health` deve responder
   `{"status":"ok"}`.

6. **Popule o banco** (uma vez), da sua máquina, apontando para o Atlas:

```bash
cd server
MONGO_URI="mongodb+srv://..." npm run seed
```

No PowerShell: `$env:MONGO_URI="mongodb+srv://..."; npm run seed`

> **Plano free do Render hiberna após 15 minutos sem tráfego.** A primeira requisição depois disso
> demora ~50s para responder. Se o avaliador for testar sem aviso, vale acordar o serviço antes ou
> deixar isso escrito no link que você enviar.

---

## 3. Frontend: Vercel

1. Em [vercel.com](https://vercel.com): **Add New** → **Project** → importe o repositório.
2. Configure:

| Campo | Valor |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `web` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

O `web/vercel.json` já está no repositório com o rewrite de SPA — sem ele, abrir
`/produtos/algum-id` direto na URL daria 404.

3. **Environment Variables** → adicione, para *Production*, *Preview* e *Development*:

```
VITE_API_URL=https://SUA-API.onrender.com
```

> Variável do Vite é **embutida no bundle durante o build**. Alterar depois exige **Redeploy** —
> não basta salvar. É o erro mais comum aqui: o valor muda no painel e o site continua chamando
> `localhost:4000`.

4. Deploy. Anote a URL final (`https://seu-projeto.vercel.app`).

5. **Volte ao Render** e ajuste `CORS_ORIGIN` para essa URL exata — com `https://`, sem barra no
   fim. O serviço reinicia sozinho.

> Quer que os deploys de preview também funcionem? `CORS_ORIGIN` aceita lista separada por
> vírgula. Mas cada preview tem um domínio novo, então o prático é liberar só produção.

---

## 4. Conferir se subiu de pé

1. Abra a URL da Vercel → deve carregar a tela de login.
2. Entre com `admin@rigatti.com` / `senha1234`.
3. O catálogo deve listar 13 produtos. Se ficar vazio, o seed não rodou no banco certo.
4. Abra o **Assistente** e pergunte *"quais sofás vocês têm?"*. Deve aparecer o rastro
   `→ consultou o catálogo` e a resposta com os preços.
5. Numa janela anônima, entre com `admin@technova.com` e confirme que o catálogo é outro.

Se o passo 4 falhar mas o 3 funcionar, o problema é a `ANTHROPIC_API_KEY` — veja os logs do Render.

### Quando algo não funciona

| Sintoma | Causa quase certa |
| --- | --- |
| Erro de CORS no console | `CORS_ORIGIN` no Render não bate exatamente com o domínio da Vercel |
| Requisições indo para `localhost:4000` | `VITE_API_URL` foi alterada sem **Redeploy** |
| 404 ao recarregar `/produtos/:id` | Root Directory não é `web`, então o `vercel.json` não foi aplicado |
| Primeira requisição demora ~50s | Hibernação do plano free do Render |
| API sobe e cai | Falta variável de ambiente — o `env.ts` derruba o processo de propósito, com o nome do campo no log |
| Login diz "credenciais inválidas" | O seed rodou contra outro banco (confira o nome no fim da `MONGO_URI`) |

---

## 5. Se você quiser mesmo tudo na Vercel

Dá para fazer, aceitando o teto de duração no chat. O que muda:

1. Crie `api/index.ts` na raiz do projeto exportando o app do Express:

```ts
import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/db/connect.js';

let ready: Promise<void> | undefined;
const app = createApp();

export default async function handler(req: unknown, res: unknown) {
  ready ??= connectDb();   // reaproveita a conexão entre invocações quentes
  await ready;
  return (app as never as (a: unknown, b: unknown) => void)(req, res);
}
```

2. Use um único projeto na Vercel com Root Directory na raiz, e `vercel.json` roteando `/api/*`
   para a função e o resto para o `dist` do frontend.
3. Configure a função de chat com `maxDuration` no maior valor que o seu plano permitir.
4. `VITE_API_URL` passa a ser vazio (mesma origem), o que aliás elimina o CORS.

**O que continua sendo problema:** respostas longas do agente ainda podem ser cortadas, e o pool de
conexões do Mongo sofre com invocações concorrentes — o Atlas M0 tem limite baixo. Se for por esse
caminho, use o **Vercel Functions com Fluid Compute** e um driver com pool pequeno
(`maxPoolSize: 5`).

Eu não recomendo para este projeto: o chat em streaming é justamente a parte que o avaliador vai
testar.
