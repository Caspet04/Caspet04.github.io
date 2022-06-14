const baseUrl = 'http://localhost:3000/cypress-test';

describe('My First Test', () => {
	it('Does not do much!', () => {
		cy.visit(baseUrl);

		const CONTAINER = cy.get('div#container');

		CONTAINER.get('div#unrecognized-name').get('p').contains('undefined is not recognized.');

		CONTAINER.get('form').get('input#name').type('John').should('have.value', 'John');
		CONTAINER.get('div#gupper').get('p').contains('Gupper John!');
		CONTAINER.get('form').get('input#name').clear().should('have.value', '');

		CONTAINER.get('form').get('input#name').type('Samantha').should('have.value', 'Samantha');
		CONTAINER.get('div#gather').get('p').contains('Gather your Magic Samantha!');
		CONTAINER.get('form').get('input#name').clear().should('have.value', '');

		CONTAINER.get('form').get('input#name').type('Blah').should('have.value', 'Blah');
		CONTAINER.get('div#unrecognized-name').get('p').contains('Blah is not recognized.');
		CONTAINER.get('form').get('input#name').clear().should('have.value', '');
	});
});
