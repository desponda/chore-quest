# ChoreQuest

Family chore gamification app. Children earn credits by completing quests and can redeem them for rewards. Built with Next.js 16, Prisma, NextAuth, and a dark fantasy theme.

## Local Dev Setup

```bash
git clone https://github.com/desponda/chore-quest
cd chore-quest
npm install
cp .env.example .env
npm run dev
```

Then seed the database:

```bash
npx prisma db push
npx prisma db seed
```

App runs at http://localhost:3000. On first load you'll be redirected to `/signin`.

**Default dev login:** `parent@example.com` / `password123`
**Parent PIN (for parent dashboard):** `1234`

## PostgreSQL Local Dev

Start PostgreSQL with docker compose:

```bash
docker compose up postgres
```

Then update `.env`:

```
DATABASE_URL="postgresql://chorequest:chorequest@localhost:5432/chorequest"
```

Copy the PostgreSQL schema and push:

```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
npx prisma db push
npx prisma db seed
```

Then run `npm run dev` as usual.

## How It Works

- `/` — Family hub, choose your hero (requires sign-in)
- `/child/[id]/quests` — Hero's quest board
- `/child/[id]/rewards` — Treasure vault for spending credits
- `/parent` — Parent dashboard (requires sign-in + 4-digit PIN)
- `/signin`, `/signup` — Auth pages

Multi-tenant: each family account has its own isolated children, quests, and rewards.

## API Reference

`GET /api` — self-documenting endpoint listing all available routes.

All API routes require an authenticated session cookie.

Key endpoints:
- `GET /api/children` — list heroes
- `POST /api/children` — create hero
- `GET /api/quests` — list quests
- `POST /api/quests` — create quest (with optional `assignTo: [childId]`)
- `GET /api/rewards` — list rewards
- `POST /api/rewards` — create reward
- `PATCH /api/children/[id]` — adjust credits (`creditsAdjustment: ±N`) or rename

## Deployment to k3s Homelab

Uses ArgoCD + Cloudflare Tunnel. See [homelab-k8s-infra](https://github.com/desponda/homelab-k8s-infra) for cluster setup.

Before deploying, create the k8s secret:

```bash
kubectl create namespace chore-quest
kubectl create secret generic chore-quest-secret \
  --namespace chore-quest \
  --from-literal=database-url="postgresql://user:pass@host:5432/chorequest" \
  --from-literal=nextauth-secret="$(openssl rand -base64 32)"
```

Also create the ghcr pull secret:

```bash
kubectl create secret docker-registry ghcr-credentials \
  --namespace chore-quest \
  --docker-server=ghcr.io \
  --docker-username=desponda \
  --docker-password=<github-pat>
```

The GitHub Actions workflow builds on push to `main` and updates `k8s/helm/chore-quest/values.yaml` with the new image tag. ArgoCD picks up the change and deploys automatically.

Add to homelab-k8s-infra `applications/apps/chore-quest.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: chore-quest
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/desponda/chore-quest.git
    targetRevision: main
    path: k8s/helm/chore-quest
  destination:
    server: https://kubernetes.default.svc
    namespace: chore-quest
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```
