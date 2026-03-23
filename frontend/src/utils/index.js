export function createPageUrl(pageName) {
  return "/" + pageName.replace(/ /g, "-");
}

