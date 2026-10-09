import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",
    
    // React rules
    "react-hooks/exhaustive-deps": "off",
    "react-hooks/purity": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",

    // Off deliberately, and worth re-enabling if this app ever adopts a real
    // data layer. The rule flags setState anywhere inside an effect body,
    // including calls that only run after an await — it cannot tell the
    // difference. Every remaining hit in this repo is the documented
    // client-fetch pattern:
    //
    //     useEffect(() => { load() }, [load])   // load() awaits, then sets state
    //
    // which the React docs still recommend for client-side fetching without a
    // data library. Refactoring ~25 admin views onto @tanstack/react-query
    // would silence it properly and add caching, but that is a large refactor
    // of working screens, not a lint fix.
    //
    // The genuinely broken variants of this pattern were fixed rather than
    // silenced: state seeded synchronously in an effect (use-mobile,
    // consent-banner, voice-agent-widget), derived state reset by an effect
    // instead of in the handler (documents, blog-view, admin-shell), and state
    // that belonged to an external store (the two deleted hash-view contexts).
    "react-hooks/set-state-in-effect": "off",
    
    // Next.js rules
    "@next/next/no-img-element": "off",
    "@next/next/no-html-link-for-pages": "off",
    
    // General JavaScript rules
    "prefer-const": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-debugger": "off",
    "no-empty": "off",
    "no-irregular-whitespace": "off",
    "no-case-declarations": "off",
    "no-fallthrough": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "no-useless-escape": "off",
  },
}, {
  // perf/ holds standalone tooling that never enters the Next bundle: k6 entry
  // points (load-test.js, smoke.js) and plain Node utilities (report.js,
  // browser-performance.js). The package has no "type": "module", so the Node
  // utilities are legitimately CommonJS and must keep using require().
  files: ["perf/**/*.js"],
  rules: {
    "@typescript-eslint/no-require-imports": "off",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills"]
}];

export default eslintConfig;
