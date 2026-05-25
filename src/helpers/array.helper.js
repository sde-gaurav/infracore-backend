const chunk = (array, size) => {
  if (!array || !size) return [];
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
};

const unique = (array, key) => {
  if (!key) return [...new Set(array)];
  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

const groupBy = (array, key) => array.reduce((acc, item) => {
  const group = item[key];
  if (!acc[group]) acc[group] = [];
  acc[group].push(item);
  return acc;
}, {});

const flatten = (array, depth = 1) => array.flat(depth);

const sortBy = (array, key, order = 'asc') => [...array].sort((a, b) => {
  if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
  if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
  return 0;
});

const pick = (obj, keys) => keys.reduce((acc, key) => {
  if (Object.prototype.hasOwnProperty.call(obj, key)) acc[key] = obj[key];
  return acc;
}, {});

const omit = (obj, keys) => Object.keys(obj).reduce((acc, key) => {
  if (!keys.includes(key)) acc[key] = obj[key];
  return acc;
}, {});

module.exports = { chunk, unique, groupBy, flatten, sortBy, pick, omit };
