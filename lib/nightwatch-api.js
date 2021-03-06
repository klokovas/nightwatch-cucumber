'use strict'

const _ = require('lodash')
const co = require('co')
const pify = require('pify')
const fs = pify(require('fs'), { include: ['readFile'] })
const hookUtils = require('./hook-utils')
const Runner = require.main.require('nightwatch/lib/runner/run')
const ClientManager = require.main.require('nightwatch/lib/runner/clientmanager')
const ClientRunner = require.main.require('nightwatch/lib/runner/cli/clirunner')
const ChildProcess = require.main.require('nightwatch/lib/runner/cli/child-process')
const Utils = require.main.require('nightwatch/lib/util/utils')
const Protocol = require.main.require('nightwatch/lib/api/protocol')

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

module.exports = class NightwatchApi {
  _startSession (options) {
    this.client = new ClientManager()
    this.client.init(options)
    this.client.api('currentEnv', options.currentEnv)
    this.protocol = Protocol(this.client.get())
  }

  * _closeSession () {
    yield new Promise((resolve, reject) => {
      this.client.get().on('nightwatch:finished', function () {
        resolve()
      })
      this.client.terminate()
    })
  }

  * takeScreenshot (moduleName, testName) {
    const filePath = Utils.getScreenshotFileName(
      {module: moduleName, name: testName},
      true,
      this.client.options.screenshots.path
    )

    yield new Promise((resolve, reject) => {
      this.protocol.screenshot(false, (response) => {
        if (response.state !== 'success') {
          reject(new Error('Creating screenshot was not successful. Response was:\n' + require('util').inspect(response)))
        }

        this.client.get().saveScreenshotToFile(filePath, response.value, (err) => {
          if (err) reject(err)
          resolve()
        })
      })
    })

    const content = yield fs.readFile(filePath, 'base64')

    return {
      data: new Buffer(content, 'base64'),
      mimeType: 'image/png'
    }
  }

  addTestModulePaths (modulePaths) {
    this.modulePaths = modulePaths
  }

  addPathConverter (convert, revert) {
    const self = this
    const originalClientRunnerGetTestSource = ClientRunner.prototype.getTestSource

    ClientRunner.prototype.getTestSource = function () {
      ClientRunner.prototype.getTestSource = originalClientRunnerGetTestSource
      const originalArgv = _.cloneDeep(this.argv)
      const originalSettings = _.cloneDeep(this.settings)

      if (this.argv._source.length) {
        this.argv._source[0] = convert(this.argv._source[0])
      } else if (this.argv.test) {
        this.argv.test = convert(this.argv.test)
      } else {
        this.settings.src_folders = self.modulePaths
      }
      self.nightwatchArgv = this.argv

      self.testSource = ClientRunner.prototype.getTestSource.apply(this, arguments)

      if (this.settings.parallelMode) {
        return self.testSource
      }

      this.argv = originalArgv
      this.settings = originalSettings
      this.settings.src_folders = this.settings.src_folders || []
      return ClientRunner.prototype.getTestSource.apply(this, arguments)
    }

    hookUtils.addHookBefore(ChildProcess.prototype, 'getArgs', function () {
      const cliArgs = this.args
      const testIndex = cliArgs.indexOf('--test') + 1
      cliArgs[testIndex] = revert(cliArgs[testIndex])
    })
  }

  addHookAfterChildProcesses (hook) {
    hookUtils.addCallbackedHookAfter(ClientRunner.prototype, 'startChildProcesses', 1, hook)
  }

  isRunningInParallel () {
    return process.env.__NIGHTWATCH_PARALLEL_MODE === '1'
  }

  getWorkerIndex () {
    return process.env.__NIGHTWATCH_ENV_KEY.split('_').pop()
  }

  * executeInNightwatchContext (fn, args) {
    yield new Promise((resolve, reject) => {
      const nightwatch = this.client.api()
      this.client.on('error', reject)
      nightwatch.perform(() => {
        try {
          this.client.get().results.lastError = null
          fn.apply(nightwatch, args)
        } catch (err) {
          this.client.removeListener('error', reject)
          return reject(err)
        }
      })
      nightwatch.perform(() => {
        this.client.removeListener('error', reject)
        const lastError = this.client.get().results.lastError
        if (lastError) {
          lastError.stack = [lastError.message, lastError.stack].join('\n')
          return reject(lastError)
        }
        resolve()
      })
      this.client.start()
    })
  }

  addTestRunner (run) {
    const self = this
    const originalRunnerRun = Runner.prototype.run

    Runner.prototype.run = co.wrap(function * () {
      const that = this
      let error
      let originalTerminate
      let executionSuccess
      const originalOptions = _.cloneDeep(this.options)
      const originalAdditionalOpts = _.cloneDeep(this.additionalOpts)
      this.additionalOpts.output_folder = false
      this.options.output = false
      this.options.tag_filter = undefined
      this.options.screenshots.enabled = false

      try {
        const modules = yield new Promise((resolve, reject) => {
          Runner
            .readPaths(self.testSource, that.options)
            .spread(function (modulePaths, fullPaths) {
              resolve(modulePaths)
            }).then(resolve, reject)
        })
        self._startSession(this.options)
        const client = self.client.get()
        originalTerminate = client.terminate
        client.terminate = () => {}
        executionSuccess = yield * run(modules)
      } catch (err) {
        error = err
      }

      try {
        if (self.client) {
          self.client.get().terminate = originalTerminate
          yield * self._closeSession()
        }
      } catch (err) {
        error = err
      }

      if (typeof process.send === 'function') {
        process.send(JSON.stringify({
          type: 'testsuite_finished',
          itemKey: process.env.__NIGHTWATCH_ENV_LABEL,
          moduleKey: 'moduleKey',
          results: {
            completed: {
              ok: 1
            }
          },
          errmessages: []
        }))
      }

      this.additionalOpts = originalAdditionalOpts
      this.options = originalOptions

      if (!originalAdditionalOpts.src_folders || !originalAdditionalOpts.src_folders.length || error || !executionSuccess) {
        return this.doneCb(error || !executionSuccess, {})
      }

      return originalRunnerRun.apply(this, arguments)
    })
  }
}
