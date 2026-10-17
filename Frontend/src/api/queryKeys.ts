export const queryKeys = {
  branches: ['branches'] as const,
  brands: ['brands'] as const,
  productsByBrand: (brandId: number | string) => ['products', 'by-brand', brandId] as const,
  customers: ['customers'] as const,
  warrantyRecords: ['warranty-records'] as const,
  warrantySearch: (term: string) => ['warranty-search', term.trim().toLowerCase()] as const,
  users: ['users'] as const,
};
