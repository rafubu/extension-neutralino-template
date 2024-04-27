export default ( data, send )=>{
  console.log({data});
  send('eventFromExtension', 'Hello from extension!')
}