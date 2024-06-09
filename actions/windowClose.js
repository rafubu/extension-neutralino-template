import Logger from 'loger'
export default ( data, send )=>{
  Logger.log('close app')
  process.exit(0)
}