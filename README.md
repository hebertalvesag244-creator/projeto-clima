# Projeto Clima

Plataforma de monitoramento do tempo com conteúdo sobre clima e meio ambiente. O site será a primeira experiência; um futuro aplicativo móvel consumirá a mesma API.

## Estrutura planejada

```text
backend/   API comum para o site e o app
web/       site responsivo
app/       aplicativo móvel (etapa futura)
```

## Primeiras etapas

1. Definir e documentar a API de previsão do tempo.
2. Criar a integração com Open-Meteo e cache no backend.
3. Criar listagem e páginas de artigos sobre clima e meio ambiente.
4. Construir o site responsivo consumindo a API própria.
5. Adicionar contas e recursos comunitários quando o produto precisar deles.

## Princípios do produto

- A previsão, o monitoramento e os alertas são o núcleo do produto.
- Artigos e notícias devem estar relacionados a clima e meio ambiente.
- Relatos de usuários devem ser identificados claramente e não confundidos com alertas oficiais.
- O backend deve servir tanto o site quanto o futuro aplicativo.

## Fonte meteorológica inicial

Open-Meteo é a candidata para o protótipo. Antes de uso comercial, revisar os termos e a licença vigentes: https://open-meteo.com/en/pricing

## Desenvolvimento

Stack inicial proposta: Node.js + TypeScript + Express para a API e Next.js para o site. As decisões serão registradas conforme o MVP for implementado.
