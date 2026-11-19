// 日期格式化函数：将ISO日期转换为本地时间格式 (YYYY/MM/DD HH:mm)
const formatDate = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

module.exports = { formatDate }