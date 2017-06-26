(function () {
  'use strict'

  function AuthenticationService ($http, $window, sharedApiService, $rootScope, UserModel, localStorage) {
    this.UserModel = UserModel
    this.$http = $http
    this.$window = $window
    this.sharedApiService = sharedApiService
    this.$rootScope = $rootScope
    this.user = null
    this.localStorage = localStorage
    _init()
  }

  AuthenticationService.prototype.updateUser = function (id) {
    return this.sharedApiService.get(`/users/${id}`).then((user) => {
      this.user.update(user)
      this.$rootScope.$emit('auth:user:updated')
    })
  }

  /**
   * @param login
   * @param password
   * @returns {Object}
   */
  AuthenticationService.prototype.login = function (login, password) {
    return this.sharedApiService
      .post('/auth/signin', {
        username: login,
        password: password
      })
      .then((data) => {
        let user = data.data
        this.setUser(user)
        this.$rootScope.$emit('auth:login:success')
        // this.localStorage.setItem("token", data);
        return data
      })
  }

  AuthenticationService.prototype.logout = function () {
    return this.sharedApiService.get('/auth/logout').then(function () {
      _erasePersistence()
      _eraseUser()
      return Promise.resolve()
    })
  }

  AuthenticationService.prototype.getUser = function () {
    return this.user
  }

  AuthenticationService.prototype.setUser = function (data) {
    this.user = new this.UserModel(data)
    _persistData(data)
    return this
  }

  AuthenticationService.prototype.isAuth = function () {
    return !(this.user === null)
  }

  AuthenticationService.prototype.resolveAuth = function () {
    if (this.isAuth()) {
      return Promise.resolve(this)
    }
    return Promise.reject({code: 'UNAUTHENTICATED'})
  }

  AuthenticationService.prototype.clearCredentials = function () {

  }

  function _persistData (data) {
    window.sessionStorage['user'] = data.id
  }

  function _erasePersistence () {
    delete window.sessionStorage['user']
  }

  function _eraseUser () {
    this.user = null
  }

  function _init () {
    if (window.sessionStorage['userInfo']) {
      this.setUser(JSON.parse(window.sessionStorage['user']))
      console.log('authenticationService userInfo found', this.getUser())
    }
  }

  angular
    .module('app.shared')
    .provider('authenticationService', function () {
      let UserModel = null
      this.setUserModel = function (model) {
        UserModel = model
      }
      this.$get = function ($http, $window, sharedApiService, $rootScope) {
        return new AuthenticationService($http, $window, sharedApiService, $rootScope, UserModel)
      }
    })
})()