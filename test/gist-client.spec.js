/* eslint-env jest */
import GistClient from '../src/gist-client'

const pack = require('../package.json')
jest.setTimeout(64000)

const gc = new GistClient(
  process.env.GITHUB_TOKEN
)

describe(pack.name, () => {
  test('/gists/public', async () => {
    const r = await gc.get('/gists/public')
    expect(r.data.length > 0).toBe(true)
  })
  test('create/update/get', async () => {
    const r = await gc.post('/gists', {
      description: 'Hello World Examples',
      public: false,
      files: {
        'hello_world.rb': {
          content: 'class HelloWorld\n   def initialize(name)\n      @name = name.capitalize\n   end\n   def sayHi\n      puts \'Hello !\'\n   end\nend\n\nhello = HelloWorld.new(\'World\')\nhello.sayHi'
        },
        'hello_world.py': {
          content: 'class HelloWorld:\n\n    def __init__(self, name):\n        self.name = name.capitalize()\n       \n    def sayHi(self):\n        print \'Hello \' + self.name + \'!\'\n\nhello = HelloWorld(\'world\')\nhello.sayHi()'
        },
        'hello_world_ruby.txt': {
          content: 'Run `ruby hello_world.rb` to print Hello World'
        },
        'hello_world_python.txt': {
          content: 'Run `python hello_world.py` to print Hello World'
        }
      }
    })
    const { id } = r.data
    expect(!!id).toBe(true)
    const r1 = await gc.getOne(id)
    expect(r1.data.id).toEqual(id)

    const u1 = await gc.update(id, {
      description: 'Hello World Examples',
      files: {
        'hello_world_ruby.txt': {
          content: 'Run `ruby hello_world.rb` or `python hello_world.py` to print Hello World',
          filename: 'hello_world.md'
        },
        'hello_world_python.txt': null,
        'new_file.txt': {
          content: 'This is a new placeholder file.'
        }
      }
    })
    expect(u1.data.files['new_file.txt'].content).toEqual('This is a new placeholder file.')
    const d = await gc.delOne(id)
    expect(d.status).toEqual(204)
  })
})
