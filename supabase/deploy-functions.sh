#!/usr/bin/env bash
set -euo pipefail

echo "=== Déploiement des Edge Functions Supabase ==="

# Vérifier que supabase CLI est installé
if ! command -v supabase &> /dev/null; then
  if [ -f node_modules/.bin/supabase ]; then
    supabase="node_modules/.bin/supabase"
  else
    echo "❌ Supabase CLI non trouvé. Installe-le avec:"
    echo "   npm install supabase --save-dev"
    echo "   ou brew install supabase/tap/supabase"
    exit 1
  fi
else
  supabase="supabase"
fi

echo "🔑 Liaison au projet..."
$supabase link --project-ref mjiealkqjcqvlfrxdcif

echo "📦 Déploiement de generate-texte..."
$supabase functions deploy generate-texte

echo "📦 Déploiement de generate-image..."
$supabase functions deploy generate-image

echo "📦 Déploiement de generate-audio..."
$supabase functions deploy generate-audio

echo "📦 Déploiement de generate-junior..."
$supabase functions deploy generate-junior

echo ""
echo "🔐 Configuration des secrets (si pas déjà fait)..."
$supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"

echo ""
echo "✅ Edge Functions déployées !"
echo ""
echo "Les fonctions sont accessibles sur:"
echo "  https://mjiealkqjcqvlfrxdcif.supabase.co/functions/v1/generate-texte"
echo "  https://mjiealkqjcqvlfrxdcif.supabase.co/functions/v1/generate-image"
echo "  https://mjiealkqjcqvlfrxdcif.supabase.co/functions/v1/generate-audio"
echo "  https://mjiealkqjcqvlfrxdcif.supabase.co/functions/v1/generate-junior"
