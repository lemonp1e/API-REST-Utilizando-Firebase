const admin = require('firebase-admin');
const express = require('express');
const app = express();
const server = require('http').Server(app);

//firebase
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://<BaseDeDatos>.firebaseio.com/'
});
const db = admin.database().ref('pruebaConExpress');
const DBUsuarios = db.child('Usuarios');


app.use(express.json());
app.use(express.urlencoded({extended: true})); 


app.get('/api/guardar', async (req, res)=>{
    var id = 0;
    await DBUsuarios.once('value', (snapshot)=>{
        const Datos = snapshot.val();
        if (Datos != null) for (const el in Datos) id++;
    });

    var datosQuery = {
        "id": id,
        "personal":{
            "nombre": req.query.nombre,
            "apellido": req.query.apellido
        }
    };
    DBUsuarios.child(id).set(datosQuery, ()=>{
        console.log(`\nDatos con ID:${id}, NOMBRE:${req.query.nombre}, APELLIDO:${req.query.apellido} fueron agregados a la base de datos.\n`)
    });
    res.send(`Datos con ID:${id}, NOMBRE:${req.query.nombre}, APELLIDO:${req.query.apellido} fueron agregados a la base de datos.`);
});
app.get('/api/all', (req, res)=>{
    DBUsuarios.once('value', (snapshot)=>{
        var todosLosDatos = snapshot.val();
        if(todosLosDatos == null){
            res.send('No hay datos');
        }else{
            res.send(todosLosDatos);
            console.log(`\nTodos los datos de la base de datos fueron enviados hacia y por petición de ${req.ip}.\n`)
        }
    })
});
app.get('/api/id/:id', (req,res)=>{
    DBUsuarios.once('value', (snapshot)=>{
        var todosLosDatos = snapshot.val();
        if (todosLosDatos == null){
            res.send('No hay datos.');
        }else{
            const datosEnArray = [];
            for (const el in todosLosDatos) datosEnArray.push(todosLosDatos[el]);
            console.log(datosEnArray);
            var resultado = datosEnArray.filter(dato => dato.id == req.params.id);
            res.send(resultado);
            console.log(`\nLos datos de la id ${req.params.id} fueron enviados hacia y por petición de ${req.ip}.\n`)
        }
    })
});


server.listen(8080, async ()=>{
    console.log('Servidor escuchando en el puerto 8080');
});