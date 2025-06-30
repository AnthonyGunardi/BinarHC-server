// `user_Hire_Date` represents the employee's hire date, retrieved from the `Biodata` model in the Sequelize `User` object. (user.Biodata.hire_date)
// `user_Annual` represents the total annual leave entitlement of the employee, retrieved from the `Biodata` model in the Sequelize `User` object.
// `user_Absence_Request` is an array of current year'sabsence requests retrieved from the Sequelize `User` model. (user.Absence_Request)

const calculateRemainingLeave = ( user_Hire_Date, user_Annual, user_Absence_Request, user_is_permanent) => {
  let remainingAnnualLeave = 0;
  let totalAbsenceDays = 0;

  // Count used leave days
  user_Absence_Request.forEach(absence => {
    const startDate = new Date(absence.start_date);
    const endDate = new Date(absence.end_date);
    const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Include the start day
    totalAbsenceDays += duration;
  });

  // Count work period (months difference between hire date and current date)
  const hireDateObject = new Date(user_Hire_Date);
  const currentDate = new Date();
  // Hitung perbedaan tahun dan bulan
  const yearsDifference = currentDate.getFullYear() - hireDateObject.getFullYear();
  const monthsDifference = currentDate.getMonth() - hireDateObject.getMonth();
  // Total selisih dalam bulan
  const totalMonthsDifference = yearsDifference * 12 + monthsDifference;
  // If work period > 2 years
  if (totalMonthsDifference >= 24) {
    remainingAnnualLeave = user_Annual - totalAbsenceDays;
  }
  else if (totalMonthsDifference < 24 && totalMonthsDifference > 12) {
    let hiredMonth = hireDateObject.getMonth();
    let totalYearsDefference = currentDate.getFullYear() - hireDateObject.getFullYear() || 0;
    let tempRemainingAnnual = 0;
             
    if (hireDateObject.getDate() > 15) {
        hiredMonth++;
    }

    if (totalYearsDefference >= 2) {
      tempRemainingAnnual = user_Annual - totalAbsenceDays;
    } else {
      tempRemainingAnnual = user_Annual - totalAbsenceDays - hiredMonth;
    }
    
    if (tempRemainingAnnual < 0) {
      remainingAnnualLeave = 0;
    } else {
      remainingAnnualLeave = tempRemainingAnnual;
    }
  }
  // If work period is exactly 1 year
  else if (totalMonthsDifference === 12) {
    if (hireDateObject.getDate() > 15) {
      remainingAnnualLeave = 0;
    } else {
      let monthHire = hireDateObject.getMonth();
      let tempAnnual = user_Annual - totalAbsenceDays - monthHire;
      if (tempAnnual < 0) {
        remainingAnnualLeave = 0;
      } else {
        remainingAnnualLeave = tempAnnual;
      }
    }
  }
  // If work period is less than 1 year
  else {
    // Hapus setelah 1 Agustus 2025!
    if (user_is_permanent) {
      remainingAnnualLeave = user_Annual - totalAbsenceDays;
    } else {
      remainingAnnualLeave = 0;
    }
  }

  return remainingAnnualLeave;
}

module.exports = { calculateRemainingLeave }
