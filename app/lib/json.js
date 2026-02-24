
export const parseJSON = (str) => {
  try {
    return str ? JSON.parse(str) : str
  } catch (e) {
    return null
  }
}
