import { readFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const howTo = await readFile("dist/how-to-use-chopsticks/index.html", "utf8");
const types = await readFile("dist/types-of-chopsticks/index.html", "utf8");
const etiquette = await readFile("dist/chopstick-etiquette/index.html", "utf8");

assert(html.includes("Quick Advisor"), "Home page should contain the quick advisor");
assert(html.includes("Shop beginner picks"), "Home page should contain product-led beginner entry");
assert(howTo.includes("How to hold chopsticks step by step"), "How-to page should contain the step guide");
assert(types.includes("Quick comparison table"), "Types page should contain comparison table");
assert(etiquette.includes("Everyday etiquette rules that solve most problems"), "Etiquette page should contain etiquette rules section");

assert(searchTarget("how to use chopsticks") === "/how-to-use-chopsticks/", "How-to search should route correctly");
assert(searchTarget("bamboo chopsticks") === "/materials/chopstick-material-compare/", "Material search should route correctly");
assert(searchTarget("chopstick etiquette") === "/chopstick-etiquette/", "Etiquette search should route correctly");
assert(searchTarget("training chopsticks for kids") === "/guides/training-chopsticks-for-kids/", "Kids search should route correctly");

console.log("Tool logic tests passed.");

function searchTarget(raw) {
  const q = String(raw || "").trim().toLowerCase();
  if (!q) return "/guides/";
  const rules = [
    { pattern: /etiquette|manners|rules/, path: "/chopstick-etiquette/" },
    { pattern: /beginner|hold|use|learn/, path: "/how-to-use-chopsticks/" },
    { pattern: /rice|noodle|ramen|sushi/, path: "/guides/how-to-eat-rice-with-chopsticks/" },
    { pattern: /bamboo|wood|metal|fiberglass|material/, path: "/materials/chopstick-material-compare/" },
    { pattern: /types|compare|vs/, path: "/types-of-chopsticks/" },
    { pattern: /rest|holder/, path: "/guides/chopstick-rest-guide/" },
    { pattern: /kid|training|child/, path: "/guides/training-chopsticks-for-kids/" }
  ];
  const hit = rules.find((rule) => rule.pattern.test(q));
  return hit ? hit.path : "/guides/";
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
