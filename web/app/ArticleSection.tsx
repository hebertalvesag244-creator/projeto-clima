"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Article = { slug: string; category: string; title: string; summary: string; readingMinutes: number };
type ArticleResponse = { items: Article[]; demo: boolean };

export default function ArticleSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    fetch(api + "/api/articles")
      .then(async response => {
        if (!response.ok) throw new Error("Não foi possível carregar os artigos.");
        return await response.json() as ArticleResponse;
      })
      .then(result => {
        setArticles(result.items);
        if (result.demo) setNotice("Conteúdo demonstrativo — os artigos estão em preparação.");
      })
      .catch(() => setNotice("Os artigos não estão disponíveis agora."));
  }, []);

  return <section className="articles" id="artigos" aria-labelledby="articles-title">
    <div className="articles-heading">
      <div><span className="sectionLabel section-label">CLIMA EM CONTEXTO</span><h2 id="articles-title">Entenda o que acontece ao seu redor.</h2></div>
      <p>Previsão e informação caminham juntas.</p>
    </div>
    {notice && <p className="articles-notice">{notice}</p>}
    <div className="article-grid">{articles.map((article, index) => <Link className="article-card" href={"/artigos/" + article.slug} key={article.slug}>
      <div className={"article-art article-art-" + (index + 1)} aria-hidden="true"><span>{index === 0 ? "☂" : index === 1 ? "◉" : "☀"}</span></div>
      <div className="article-copy"><span className="article-category">{article.category}</span><h3>{article.title}</h3><p>{article.summary}</p><span className="article-reading">{article.readingMinutes} min de leitura <span aria-hidden="true">↗</span></span></div>
    </Link>)}</div>
  </section>;
}
