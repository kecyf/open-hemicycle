/** Génère un slug URL-safe à partir d'un prénom + nom (+ uid pour l'unicité). */
export function slugify(prenom: string, nom: string, uidAn: string): string {
  const base = `${prenom} ${nom}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Suffixe court de l'uid AN pour garantir l'unicité (homonymes).
  const suffix = uidAn.replace(/^PA/, "").slice(-5);
  return `${base}-${suffix}`;
}
