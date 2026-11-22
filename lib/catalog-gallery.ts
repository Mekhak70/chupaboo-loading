/** Swap the selected cover with the original cover without losing either image. */
export function selectCatalogCover(main: string, additional: string[], selected?: string | null) {
  const images = [...new Set([main, ...additional].filter(Boolean))];
  const imagePath = selected && images.includes(selected) ? selected : main;
  return { imagePath, additionalImagePaths: images.filter(path => path !== imagePath) };
}
