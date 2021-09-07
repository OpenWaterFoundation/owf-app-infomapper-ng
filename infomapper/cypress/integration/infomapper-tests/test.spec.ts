

describe('Testing is fun!', () => {
  it('Read a file', () => {
    cy.readFile('src/assets/app/content-pages/about-the-project.md')
  })
})