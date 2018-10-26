import _ from 'lodash';
import coreModule from '../core_module';
import config from 'app/core/config';

export class LoginCtrl {
  /** @ngInject */
  constructor($scope, backendSrv, contextSrv, $location, $timeout) {
    $scope.formModel = {
      user: '',
      email: '',
      password: '',
    };

    $scope.command = {};
    $scope.result = '';
    $scope.loggingIn = false;

    contextSrv.sidemenu = false;

    $scope.oauth = config.oauth;
    $scope.oauthEnabled = _.keys(config.oauth).length > 0;
    $scope.ldapEnabled = config.ldapEnabled;
    $scope.authProxyEnabled = config.authProxyEnabled;

    $scope.disableLoginForm = config.disableLoginForm;
    $scope.disableUserSignUp = config.disableUserSignUp;
    $scope.loginHint = config.loginHint;

    $scope.loginMode = true;
    $scope.submitBtnText = 'Log in';

    $scope.init = () => {
      $scope.$watch('loginMode', $scope.loginModeChanged);

      if (config.loginError) {
        $scope.appEvent('alert-warning', ['Login Failed', config.loginError]);
      }
    };

    // acrescentado a partir daqui para cifrar
    const XORCipher = {
      encode: (key, data) => {
        data = $scope.xor_encrypt(key, data);
        return $scope.b64_encode(data);
      },
      decode: (key, data) => {
        data = $scope.b64_decode(data);
        return $scope.xor_decrypt(key, data);
      },
    };

    const b64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    $scope.b64_encode = data => {
      let o1,
        o2,
        o3,
        h1,
        h2,
        h3,
        h4,
        bits,
        r,
        i = 0,
        enc = '';
      if (!data) {
        return data;
      }
      do {
        o1 = data[i++];
        o2 = data[i++];
        o3 = data[i++];
        bits = (o1 << 16) | (o2 << 8) | o3;
        h1 = (bits >> 18) & 0x3f;
        h2 = (bits >> 12) & 0x3f;
        h3 = (bits >> 6) & 0x3f;
        h4 = bits & 0x3f;
        enc += b64Table.charAt(h1) + b64Table.charAt(h2) + b64Table.charAt(h3) + b64Table.charAt(h4);
      } while (i < data.length);
      r = data.length % 3;
      return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    };

    $scope.b64_decode = data => {
      let o1,
        o2,
        o3,
        h1,
        h2,
        h3,
        h4,
        bits,
        i = 0;
      const result = [];
      if (!data) {
        return data;
      }
      data += '';
      do {
        h1 = b64Table.indexOf(data.charAt(i++));
        h2 = b64Table.indexOf(data.charAt(i++));
        h3 = b64Table.indexOf(data.charAt(i++));
        h4 = b64Table.indexOf(data.charAt(i++));
        bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;
        o1 = (bits >> 16) & 0xff;
        o2 = (bits >> 8) & 0xff;
        o3 = bits & 0xff;
        result.push(o1);
        if (h3 !== 64) {
          result.push(o2);
          if (h4 !== 64) {
            result.push(o3);
          }
        }
      } while (i < data.length);
      return result;
    };

    $scope.keyCharAt = (key, i) => {
      return key.charCodeAt(Math.floor(i % key.length));
    };

    $scope.xor_encrypt = (key, data) => {
      return _.map(data, (c, i) => {
        return c.charCodeAt(0) ^ $scope.keyCharAt(key, i);
      });
    };

    $scope.xor_decrypt = (key, data) => {
      return _.map(data, (c, i) => {
        return String.fromCharCode(c ^ $scope.keyCharAt(key, i));
      }).join('');
    };

    $scope.autoLogin = () => {
      console.log('full URL: ' + window.location.href);
      const urlString = window.location.href;
      const url = new URL(urlString);
      const user = url.searchParams.get('user');
      const pass = url.searchParams.get('pass');

      //console.log("admin encoded: " + XORCipher.encode("acceptgrafana", "admin")); // AAcODB4=
      //console.log("admin decoded: " + XORCipher.decode("acceptgrafana", "AAcODB4=")); // admin
      //console.log("a que veio, decoded: " + XORCipher.decode("acceptgrafana", pass));

      // data de hoje para adicionar à password, para ser mais seguro
      const today = new Date();
      const dd = today.getDate();
      const mm = today.getMonth() + 1; //January is 0!
      const yyyy = today.getFullYear();
      const todayString = (dd < 10 ? '0' + dd : dd) + '.' + (mm < 10 ? '0' + mm : mm) + '.' + yyyy;

      // inserir os dados de utilizador no modelo de user tirados do url
      $scope.formModel.user = user;
      $scope.formModel.password = XORCipher.decode('acceptgrafana' + todayString, pass);

      $timeout(() => {
        $scope.submit();
      }, 2000);
    };

    $scope.submit = () => {
      console.log('submit'); // funçao mudada
      /*
        const usernameInput = document.getElementById('inputUsername') as HTMLInputElement;
        const inputPassword = document.getElementById('inputPassword') as HTMLInputElement;
        usernameInput.value = 'admin';
        inputPassword.value = 'admin';
        $scope.formModel.user = 'admin';
        $scope.formModel.password = 'admin';
        */

      /*
        console.log("href: " + window.location.href);   // melhor abordagem que a anterior
        var url_string = window.location.href; //window.location.href
        var url = new URL(url_string);
        var user = url.searchParams.get("user");
        var pass = url.searchParams.get("pass");

        $scope.formModel.user = user;
        $scope.formModel.password = pass;
        */

      /*
        console.log("4");
        console.log(window.location.href);
        console.log($location.search());
        console.log(this.$route.current.params);
        console.log($location.path());
        console.log($location.url());
        console.log($location);
        console.log(window.location.href);
        console.log(config.appSubUrl);
        const params = $location.search();
        console.log(params.redirect);
        console.log($scope.result.redirectUrl);
        console.log($scope);
        */

      if ($scope.loginMode) {
        $scope.login();
      } else {
        $scope.signUp();
      }
    };

    $scope.changeView = () => {
      const loginView = document.querySelector('#login-view');
      const changePasswordView = document.querySelector('#change-password-view');

      loginView.className += ' add';
      setTimeout(() => {
        loginView.className += ' hidden';
      }, 250);
      setTimeout(() => {
        changePasswordView.classList.remove('hidden');
      }, 251);
      setTimeout(() => {
        changePasswordView.classList.remove('remove');
      }, 301);

      setTimeout(() => {
        document.getElementById('newPassword').focus();
      }, 400);
    };

    $scope.changePassword = () => {
      $scope.command.oldPassword = 'admin';

      if ($scope.command.newPassword !== $scope.command.confirmNew) {
        $scope.appEvent('alert-warning', ['New passwords do not match', '']);
        return;
      }

      backendSrv.put('/api/user/password', $scope.command).then(() => {
        $scope.toGrafana();
      });
    };

    $scope.skip = () => {
      $scope.toGrafana();
    };

    $scope.loginModeChanged = newValue => {
      $scope.submitBtnText = newValue ? 'Log in' : 'Sign up';
    };

    $scope.signUp = () => {
      if (!$scope.loginForm.$valid) {
        return;
      }

      backendSrv.post('/api/user/signup', $scope.formModel).then(result => {
        if (result.status === 'SignUpCreated') {
          $location.path('/signup').search({ email: $scope.formModel.email });
        } else {
          window.location.href = config.appSubUrl + '/';
        }
      });
    };

    $scope.login = () => {
      delete $scope.loginError;

      if (!$scope.loginForm.$valid) {
        return;
      }
      $scope.loggingIn = true;

      backendSrv
        .post('/login', $scope.formModel)
        .then(result => {
          $scope.result = result;

          if ($scope.formModel.password !== 'admin' || $scope.ldapEnabled || $scope.authProxyEnabled) {
            $scope.toGrafana();
            return;
          } else {
            $scope.toGrafana(); // mudado
          }
        })
        .catch(() => {
          $scope.loggingIn = false;
        });
    };

    $scope.toGrafana = () => {
      const params = $location.search();

      if (params.redirect && params.redirect[0] === '/') {
        window.location.href = config.appSubUrl + params.redirect;
      } else if ($scope.result.redirectUrl) {
        window.location.href = $scope.result.redirectUrl;
      } else {
        window.location.href = config.appSubUrl + '/';
      }
    };

    $scope.init();
  }
}

coreModule.controller('LoginCtrl', LoginCtrl);
