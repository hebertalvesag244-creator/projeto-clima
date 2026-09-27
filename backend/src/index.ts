import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3001);
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.get("/api/weather", async (request, response) => {
  const city = String(request.query.city ?? "").trim();
  if (!city) return response.status(400).json({ error: "Informe o nome de uma cidade." });
  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.search = new URLSearchParams({ name: city, count: "1", language: "pt", format: "json" }).toString();
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Falha ao localizar cidade");
    const geo = await geoResponse.json() as { results?: Array<{ name: string; admin1?: string; country: string; latitude: number; longitude: number }> };
    const location = geo.results?.[0];
    if (!location) return response.status(404).json({ error: "Cidade não encontrada. Tente outro nome." });
    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.search = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m", daily: "weather_code,temperature_2m_max,temperature_2m_min", forecast_days: "5", timezone: "auto" }).toString();
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) throw new Error("Falha ao obter previsão");
    response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return response.json({ location, ...await forecastResponse.json() });
  } catch (error) {
    console.error("Weather request failed:", error);
    return response.status(502).json({ error: "Serviço de previsão indisponível. Tente novamente em instantes." });
  }
});
const articles = [
  { slug: "interpretar-chance-de-chuva", category: "Previsão", title: "Como interpretar a chance de chuva", summary: "Entenda como usar a previsão de chuva no planejamento do seu dia e o que observar além da porcentagem.", readingMinutes: 3 },
  { slug: "tempo-e-clima", category: "Clima", title: "Tempo e clima: qual é a diferença?", summary: "Uma explicação simples para separar as condições de hoje das tendências observadas ao longo do tempo.", readingMinutes: 4 },
  { slug: "calor-e-rotina", category: "Meio ambiente", title: "Dias de calor: como se preparar", summary: "Ideias práticas para acompanhar períodos quentes e organizar melhor as atividades do dia a dia.", readingMinutes: 3 }
];

app.get("/api/articles", (_request, response) => {
  response.setHeader("Cache-Control", "public, max-age=300");
  response.json({ items: articles, demo: true });
});

app.listen(port, () => console.log("API do Projeto Clima em http://localhost:" + port));
