const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  const formattedDate = `${day}${month}${year}`;
  return formattedDate;
}

module.exports = { formatDate }