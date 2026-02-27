// Tipos que representam o estado em memória de cada jogo
// Usado para detectar mudança de minuto e novo período

export interface EstadoJogo {
    ultimo_tempo: number;   // Último minuto salvo para este jogo
    ultimo_periodo: number; // Último período detectado (1 ou 2)
}

// Mapa em memória: { jogo_id → EstadoJogo }
export type MapaEstadoJogos = Map<string, EstadoJogo>;
