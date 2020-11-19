const confirmarPassword = require('./profile.component')

test('comprueba si las contraseñas son las mismas', () => {
   expect(confirmarPassword('111111').toBe('111111')) 
})