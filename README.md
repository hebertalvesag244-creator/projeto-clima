# Projeto Clima

Plataforma de monitoramento do tempo com conteúdo sobre clima e meio ambiente. O site é a primeira experiência; o futuro aplicativo móvel poderá consumir a mesma API.

## Estrutura

- `backend/`: API Node.js, TypeScript e Express.
- `web/`: site responsivo em Next.js.
- `app/`: futuro aplicativo móvel.

## Rodar localmente

Requisitos: Node.js 20 ou mais recente.

```bash
npm install
npm run dev
```

O site abre em http://localhost:3000 e a API em http://localhost:3001. Pesquise uma cidade para ver as condições atuais e a previsão para cinco dias.

## Rotas da API

- `GET /api/health`: verifica se a API está ativa.
- `GET /api/weather?city=São Paulo`: retorna localização, condições atuais e previsão para cinco dias.
- `GET /api/articles`: lista os conteúdos editoriais demonstrativos em preparação.
- `GET /api/articles/:slug`: retorna o texto e as fontes de um artigo.
- `GET /api/reports?city=São Paulo`: lista até 20 relatos para uma cidade.
- `POST /api/reports`: cria um relato de clima enviado por usuário.

A API busca as coordenadas pela geocodificação do Open-Meteo e consulta a previsão meteorológica. As respostas de previsão usam cache HTTP por cinco minutos. Relatos são guardados apenas na memória durante a execução da API; reiniciar o servidor os apaga.

Para usar outro endereço de API no site, copie `web/.env.example` para `web/.env.local` e ajuste `NEXT_PUBLIC_API_URL`.

## Princípios

- Previsão, monitoramento e alertas são o núcleo do produto.
- Artigos e notícias devem estar ligados a clima e meio ambiente.
- Relatos de usuários devem ser identificados e não confundidos com alertas oficiais.
- O backend serve o site e o futuro aplicativo.

## Fonte meteorológica

O protótipo usa Open-Meteo. Revise os termos e a licença vigentes antes de uso comercial: https://open-meteo.com/en/pricing
