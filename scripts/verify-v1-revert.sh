#!/bin/bash
# Single-shot E2E verification AFTER revert to V1 (30248e3).
# Starts dev server, runs public/auth/dashboard checks, kills server — one call.
cd /home/z/my-project

PASS=0; FAIL=0; WARN=0
ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }
check(){ local name="$1" expected="$2" actual="$3"; if [ "$actual" = "$expected" ]; then ok "$name → $actual"; else bad "$name → got $actual, want $expected"; fi }

# ── 1. Server: use platform server on :3000 if alive, else start own ──
echo "[1/6] Server…"
OWN=0
if curl -s --max-time 3 -o /dev/null http://localhost:3000/; then
  ok "using running server on :3000"
else
  OWN=1
  ./node_modules/.bin/next dev -p 3000 > /tmp/v1-verify.log 2>&1 &
  DEVPID=$!
  READY=0
  for i in $(seq 1 45); do
    if curl -s --max-time 2 -o /dev/null http://localhost:3000/; then READY=1; break; fi
    sleep 1
  done
  if [ "$READY" = "1" ]; then ok "own dev server ready in ${i}s"; else bad "server did not start"; tail -20 /tmp/v1-verify.log; exit 1; fi
fi

# ── 2. Public pages ─────────────────────────────────────────────
echo "[2/6] Public pages…"
check "GET /" 200 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"
HOMEPAGE=$(curl -s http://localhost:3000/)
echo "$HOMEPAGE" | grep -q "Unable to open the database" && bad "DB error on home" || ok "no DB error on home"
echo "$HOMEPAGE" | grep -qi "climbix" && ok "home renders brand content" || bad "home missing brand content"
for r in /faq /pricing /blog /about /contact /services/seo /services/ai-search /case-studies; do
  check "GET $r" 200 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$r)"
done

# ── 3. Unauth API guards ────────────────────────────────────────
echo "[3/6] Unauth API guards (V1 baseline)…"
for ep in leads staff meetings clients projects tasks notifications settings roles emails followups media documents export homepage section-content site-content header popup categories; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3000/api/$ep")
  if [ "$CODE" = "401" ] || [ "$CODE" = "403" ]; then ok "unauth /api/$ep → $CODE"; 
  elif [ "$CODE" = "404" ]; then warn "unauth /api/$ep → 404 (endpoint absent at V1?)";
  else warn "unauth /api/$ep → $CODE (open at V1 — known V1 baseline)"; fi
done

# ── 4. Admin login + dashboard endpoints ────────────────────────
echo "[4/6] Admin auth + dashboard…"
ADMIN_PW=$(grep '^ADMIN_PASSWORD=' .env | cut -d'"' -f2)
check "bad-password login" 401 "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@climbixmarketing.com","password":"wrong"}')"
LCODE=$(curl -s -c /tmp/v1-cookies.txt -o /tmp/v1-login.json -w '%{http_code}' -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"admin@climbixmarketing.com\",\"password\":\"$ADMIN_PW\"}")
check "bootstrap login (ADMIN_PASSWORD)" 200 "$LCODE"
check "authed /api/auth/me" 200 "$(curl -s -b /tmp/v1-cookies.txt -o /dev/null -w '%{http_code}' http://localhost:3000/api/auth/me)"
ROLE=$(grep -o '"role":"[A-Z_]*"' /tmp/v1-login.json | head -1)
echo "      login role: ${ROLE:-unknown}"
for ep in leads meetings clients projects tasks notifications staff roles settings homepage section-content site-content header emails followups media blog-posts pages categories documents; do
  CODE=$(curl -s -b /tmp/v1-cookies.txt -o /dev/null -w '%{http_code}' "http://localhost:3000/api/$ep")
  if [ "$CODE" = "200" ]; then ok "authed /api/$ep → 200"; else bad "authed /api/$ep → $CODE"; fi
done

# ── 5. Forms & AI agent ─────────────────────────────────────────
echo "[5/6] Forms & AI…"
check "POST /api/leads (public form)" 201 "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/api/leads -H 'Content-Type: application/json' -d '{"name":"V1 Revert QA","email":"v1-revert-qa@climbixmarketing.com","message":"V1 revert verification","source":"revert-qa"}')"
CCHAT=$(curl -s -o /tmp/v1-chat.json -w '%{http_code}' -X POST http://localhost:3000/api/agent/chat -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"Say OK in one word"}]}')
check "POST /api/agent/chat" 200 "$CCHAT"
grep -q '"reply"' /tmp/v1-chat.json && ok "chat returned reply: $(head -c 80 /tmp/v1-chat.json)" || bad "chat reply malformed"

# ── 6. DB state ─────────────────────────────────────────────────
echo "[6/6] DB state…"
bun -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const u = await p.user.count(); const s = await p.homePageSection.count();
  const st = await p.setting.count(); const l = await p.lead.count();
  console.log('users=' + u + ' homeSections=' + s + ' settings=' + st + ' leads=' + l);
  process.exit(u >= 4 && s > 0 ? 0 : 1);
})().finally(() => p.\$disconnect());
" && ok "DB intact for V1" || bad "DB state wrong"

# ── cleanup ─────────────────────────────────────────────────────
if [ "$OWN" = "1" ]; then kill $DEVPID 2>/dev/null; wait $DEVPID 2>/dev/null; fi
echo ""
echo "════════════════════════════════════"
echo "RESULT: $PASS passed, $FAIL failed, $WARN warnings"
echo "════════════════════════════════════"
[ "$FAIL" = "0" ]
