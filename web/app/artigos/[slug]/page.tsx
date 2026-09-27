import Link from "next/link";
import { notFound } from "next/navigation";
import "./article.css";

type Article = { slug: string; category: string; title: string; summary: string; readingMinutes: number; content: string[]; source: { label: string; url: string } };

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article: Article;
  try {
    const response = await fetch("http://localhost:3001/api/articles/" + encodeURIComponent(slug), { cache: "no-store" });
    if (!response.ok) notFound();
    const result = await response.json() as { article: Article };
    article = result.article;
  } catch { notFound(); }
  return <main className="article-page">
    <header className="article-topbar"><Link className="brand" href="/">☀ <span>clima<span className="brandLight">agora</span></span></Link><Link className="back-link" href="/#artigos">← Voltar aos artigos</Link></header>
    <article className="article-body"><span className="article-category">{article.category}</span><h1>{article.title}</h1><p className="article-deck">{article.summary}</p><div className="article-meta">Projeto Clima <span>·</span> {article.readingMinutes} min de leitura</div><div className="demo-banner">Texto demonstrativo. Este conteúdo está em preparação para publicação editorial.</div><div className="article-content">{article.content.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><aside className="article-source"><span>PARA SABER MAIS</span><a href={article.source.url} target="_blank" rel="noreferrer">{article.source.label} ↗</a></aside><Link className="back-button" href="/#artigos">← Ver outros artigos</Link></article>
    <footer className="article-footer"><span>Projeto Clima</span><Link href="/">Voltar ao início</Link></footer>
  </main>;
}
