# PROJECT_LOG — clinic-queue-v2

Ce document trace les travaux effectués sur ce projet pour garder un historique clair.

## Contexte
- Projet de gestion de file d’attente pour la Clinique Dentaire Dabia.
- Cible matérielle contrainte: Raspberry Pi Zero 2 W.
- Objectif principal: affichage salle d’attente fiable, fluide, et simple à exploiter par le personnel.

## Travaux réalisés

### 1) Reprise du projet en V2
- Création du nouveau repo: `clinic-queue-v2`.
- Copie de la base du projet `clinic-queue` vers `clinic-queue-v2`.
- Validation du build front après migration.

### 2) Optimisation affichage pour Pi Zero 2 W
- Refonte de la page `client/src/pages/Display.jsx` en version plus légère.
- Suppression des éléments lourds qui pénalisaient les performances:
  - galerie images massive,
  - météo externe,
  - animations/charges UI non essentielles.
- Conservation du temps réel (socket.io) + fallback polling.

### 3) Nettoyage du repo
- Ajout des fichiers SQLite temporaires dans `.gitignore`:
  - `server/queue.db-shm`
  - `server/queue.db-wal`
- Suppression des assets galerie inutiles de V2 pour réduire le poids global.

### 4) Déploiement kiosque TV (auto)
- Ajout du script:
  - `scripts/start-kiosk.sh`
- Ajout du service systemd:
  - `systemd/clinic-queue-display-kiosk.service`
- Mise à jour du service backend avec les chemins v2:
  - `systemd/clinic-queue.service` -> `/home/pi/clinic-queue-v2/...`

### 5) Amélioration UI branding Dabia
- Mise à jour visuelle de `/display`:
  - couleurs marque (or/rose),
  - logo clinique,
  - cartes plus lisibles,
  - statut connexion visible.
- Compromis gardé: design plus propre sans recharger la page côté performance.

## Commits clés
- `f13530a` — bootstrap v2 + display optimisé Pi Zero
- `13e0472` — suppression assets lourds + kiosk auto-start
- `5befce4` — redesign visuel brandé `/display`

## Exploitation cible (opérationnelle)
- Pi dédié toujours allumé (24/7 de préférence)
- TV allumée le matin par le personnel
- Affichage auto via HDMI + kiosk Chromium
- URLs d’usage:
  - `/reception`
  - `/room/1`
  - `/room/2`
  - `/display`

## Points à faire ensuite (recommandés)
- Ajouter un mini guide d’exploitation imprimable pour le personnel.
- Ajouter un mode maintenance/debug simple (healthcheck + statut service).
- Ajouter une sauvegarde automatique quotidienne de `queue.db`.

---
Document maintenu pour suivre les évolutions du projet.
