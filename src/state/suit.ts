/**
 * Traje da astronauta: integridade, dano por rochas pontiagudas, vazamento de O₂ e reparo no abrigo.
 * Astronaut suit: integrity, damage from sharp rocks, O₂ leak and repair at shelter.
 *
 * Só lógica, sem Phaser e sem texto. Regras e números vêm do protótipo v3 e do ankerona-prototipo-atual.
 * Logic only, no Phaser and no text. Rules and numbers come from the v3 and current prototypes.
 * Ciência / Science: em 2013, rochas pontiagudas rasgaram as rodas do Curiosity. Em Marte, um rasgo no traje
 * pressurizado causa vazamento de oxigênio e risco de despressurização rápida na atmosfera de menos de 1% da terrestre.
 * In 2013, spiky rocks tore Curiosity's wheels. On Mars, a puncture in the pressurized suit leads to oxygen leaks
 * and fast decompression risk in an atmosphere less than 1% of Earth's.
 */
import type { Emit } from './night';

export const SUIT = {
  sharpDamage: 7, // % de integridade do traje perdida por passo em rocha pontiaguda / % suit lost per step on spiky rock
  leakThreshold: 50, // abaixo de 50%, o traje começa a vazar O₂ (esforço 1,6x) / below 50%, suit leaks O₂ (1.6x effort)
  leakFactor: 1.6, // multiplicador de consumo de O₂ com traje furado / O₂ drain multiplier with breached suit
  refillPerSecond: 25, // % reparada por segundo real no abrigo / % repaired per real second at shelter
  breachPenaltyMinutes: 60, // integridade zerada: EVA abortada, perde 1 h / integrity zeroed: EVA aborted, loses 1 h
} as const;

export class SuitSystem {
  integrity = 100;
  firstSharp = true;
  private repairing = false;

  /** Multiplicador de consumo de O₂: vaza 1,6x mais quando a integridade cai abaixo de 50%. / O₂ leak multiplier: leaks 1.6x more below 50% integrity. */
  leakMultiplier(): number {
    return this.integrity < SUIT.leakThreshold ? SUIT.leakFactor : 1;
  }

  /** Dano por pisar em rocha pontiaguda: perde integridade e avisa. / Damage from stepping on sharp rock: loses integrity and notifies. */
  damageSharp(emit: Emit): void {
    this.integrity = Math.max(0, this.integrity - SUIT.sharpDamage);
    const first = this.firstSharp;
    if (first) this.firstSharp = false;
    emit('suit-damaged', { suit: this.integrity, first });
  }

  /** Repara no abrigo (habitat ou rover pressurizado). / Repairs at shelter (habitat or pressurized rover). */
  repair(dt: number): boolean {
    if (this.integrity >= 99.5) {
      this.integrity = 100;
      this.repairing = false;
      return false;
    }
    this.integrity = Math.min(100, this.integrity + dt * SUIT.refillPerSecond);
    const started = !this.repairing;
    this.repairing = true;
    return started;
  }

  /** Restaura o traje por completo (usado ao acordar ou resetar). / Fully restores suit (used on wake or reset). */
  reset(): void {
    this.integrity = 100;
    this.repairing = false;
  }

  get breached(): boolean {
    return this.integrity <= 0;
  }
}
