// Tipos que representam o estado em memória de cada jogo
// Usado para detectar mudança de minuto e novo período

export interface EstadoJogo {
    ultimo_tempo: number;   // Último minuto salvo para este jogo
    ultimo_periodo: number; // Último período detectado (1 ou 2)
    ultimo_placar_casa: number;      // Último placar casa conhecido
    ultimo_placar_visitante: number; // Último placar visitante conhecido
}

// Mapa em memória: { jogo_id → EstadoJogo }
export type MapaEstadoJogos = Map<string, EstadoJogo>;
