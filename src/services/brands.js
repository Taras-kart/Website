const brands = [
  ['Twin Birds', ['twinbirds', 'twinbird']],
  ['Charak', ['charak']],
  ['Intimacy', ['intimacy']],
  ['Jockey', ['jockey']],
  ['Gokul', ['gokul']],
  ['Dixcy Scott', ['dixcyscott']],
  ['Pomex', ['pomex', 'poomex']],
  ['Milton', ['milton']],
  ['Aswati', ['aswati', 'aswathi', 'aswathy', 'aswathiy']],
  ['Quick Dry', ['quickdry']],
  ['Selvas', ['selvas']],
  ['Cucumber', ['cucumber', 'cucumbers']],
  ['Dazzle Prime', ['dazzleprime']],
  ['Techno Sport', ['technosport']]
]
const key = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const displayBrand = value => brands.find(([, aliases]) => aliases.includes(key(value)))?.[0] || 'Fashion'
export { brands, displayBrand }
