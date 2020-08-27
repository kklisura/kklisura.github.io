---
layout: post
title: 'Social login for SPAs via SpringBoot and Ember.js'
tags:
  - java
  - spring-boot
  - login
  - social
  - spa
  - emberjs
---

I want to write Single Page Application (SPA) with Java, SpringBoot backend and following requirements:
 - Login via API (`/api/v1/login`) by using credentials (user/password combination)
 - Logout via API (`/api/v1/logout`)
 - Signup and login via Social networks
 - Linking and unlinking of social networks once user is logged in
 - Support for following social networks: Github, Facebook, Google and Twitter
 - Separate entities for accounts and social (*external*) accounts

I'm not aware of any out-of-the-box solution that would solve all of these, so I decided to write my own. It was initially part of one of my private project, that I unfortunately abandoned, so I thought it would be shame not to publish it. Hopefully, it may help someone or one might learn something new.

The example project is [here](https://github.com/kklisura/spring-spa-login). It's a SpringBoot based backend application with an Ember.js fronted (located under `/frontend` dir.). It uses H2 as a database so accounts can be easily preserved.

As per requirements, there are separate entities for accounts and external accounts. Separation of the accounts and external accounts enable users to link and login via multiple social accounts.

Account entities have some basic user attributes i.e. display name, username, password and email. Password is there to enable login via supplied credentials, although no manual account creation is possible at the moment (it's very easy to add it if needed). 

## Login and logout via REST

Login via supplied credentials is possible by posting JSON containing `username` and `password` properties, which following curl snippet does:

```bash
curl --include \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{"username": "admin","password":"123456"}' \
  http://localhost:8080/api/v1/login
```

On successful login `204 No Content` is returned with appropriate `Set-cookie` header used to track user sessions. Since this is REST based API, an invalid login returns `401 Unauthorized` status with following JSON body:

```json
{
  "code": 401,
  "message": "The username/email or password you entered is incorrect. Please try again.",
  "status": "UNAUTHORIZED",
  "timestamp": "11-12-2018 01:04:10"
}
```

Codewise, login and logout API was added via [RestLoginConfigurer](https://github.com/kklisura/spring-spa-login/blob/1a12ef9f48c74aa0afe1ac47d08a23ecc34e9ef0/src/main/java/com/github/kklisura/spring/spa/configuration/configurers/RestLoginConfigurer.java) and [RestLogoutConfigurer](https://github.com/kklisura/spring-spa-login/blob/1a12ef9f48c74aa0afe1ac47d08a23ecc34e9ef0/src/main/java/com/github/kklisura/spring/spa/configuration/configurers/RestLogoutConfigurer.java), in [SecurityConfiguration](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/SecurityConfiguration.java#L102-L105):

```java
// Setup REST login and logout
http.apply(new RestLoginConfigurer<>(objectMapper))
    .and()
    .apply(new RestLogoutConfigurer<>());
```

`RestLoginConfigurer` adds [RestLoginFilter](https://github.com/kklisura/spring-spa-login/blob/1a12ef9f48c74aa0afe1ac47d08a23ecc34e9ef0/src/main/java/com/github/kklisura/spring/spa/configuration/security/rest/filters/RestLoginFilter.java) that's similar to `UsernamePasswordAuthenticationFilter` provided by `spring-boot-starter-security` (`spring-security-web` specifically) with a major difference being parsing an input body as JSON. Since `RestLoginFilter` delegates authentication to underlying authentication manager, a `userDetailsService` and `passwordEncoder` need to be set when configuring `AuthenticationManagerBuilder`.

As for `RestLogoutConfigurer`, it delegates configuration to `LogoutConfigurer` provided by `spring-boot-starter-security` (`spring-security-config` specifically) with pre-set properties of `logoutRequestMatcher` set to `/api/v1/logout` and `logoutSuccessHandler` set to handler which just returns `204 No Content`, since we're dealing with REST API.

## Social login via OAuth{1,2}

When attempting social login a popup window is opened pointing to either `/oauth2/authorization/{github,facebook,google}` or `/oauth1/authorization/twitter`, since they use different authentication mechanisms. Just before opening new popup window, two handlers are being installed on `window` object, seen [here](https://github.com/kklisura/spring-spa-login/blob/master/frontend/app/utils/auth.js#L50-L51). After finishing OAuth flow, either successfully or not, appropriate page will be rendered, which is handled by the [ExternalLoginController](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/controllers/external/login/ExternalLoginController.java). These end pages will actually call those installed handlers in order to signal parent window that auth process is completed.

The process of configuring OAuth authentication is done by applying [OAuth2Configurer](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/configurers/OAuth2Configurer.java) for Github, Facebook and Google or [TwitterLoginConfigurer](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/configurers/TwitterLoginConfigurer.java) for Twitter in [SecurityConfiguration](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/SecurityConfiguration.java#L107-L115):

```java
// Setup OAuth2 for Facebook, Google, Github
if (oAuth2AuthorizedClientService != null) {
  http.apply(new OAuth2Configurer<>(externalAccountService, oAuth2AuthorizedClientService, accountService));
}

// Setup OAuth1 for Twitter (if the client-is is present)
if (StringUtils.isNotEmpty(twitterService.getTwitterClientRegistration().getClientId())) {
  http.apply(new TwitterLoginConfigurer<>(twitterService, externalAccountService));
}
```

The `OAuth2Configurer` is pretty simple. It delegates *real* configuration to `OAuth2LoginConfigurer` provided by `spring-boot-starter-security` (`spring-security-config` specifically) and adds [AuthenticationPreserveFilter](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/filters/AuthenticationPreserveFilter.java), for preserving authentication context. This is used for linking social accounts to an existing (currently logged in) accounts. If the user is already logged, after opening popup window for linking social accounts, the current authentication object is preserved by this filter, so on the success handler (after OAuth flow) the previous authentication context will be restored and the associated account will be used to link to an external account.

The custom success and failure handler are set on the `OAuth2LoginConfigurer`. The failure handler just redirects to failure url, which renders failure page in `ExternalLoginController`. The success handler, implemented by [OAuth2SuccessHandler](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/oauth2/handlers/OAuth2SuccessHandler.java) is a bit complex. If firstly checks if there is previous authentication context present and if it is, it will use an account associated with that authentication context to link an external account (the external account will either be created or previous will be used). After this authentication context will be restored, so user can still be signed-in user. If there is no previous authentication context, the user is either trying to login or signup. An external account will be searched given an identifier provided by the external service (social network). If the external account is found, an associated account will be used for creating new authentication context - effectively logging in user. If the external account is not found, an account will be searched given an email provided by the external service. If the account is found, a new external account will be created and linked to an existing account and new authentication context will be created, again, logging in user. If the account is not found, a new account will be created as this indicates signup. The newly created account will use information provided from the external service like display name, username and email.

Now, this is lot of work to be done by the [OAuth2SuccessHandler](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/oauth2/handlers/OAuth2SuccessHandler.java), so implementation wise, some these things are handled by separate classes, adhering to [SRP](https://en.wikipedia.org/wiki/Single_responsibility_principle), ie. [ExternalAccountService](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/services/accounts/impl/ExternalAccountServiceImpl.java) - manages account-external account connection and [ExternalAccountInfoSupplier](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/services/ExternalAccountInfoSupplier.java) - manages information supplied by the social network.

[TwitterLoginConfigurer](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/configurers/TwitterLoginConfigurer.java), just like `OAuth2Configurer`, adds [AuthenticationPreserveFilter](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/filters/AuthenticationPreserveFilter.java). It also adds [TwitterAuthorizationRequestRedirectFilter](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/twitter/filters/TwitterAuthorizationRequestRedirectFilter.java) - which is used to build redirection URL since Twitter uses OAuth1 for authentication and [TwitterCallbackFilter](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/twitter/filters/TwitterCallbackFilter.java) - which differentiates success and failure and does similar what [OAuth2SuccessHandler](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/oauth2/handlers/OAuth2SuccessHandler.java) or [OAuth2FailureHandler](https://github.com/kklisura/spring-spa-login/blob/master/src/main/java/com/github/kklisura/spring/spa/configuration/security/oauth2/handlers/OAuth2FailureHandler.java) do. These should probably be refactored into single class and reused for both OAuth1 and OAuth2, since they are now separated and they basically do same things.

One thing, worthy of mentioning, is that when account creation happens on sign-up, a username supplied from external service is used if available and if not a username is generated by combining first and last name of the user. If the username is taken, an index will be added to username in order to find first unused username so account can be created with unique username.

## Exposed APIs

The following is a list of all APIs exposed by the backend:

 - `POST /api/v1/login` - Logs in user provided by its username and password.
 - `POST /api/v1/logout` - Logout currently logged-in user.
 - `GET /api/v1/accounts/me` - Fetches the currently logged in user, if any.
 - `DELETE /api/v1/accounts/{id}/external-account/{externalAccountId}` - Unlinks an external account.

## Output

Here's how it all looks like from user perspective:

<img src="{{ site.baseurl }}/assets/images/social-login-for-spas-via-springboot-and-emberjs/demo.gif" alt="Login flow" style="width: 100%;"/>

## Conclusion

Feel free to check the code [here](https://github.com/kklisura/spring-spa-login). Unfortunately there are no unit tests for this, as I haven't had time for writing them. Also, feel free to contact me if I've done something wrong and there's simpler way to do this or you just wanna say hi.

As this is my first blog post, it might not be top quality, so I hope you don't mind. I'm still in process of learning how to write these. Anyways, thanks for reading! :)
