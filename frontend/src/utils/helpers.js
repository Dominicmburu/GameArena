const crypto = require('crypto')

const generateShareId = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

const calculatePrizeDistribution = (totalPrize, participants) => {
  // 60% to 1st, 25% to 2nd, 15% to 3rd
  return {
    first: totalPrize * 0.6,
    second: totalPrize * 0.25,
    third: totalPrize * 0.15
  }
}

const validatePhoneNumber = (phoneNumber) => {
  // Kenyan phone number validation
  const cleaned = phoneNumber.replace(/\D/g, '')
  return cleaned.startsWith('254') && cleaned.length === 12
}

module.exports = {
  generateShareId,
  calculatePrizeDistribution,
  validatePhoneNumber
}
