export function generateSlug(title: string) {
  const slug = title.toLowerCase().replaceAll(/\s+/g, '-');
  return slug.replaceAll(/[^a-z0-9-]/g, '');
}
