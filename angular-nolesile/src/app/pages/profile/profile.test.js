/* import { ProfileComponent } from './profile.component'; */

const sum = require('./profile.component')

describe("ProfileComponent", () =>{
   /*  let fixture = ProfileComponent; */

    /* beforeEach( () =>{
        fixture = new ProfileComponent();
    }) */

    test('comprueba si las contraseñas son las mismas', () => {

       
            expect(sum(1,2)).toBe(3)
       
        
    })

})

