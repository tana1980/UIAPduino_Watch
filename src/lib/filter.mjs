export function matches(resource, filters) {
  return (!filters.region || resource.region === filters.region)
    && (!filters.category || resource.categories.includes(filters.category))
    && (!filters.language || resource.language === filters.language)
    && (!filters.product || resource.products.includes(filters.product))
    && (!filters.q || [resource.title,resource.summary_ja,resource.author,resource.source,...resource.tags,...resource.products].join(' ').normalize('NFKC').toLocaleLowerCase().includes(filters.q.trim().normalize('NFKC').toLocaleLowerCase()));
}
