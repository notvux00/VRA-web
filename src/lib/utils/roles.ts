export function getCollectionName(role?: string) {
  if (!role) return "parents";
  const r = role.toLowerCase();
  if (r === "admin" || r === "system_admin") return "system_admins";
  if (r === "center" || r === "center_manager") return "center_managers";
  if (r === "expert") return "experts";
  return "parents";
}
