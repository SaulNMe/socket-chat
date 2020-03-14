const { io } = require('../server');
const { Usuarios } = require('../clases/usuarios');
const { crearMensaje } = require('../utils/utils');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (usuario, callback) => {
        if(!usuario.nombre || !usuario.sala) {
            return callback({
                ok: false,
                error: {
                    message: "El nombre/sala es necesario"
                }
            })
        }

        client.join(usuario.sala);

        usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);

        client.broadcast.to(usuario.sala).emit('listaPersonas',  usuarios.getPersonasPorSala(usuario.sala));

        callback(usuarios.getPersonasPorSala(usuario.sala));
    });

    client.on('crearMensaje', (data) => {
        
        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    });

    client.on('disconnect', () => {
        let usuarioBorrado = usuarios.borrarPersona(client.id);

        client.broadcast.to(usuarioBorrado.sala).emit('crearMensaje', crearMensaje('Administrador', `${usuarioBorrado.nombre} salió`));
        client.broadcast.to(usuarioBorrado.sala).emit('listaPersonas',  usuarios.getPersonasPorSala(usuarioBorrado.sala));
    });

    client.on('mensajePrivado', (data) => {

        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.to).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    });

});

