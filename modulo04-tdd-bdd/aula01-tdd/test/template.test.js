import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { server } from '../src/api.js'
/*
    -Deve cadastrar usuarios e definir uma categoria onde:
        - Jovens adunltos:
            - Usuarios de 18-25
        - Adultos:
            - Usuarios de 26-50
        - Idosos:
            - 51+
        -Menor
            - Estoura um erro
*/

describe('API Users E2e Suite', () => {
    function waitForServerStatus(server) {
        return new Promise((resolve, reject) => {
            server.once('error', (err) => reject(err))
            server.once('listening', () => resolve())
        })
    }

    function createUser(data) {
        return fetch(`${_testServerAddress}/users`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }

    async function findUserById(id) {
        const user = await fetch(`${_testServerAddress}/users/${id}`)
        return user.json()
    }

    let _testServer
    let _testServerAddress

    beforeAll(async () => {
        _testServer = server.listen()

        await waitForServerStatus(_testServer)

        const serverInfo = _testServer.address()
        _testServerAddress = `http://localhost:${serverInfo.port}`

    })

    afterAll(done => {
        server.closeAllConnections()
        _testServer.close(done)
    }, 15000)


    it('should register a new user with young-adult category', async () => {
        const expectedCategory = 'young-adult'
        //importante pois o ano que vem o teste pode quebrar
        // sempre que estiver usando datas, sempre mockar o tempo!s
        jest.useFakeTimers({
            now: new Date('2024-11-23T00:00')
        })
        const response = await createUser({
            name: 'Maximiliano Muñoz Cavalcanti',
            birthDay: '2001-01-01'
        })
        expect(response.status).toBe(201) //201 - created

        const result = await response.json()
        expect(result.id).not.toBeUndefined()

        const user = await findUserById(result.id)
        expect(user.category).toBe(expectedCategory)

    })
    it.todo('should register a new user with adult category')
    it.todo('should register a new user with senior category')

    it('should throw an error when registering an under-age user', async () => {
        jest.useFakeTimers({
            now: new Date('2024-11-23T00:00')
        })
        const response = await createUser({
            name: 'Maximiliano Muñoz Cavalcanti',
            birthDay: '2010-01-01'
        })

        expect(response.status).toBe(400)
        const result = await response.json()
        expect(result).toEqual({
            message: 'Age should be over 18yo!'
        })
    })


})
