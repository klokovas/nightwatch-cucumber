/* eslint-env mocha */
const chai = require('chai')
chai.should()
const testCaseFactory = require('./test-case-factory')

describe('CLI', () => {
  it('should handle test groups', () => {
    return testCaseFactory
      .create('testGroupTest')
      .group('positive')
      .feature('positive addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .group('negative')
      .feature('negative addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run()
      .then((result) => {
        result.features[0].result.status.should.be.passed
        result.features[0].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[0].scenarios[0].result.status.should.be.passed
        result.features[0].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[0].scenarios[1].result.status.should.be.passed
        result.features[0].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
        result.features[1].result.status.should.be.passed
        result.features[1].result.scenarioCounts.should.deep.equal({passed: 2})
        result.features[1].scenarios[0].result.status.should.be.passed
        result.features[1].scenarios[0].result.stepCounts.should.deep.equal({passed: 5})
        result.features[1].scenarios[1].result.status.should.be.passed
        result.features[1].scenarios[1].result.stepCounts.should.deep.equal({passed: 5})
      })
  })

  it('should handle test group filtering', () => {
    return testCaseFactory
      .create('testGroupFilteringTest')
      .group('positive')
      .feature('positive addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .group('negative')
      .feature('negative addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run('nightwatch', ['--group', 'negative'])
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should handle test group skipping', () => {
    return testCaseFactory
      .create('testGroupSkippingTest')
      .group('positive')
      .feature('positive addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .group('negative')
      .feature('negative addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run('nightwatch', ['--skipgroup', 'positive'])
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should handle feature tag filtering', () => {
    return testCaseFactory
      .create('featureTagFilteringTest')
      .feature('positive addition', ['positive', 'addition'])
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .feature('negative addition', ['negative', 'addition'])
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run('nightwatch', ['--tag', 'negative'])
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should handle feature tag skipping', () => {
    return testCaseFactory
      .create('featureTagSkippingTest')
      .feature('positive addition', ['positive', 'addition'])
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .feature('negative addition', ['negative', 'addition'])
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run('nightwatch', ['--skiptags', 'positive'])
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should handle scenario tag filtering', () => {
    return testCaseFactory
      .create('scenarioTagFilteringTest')
      .feature('positive addition')
      .scenario('small numbers', ['small', 'numbers'])
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers', ['big', 'numbers'])
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .run('nightwatch', ['--tag', 'big'])
      .then((result) => {
        result.features[0].scenarios.length.should.equal(1)
        result.features[0].scenarios[0].name.should.equal('big numbers')
        result.features[0].scenarios[0].result.status.should.be.passed
      })
  })

  it('should handle scenario tag skipping', () => {
    return testCaseFactory
      .create('scenarioTagSkippingTest')
      .feature('positive addition')
      .scenario('small numbers', ['small', 'numbers'])
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers', ['big', 'numbers'])
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .run('nightwatch', ['--skiptags', 'small'])
      .then((result) => {
        result.features[0].scenarios.length.should.equal(1)
        result.features[0].scenarios[0].name.should.equal('big numbers')
        result.features[0].scenarios[0].result.status.should.be.passed
      })
  })

  it('should handle specified features execution', () => {
    return testCaseFactory
      .create('specifiedFeaturesExecutionTest')
      .feature('positive-addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .feature('negative-addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run('nightwatch', ['--test', 'features/negative-addition.feature'])
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative-addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should handle single feature execution', () => {
    return testCaseFactory
      .create('singleFeatureExecutionTest')
      .feature('positive-addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter 4 in A field')
      .and('User enter 5 in B field')
      .when('User press Add button')
      .then('The result should contain 9')
      .feature('negative-addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field', function () { this.setValue('#a', -4) })
      .and('User enter -5 in B field', function () { this.setValue('#b', -5) })
      .when('User press Add button')
      .then('The result should contain -9', function () { this.assert.containsText('#result', -9) })
      .scenario('big numbers')
      .given('User is on the simple calculator page')
      .and('User enter -4 in A field')
      .and('User enter -5 in B field')
      .when('User press Add button')
      .then('The result should contain -9')
      .run('nightwatch', ['features/negative-addition.feature'])
      .then((result) => {
        result.features.length.should.equal(1)
        result.features[0].name.should.equal('negative-addition')
        result.features[0].result.status.should.be.passed
      })
  })

  it('should return zero exit code on success', () => {
    return testCaseFactory
      .create('zero-exit-code-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 9', function () { this.assert.containsText('#result', 9) })
      .run()
      .then((result) => {
        result.exitCode.should.equal(0)
      })
  })

  it('should return non zero exit code on failure', () => {
    return testCaseFactory
      .create('screenshot-attachement-test')
      .feature('addition')
      .scenario('small numbers')
      .given('User is on the simple calculator page', function () { this.init() })
      .and('User enter 4 in A field', function () { this.setValue('#a', 4) })
      .and('User enter 5 in B field', function () { this.setValue('#b', 5) })
      .when('User press Add button', function () { this.click('#add') })
      .then('The result should contain 8', function () { this.assert.containsText('#result', 8) })
      .run()
      .then((result) => {
        result.exitCode.should.not.equal(0)
      })
  })
})
