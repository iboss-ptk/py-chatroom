"use strict";

angular.module('ChatCtrl', [])

.controller('ChatCtrl',
  function (
  $scope
  , $state
  , $stateParams
  , User
  , Group
  , Message
  , messages) {

    var s = $scope;

    s.err = {}

    // resolved from Message (in routing.js)
    s.messages = messages;
    console.log('messages', s.messages);

    s.Send = function (content) {
      Message.Send({
        group_name: $stateParams.groupName
      })
        .then(function (res) {
          // sending done!
          // do nothing perhaps.
        }, function (err) {
          console.log('err', err);
        });
    }

  }
)

"use strict";

angular.module('Group', [])

.factory('Group', function (User, Caller, $q) {
  return {
    Create: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = User.GetToken();
      Caller.Call('group.create', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    }
  }
})

"use strict";

angular.module('GroupsCtrl', [])

.controller('GroupsCtrl',
  function (
    $scope
  , $state
  , User
  , Group) {

    var s = $scope;

    s.err = {}

    s.groups = User.GetGroup();
    console.log('groups', s.groups)

  }
)

"use strict";

angular.module('LoginCtrl', [])

.controller('LoginCtrl',
  function (
    $scope
  , $state
  , User) {

    var s = $scope;

    s.err = {}

    s.Login = function (username, password) {
      // clear error
      s.err = {}
      // validate
      if (!username) {
        s.err.username = true;
        return;
      }

      if (!password) {
        s.err.password = true;
        return;
      }
      // make request
      User.Login({
        username: username,
        password: password,
      })
        .then(function (res) {
          // login success
          console.log('res', res);
          // redirect to groups
          $state.go('messenger.groups');
        }, function (err) {
          // login error
          console.log('err', err);
          // show error
          s.err.username = s.err.password = true
        });
    }

    s.Register = function () {
      // redirect to register
      $state.go('register');
    }
  }
)

"use strict";

angular.module('Message', [])

.factory('Message', function (User, Caller, $q) {
  return {
    Send: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = User.GetToken();
      Caller.Call('message.send', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    GetUnread: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = User.GetToken();
      Caller.Call('message.get_unread', req, function (res) {
        if (res.success === true) {
          deferred.resolve(res.unread_msg);
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    }
  }
})

"use strict";

angular.module('MessengerCtrl', [])

.factory('MessengerService',
  function () {
    return {

    }
  })

.controller('MessengerCtrl',
  function (
    $scope
  , $timeout
  , $state
  , User
  , Group) {

    console.log('aoeuaoeuao');
    var s = $scope;
    // expose $state to the view
    s.$state = $state;
    // all errors in this page are here
    s.err = {};

    // Logout
    s.Logout = function () {
      User.Logout()
        .then(function (res) {
          // logout success
          console.log('logout success');
          // redirect to login
          $state.go('login');
        }, function (err) {
          // logout err
          console.log('logout fail', err);
        });
    };

    // Creating a new group encapsulation
    (function () {
      var createModal = $('#messenger-create-group');
      // local errors
      s.err.create = {};
      // data models
      s.craete = {};

      s.AskCreate = function () {
        // use timeout just get over the angular's warning message
        $timeout(function () {
          createModal
            .modal({
              onApprove: function () {
                // prevent this modal from closing
                return false;
              },
            })
            .modal('show');
        });
      };

      s.Create = function (group_name) {
        // clear errors
        s.err.create = {};
        // validate
        if (!group_name) {
          s.err.create.group_name = true;
          return;
        }
        // make request
        Group.Create({
          group_name: group_name
        })
          .then(function (res) {
            // success
            // make a new group list

            // hide modal
            createModal.modal('hide');
          }, function (err) {
            // err
            err.forEach(function (each) {
              switch (each) {
                case 'duplicated_group_name':
                  s.err.create.group_name = true;
                  break;
                default:
                  console.log('err', each);
                  break;
              }
            });
          });
      }
    }());

    // Leaving a group encapsulation
    (function () {
      var leaveModal = $('#messenger-leave-group');
      var groupNotDefinedModal = $('#messenger-leave-not-defined-group');
      // local errors
      s.err.leave = {};

      s.AskLeave = function () {
        // only at 'messenger.chat' can take this action
        if ($state.current.name !== 'messenger.chat') {
          return;
        }

        $timeout(function () {
          leaveModal
            .modal({
              onApprove: function () {
                // prevent this modal from closing
                return false;
              },
            })
            .modal('show');
        });
      };

      s.Leave = function (group_name) {
        // clear errors
        s.err.leave = {};
        // validate
        if (!group_name) {
          // notice the user
          // leave modal will be auto hidden by this command
          groupNotDefinedModal.modal('show');
          return;
        }
        // make request
        User.leave({
          group_name: group_name
        })
          .then(function (res) {
            // success
            // remove this group from the array

            // hide leave modal
            leaveModal.modal('hide');
          }, function (err) {
            // fail
            err.forEach(function (each) {
              console.log('err', each);
            })
          })
      };
    }());

  })

"use strict";

angular.module('RegisterCtrl', [])

.controller('RegisterCtrl',
  function (
    $scope
  , $state
  , User) {
    var s = $scope;

    s.err = {}

    s.Login = function () {
      // redirect to login
      $state.go('login');
    }

    s.Register = function (username, password, disp_name) {
      // clear error
      s.err = {}
      // validate
      if (!disp_name) {
        s.err.disp_name = true;
        return;
      }

      if (!username) {
        s.err.username = true;
        return;
      }

      if (!password) {
        s.err.password = true;
        return;
      }

      // make request
      User.Register({
        username: username,
        password: password,
        disp_name: disp_name,
      })
        .then(function (res) {
          // register success
          console.log('res', res);
          // take login
          User.Login({
            username: username,
            password: password,
          })
            .then(function (res) {
              // redirect to groups
              $state.go('messenger.groups');
            }, function (err) {
              // login error occured
              console.log('err', err);
            })
        }, function (err) {
          // register err
          err.forEach(function (val) {
            // each err
            switch (val) {
              case 'duplicated_username':
                // do something here
                s.err.username = true;
                break;
            }
          });
        })
    }
  }
)

"use strict";

angular.module('User', [])

.factory('User', function (Caller, $q) {
  // storage namespace
  var namespace = '_chatroomjs_';
  // browser's storage
  // localStorage is key, value and string based
  var storage = localStorage;

  // password salt
  // even an intruder knows this (and he will)
  // he has no choice but to use brute-force or dictionary attack
  // but not rainbow table :D
  // ::please don't change this!
  var salt = '927RV6ggf7loy13U';

  // Token encapsulation
  var token = (function () {
    // this is jwt token
    // client just has to keep it
    // and sends it to the sever on every request
    var jwtToken = null;
    // check local storage for old token
    // var storedToken = storage[namespace + 'token'];
    // if (storedToken) {
    //   jwtToken = storedToken;
    // }

    return {
      Get: function () { return jwtToken; },
      Set: function (_token) {
        // upadet both jwtToken and Local Storage Token
        jwtToken = _token;
        storage[namespace + 'token'] = _token;
      },
    }
  }());

  var UserObj = (function() {
    var UserObj = null;
    // check local storage for old UserObj
    // var storedUserObj = storage[namespace + 'UserObj'];
    // if (storedUserObj) {
    //   UserObj = JSON.parse(storedUserObj);
    // }

    return {
      Get: function () { return UserObj; },
      Set: function (_UserObj) {
        // update both in mem and in local storage
        UserObj = _UserObj;
        storage[namespace + 'UserObj'] = JSON.stringify(_UserObj);
      },
    }
  }());

  return {
    GetToken: function () {
      return token.Get();
    },

    GetUserObj: function () {
      return UserObj.Get();
    },

    Login: function (req) {
      var deferred = $q.defer();

      // hash the password first!
      // hash with sha256 (sha2)
      var hasher = new Hashes.SHA256
      // salt the password
      var salted = req.password + salt;
      // encode in base64
      req.password = hasher.b64(salted);

      Caller.Call('user.login', req, function (res) {
        if (res.success === true) {
          // save return token
          token.Set(res._token);
          // save return UserObj
          UserObj.Set(res.UserObj);

          deferred.resolve(res.UserObj);
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Register: function (req) {
      var deferred = $q.defer();

      // hash the password first!
      // hash with sha256 (sha2)
      var hasher = new Hashes.SHA256
      // salt the password
      var salted = req.password + salt;
      // password is hashed in base64 format
      req.password = hasher.b64(salted);

      Caller.Call('user.register', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Join: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token.Get();
      Caller.Call('user.join', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Leave: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token.Get();
      Caller.Call('user.leave', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Pause: function (req) {
      var deferred = $q.defer();
      // append _token to the request
      req._token = token.Get();
      Caller.Call('user.pause', req, function (res) {
        if (res.success === true) {
          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    Logout: function () {
      var deferred = $q.defer();
      // fabricate the request
      var req = {
        _token: token.Get(),
      };
      Caller.Call('user.logout', req, function (res) {
        if (res.success === true) {
          // clear token
          token.Set(null);
          // clear UserObj
          UserObj.Set(null);

          deferred.resolve();
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },

    GetGroup: function () {
      var deferred = $q.defer();
      // fabricate the request
      var req = {
        _token: token.Get(),
      };

      Caller.Call('user.get_group', req, function (res) {
        if (res.success === true) {
          deferred.resolve(res.GroupObjList);
        }
        else {
          deferred.reject(res.err_msg);
        }
      });

      return deferred.promise;
    },
  }
})

"use strict";

angular.module('app', [
  'ngAnimate',
  'angular-velocity',
  'ui.router',
  'btford.socket-io',
  // Routing
  'routing',
  // Directives
  'directives',
  // Models
  'User',
  'Group',
  'Message',
  // Pages
  'LoginCtrl',
  'RegisterCtrl',
  'MessengerCtrl',
  'GroupsCtrl',
  'ChatCtrl',
])

.run(
  function (
    $rootScope,
    $state,
    ROLES,
    User
  ) {

    // this block of code controls the routing's permission
    $rootScope.$on('$stateChangeStart', function (event, next, current) {
      // no authorization section mentioned
      console.log('restrictions', next.restrictions);
      if (!next.restrictions) {
        return;
      }

      // read each restriction of the next page
      var myRole = User.GetToken() === null ? ROLES.guest : ROLES.member;
      console.log('myRole', myRole);
      next.restrictions.forEach(function (each) {
        if ((each.authorized & myRole) === 0) {
          // access denied
          // follow the 'no' part (if any)
          if (each.no) {
            // stop going
            event.preventDefault();
            // change to this route
            $state.go(each.no);
          }
        }
        else {
          // access granted
          // follow the 'yes' part (if any)
          if (each.yes) {
            // stop going
            event.preventDefault();
            // change to this route
            $state.go(each.yes);
          }
        }
      });
    });
  }
)

.factory('socket', function (socketFactory) {
  return socketFactory();
})

.factory('Caller', function (socket) {
  // create a unique string by keeping adding up the running_id
  var runningId = 0;
  function GetUniqueId() {
    runningId += 1;
    return '_event_' + runningId;
  }

  return {
    // this method automate socket emit and socket once
    // for requesting
    Call: function (event, data, callback) {
      var returnEvent = GetUniqueId();
      // append _event to the request
      data._event = returnEvent;
      // emit
      socket.emit(event, data);
      // wait for the return
      // send it to callback function
      socket.once(returnEvent, function (res) {
        callback(res);
      });
    }
  }
})

"use strict";

angular.module('directives', [])

// set vertical alignment of items inside a given element to be middle
.directive('verticalMiddle', function () {
  return {
    restrict: 'EA',
    templateUrl: '/html/vertical-middle.html',
    transclude: true,
    link: function (scope, element, attrs) {
      var $element = $(element);

      var height = $element.height() + 'px';
      $element.css({
        'line-height': height,
        'height': height
      });

      $element.children('.vertical-middle').css({
        'display': 'inline-block',
        'line-height': 'normal',
        'vertical-align': 'middle',
        'width': '100%',
        'max-height': '100%'
      });

      $element.find('.vertical-middle-content').css({
        'max-height': '100%'
      });
    }
  }
})

.directive('popup', function () {
  return {
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var $element = $(element);
      $element.popup({
        inline: true,
        hoverable: true,
        position: 'bottom center',
        delay: {
          show: 300,
          hide: 800,
        },
      });
    },
  }
})

// resize the div in the groups.jade to fit the window
.directive('listColumn', function () {
  return {
    restrict: 'EA',
    link: function (scope, element, attrs) {
      var $window = $(window);
      var $element = $(element);
      var $mainNav = $('#main-nav');

      $window.resize(function () {
        var availWidth = $window.width() - $mainNav.width();
        $element.attr('style', 'width:' + availWidth + 'px !important');
      })
        // trigger window resize
        .resize();
    }
  }
})

// var socket = io();
// var offset = 0;
// var h = 0;
// var sentmsg = ''; // to be change later



// var name = prompt("your name");
// socket.emit('addUser', name);

// var room = prompt("select room");
// socket.emit('addRoom', room);

// function scrollToBottom() {
//   var h = $('#msgpane')[0].scrollHeight;
//   $('#msgpane').animate({ scrollTop: h }, 100);
// }


// $('form').submit(function(){
//   if (!$('#m').val().trim()){
//     return false;
//   }
//   socket.emit('chatmsg', $('#m').val());
//   sentmsg = $('#m').val();
//   $('#m').val('');
//   $('#m').focus();
//   return false;
// });


// socket.on('chatmsg', function(msg){
//   if (sentmsg == msg) {
//     $('#messages').append($('<div>').text(msg).addClass('mymsg'));
//   } else {
//     $('#messages').append($('<div>').text(msg));
//   }
//   $('#messages').append('<br>');
//   scrollToBottom();
// });

"use strict";

angular.module('routing', [])

.constant('ROLES', {
  guest: parseInt('01', 2),
  member: parseInt('10', 2),
})

.config(
  function (
    $stateProvider,
    $urlRouterProvider,
    ROLES
  ) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'html/login.html',
        controller: 'LoginCtrl',
      })
      .state('register', {
        url: '/register',
        templateUrl: 'html/register.html',
        controller: 'RegisterCtrl',
      })
      .state('messenger', {
        templateUrl: 'html/messenger.template.html',
        controller: 'MessengerCtrl',
      })
      .state('messenger.groups', {
        url: '/groups',
        templateUrl: 'html/groups.html',
        controller: 'GroupsCtrl',
        // restrict that only members can get access
        // to this page
        // restrictions: [
        //   { authorized: ROLES.member,
        //     // if the user is not member, go to 'login' state
        //     no: 'login' }
        // ],
      })
      .state('messenger.chat', {
        url: '/chat/:groupName',
        templateUrl: 'html/chat.html',
        controller: 'ChatCtrl',
        // restrict that only members can get access
        // to this page
        // restrictions: [
        //   { authorized: ROLES.member,
        //     // if the user is not member, go to 'login' state
        //     no: 'login' }
        // ],
        // the following block of code must be done before loading the state
        resolve: {
          messages: function (Message, $state, $stateParams) {
            console.log('aoeuaoeu');
            // we have to check whether the group exists or not
            return Message.GetUnread({
              group_name: $stateParams.groupName,
            })
              .then(null, function (err) {
                console.log('err', err);
                // tell the user that he's requesting the unknown group
              });
          }
        },
      })
  }
)
