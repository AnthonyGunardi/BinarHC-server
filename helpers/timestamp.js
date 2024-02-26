const createTimeStamp = (inputDate, inputTime) => {
  // Pisahkan nilai tanggal dan waktu
  const [year, month, day] = inputDate.split('-'); // Pisahkan tahun, bulan, dan hari
  const [hour, minute] = inputTime.split(':'); // Pisahkan jam dan menit

  // Buat objek Date dari nilai tanggal dan waktu
  const dateTime = new Date(year, month - 1, day, hour, minute);

  // Ambil nilai timestamp
  const timestamp = dateTime.getTime() + (420 * 60 * 1000); // Nilai timestamp dalam milidetik
  
  return timestamp
}

module.exports = { createTimeStamp }