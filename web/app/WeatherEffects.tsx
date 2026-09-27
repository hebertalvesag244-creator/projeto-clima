'use client';

import { useMemo } from 'react';
import styles from './WeatherEffects.module.css';

export type WeatherEffectsProps = {
  /** Código de tempo no padrão WMO (o mesmo usado pelo Open-Meteo) */
  weatherCode: number;
  /** Temperatura atual em °C */
  temperature: number;
  className?: string;
};

type SkyEffect = 'sun' | 'cloudy' | 'fog' | 'rain' | 'thunder';
type TempEffect = 'frost' | 'heat' | null;

/** Pseudo-aleatório determinístico (mesmo valor no servidor e no cliente, sem risco de hydration mismatch) */
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function getSkyEffect(code: number): SkyEffect {
  if ([95, 96, 99].includes(code)) return 'thunder';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([45, 48].includes(code)) return 'fog';
  if ([1, 2, 3, 71, 73, 75, 77, 85, 86].includes(code)) return 'cloudy';
  return 'sun'; // 0 = céu limpo, e fallback para códigos não mapeados
}

function getTempEffect(temperature: number): TempEffect {
  if (temperature <= 5) return 'frost';
  if (temperature >= 30) return 'heat';
  return null;
}

export default function WeatherEffects({ weatherCode, temperature, className }: WeatherEffectsProps) {
  const sky = useMemo(() => getSkyEffect(weatherCode), [weatherCode]);
  const temp = useMemo(() => getTempEffect(temperature), [temperature]);

  const raindrops = useMemo(
    () =>
      sky === 'rain' || sky === 'thunder'
        ? Array.from({ length: sky === 'thunder' ? 45 : 35 }, (_, i) => ({
            left: pseudoRandom(i + 1) * 100,
            duration: 0.6 + pseudoRandom(i + 50) * 0.5,
            delay: pseudoRandom(i + 100) * 2,
          }))
        : [],
    [sky]
  );

  const clouds = useMemo(
    () =>
      sky === 'cloudy' || sky === 'fog'
        ? Array.from({ length: sky === 'fog' ? 5 : 4 }, (_, i) => ({
            top: 8 + pseudoRandom(i + 200) * 40,
            scale: 0.7 + pseudoRandom(i + 250) * 0.6,
            duration: 40 + pseudoRandom(i + 300) * 30,
            delay: -pseudoRandom(i + 350) * 40,
          }))
        : [],
    [sky]
  );

  const frostParticles = useMemo(
    () =>
      temp === 'frost'
        ? Array.from({ length: 25 }, (_, i) => ({
            left: pseudoRandom(i + 400) * 100,
            duration: 4 + pseudoRandom(i + 450) * 4,
            delay: pseudoRandom(i + 500) * 5,
            size: 3 + pseudoRandom(i + 550) * 3,
          }))
        : [],
    [temp]
  );

  const flashDelay = pseudoRandom(weatherCode + 999) * 4;

  return (
    <div className={`${styles.container} ${className ?? ''}`} aria-hidden="true">
      {sky === 'sun' && (
        <div className={styles.sun}>
          <div className={styles.sunRays} />
          <div className={styles.sunCore} />
        </div>
      )}

      {(sky === 'cloudy' || sky === 'fog') &&
        clouds.map((c, i) => (
          <div
            key={i}
            className={sky === 'fog' ? styles.fogBand : styles.cloud}
            style={{
              top: `${c.top}%`,
              transform: `scale(${c.scale})`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}

      {(sky === 'rain' || sky === 'thunder') && (
        <div className={styles.rain}>
          {raindrops.map((d, i) => (
            <span
              key={i}
              className={styles.drop}
              style={{
                left: `${d.left}%`,
                animationDuration: `${d.duration}s`,
                animationDelay: `${d.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {sky === 'thunder' && <div className={styles.flash} style={{ animationDelay: `${flashDelay}s` }} />}

      {temp === 'frost' && (
        <div className={styles.frost}>
          {frostParticles.map((p, i) => (
            <span
              key={i}
              className={styles.frostParticle}
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {temp === 'heat' && (
        <div className={styles.heat}>
          <div className={styles.heatGlow} />
          <div className={styles.heatShimmer} />
        </div>
      )}
    </div>
  );
}

