const generateNIP = (prefix, index) => {
  const paddedIndex = String(index).padStart(5, '0');
  return `${prefix}${paddedIndex}`;
}

module.exports = { generateNIP }