# Fersch 3D – Plateforme d'impression 3D

Ce dépôt contient la version initiale de la plateforme **Fersch 3D**, un service de devis et de commande en ligne pour l'impression 3D. Le but est de proposer une expérience fluide : chargement d'un fichier STL, analyse automatique via PreForm CLI, calcul de prix basé sur des paramètres modifiables, génération d'un devis PDF, paiement via Stripe et gestion des commandes. Une interface d'administration permet de modifier en temps réel tous les paramètres du calcul de prix.

## Fonctionnalités

- **Upload et analyse STL** : l'utilisateur peut charger un fichier `.stl`. Le serveur appelle PreForm CLI (via Wine si nécessaire) pour ajouter des supports automatiquement et renvoyer le volume de résine et le temps d'impression.
- **Calcul de prix dynamique** : en fonction du volume, du temps d'impression, de la résine choisie et de la quantité, le prix est calculé selon les formules définies dans `data/settings.json`. Tous les paramètres (prix des résines, majorations, coût machine, TVA, etc.) sont modifiables dans l'interface d'administration.
- **Devis PDF** : un devis propre est généré en PDF via [pdf-lib](https://github.com/Hopding/pdf-lib) avec le logo Fersch 3D et un tableau récapitulatif.
- **Paiement Stripe** : (à implémenter) une session de paiement Stripe permet de régler la commande en ligne.
- **Interface d'administration** : accessible sous `/admin`, elle permet de modifier les prix, majorations, coûts fixes, TVA et options de livraison. Les modifications sont persistées dans `data/settings.json`.

## Structure du projet

- `app/` : application Next.js utilisant l’App Router.
  - `page.tsx` : page d’accueil.
  - `devis/page.tsx` : formulaire de devis avec upload, analyse et affichage du prix.
  - `commande/page.tsx` : formulaire de commande (placeholder à compléter).
  - `admin/page.tsx` : interface d’administration des paramètres.
  - `api/` : API routes :
    - `analyze/route.ts` : appelle PreForm CLI pour extraire volume et temps d’impression.
    - `price/route.ts` : calcule le prix final selon les paramètres du fichier `settings.json`.
    - `settings/route.ts` : expose les paramètres de prix (GET/POST).
    - `pdf/route.ts` : génère un PDF de devis.
- `data/` : fichiers de données persistants (versionnées pour l’exemple)
  - `settings.json` : configuration des prix et majorations.
  - `devis.json` : liste des devis générés (non utilisée pour l’instant).
  - `commandes.json` : liste des commandes (non utilisée pour l’instant).
- `public/` : ressources statiques (logos).
- `.env.example` : modèle de variables d’environnement à copier dans `.env`.
- `install.sh` : script d’installation automatique pour un serveur Linux.

## Installation rapide

> **Pré‑requis** : un serveur Linux (Ubuntu/Debian), un accès `sudo` et un nom de domaine pointant vers le serveur. La CLI PreForm doit être téléchargée depuis Formlabs (lien non fourni) et installée via Wine.

1. Copiez ce projet sur votre serveur (via `git clone`, transfert SFTP ou autre). Par exemple :

   ```bash
   git clone https://github.com/Asuny74/fersch-3d-deploy.git
   cd fersch-3d-deploy/fersch-3d
   ```

2. Dupliquez le fichier `.env.example` en `.env` et remplissez les variables :
   - `PREFORM_CLI` : chemin de la CLI `preform-cli` (ex : `/usr/local/bin/preform-cli`).
   - `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` : vos clés Stripe (mode test ou live).
   - `SMTP_*` : paramètres SMTP pour l’envoi d’emails.
   - `BASE_URL` : URL de votre site (utile dans les emails).

3. Rendez le script d’installation exécutable et lancez‑le :

   ```bash
   chmod +x install.sh
   sudo ./install.sh
   ```

   Le script :
   - Installe Node.js LTS et Wine s’ils ne sont pas déjà présents.
   - Installe PM2 pour gérer le processus Node.
   - Clone ou met à jour le dépôt dans `/var/www/fersch-3d` (modifiable via la variable `APP_DIR`).
   - Exécute `npm install` et `npm run build`.
   - Démarre l’application via PM2 et configure le démarrage automatique.
   - Configure Nginx pour proxyfier le trafic HTTP vers l’application Node (si Nginx est installé).

4. Ouvrez votre navigateur et rendez‑vous sur `http://<votre-domaine>` pour accéder au site. L’interface d’administration est disponible sur `/admin`.

## Développement

Pour lancer le serveur de développement local :

```bash
npm install
npm run dev
```

Cela démarre Next.js en mode `dev` sur `http://localhost:3000` avec rechargement à chaud.

## Personnalisation

- Les couleurs et la typographie se trouvent dans `tailwind.config.js` et `app/globals.css`. Adaptez‑les à la charte graphique de Fersch.
- Les logos sont dans `public/logos`. Remplacez‑les par les versions fournies.
- Les paramètres de prix sont définis dans `data/settings.json` et modifiables via l’interface `/admin`.

## Limitations et pistes d’amélioration

- **Stripe et commandes** : la logique de paiement Stripe et l’enregistrement des commandes sont à compléter (`/commande` et API correspondante).
- **PréForm CLI** : le script ne télécharge pas automatiquement PreForm CLI. Vous devez récupérer l’exécutable auprès de Formlabs et le placer à l’emplacement indiqué dans `.env`.
- **Sécurité** : les routes d’administration et d’API ne sont pas protégées par authentification. En production, prévoyez une authentification simple (par exemple via un mot de passe ou un token).
- **Email** : les gabarits d’email et la génération de devis PDF peuvent être enrichis.

Bon développement !