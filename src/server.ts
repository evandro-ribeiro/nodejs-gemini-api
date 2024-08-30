import { app } from './app';
import { router } from './routes/index';

const port = 3000;
  
app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})

app.use('/', router);